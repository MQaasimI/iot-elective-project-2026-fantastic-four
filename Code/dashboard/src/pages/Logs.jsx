import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { auth, db } from "../firebase";
import { ChevronDown, Download, CalendarDays } from "lucide-react";
import * as XLSX from "xlsx";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

// Helper function to safely parse and compare dates without crashing
const getSafeTime = (timeStr) => {
  if (!timeStr) return 0;
  const parsed = new Date(timeStr.replace(" ", "T")).getTime();
  return isNaN(parsed) ? 0 : parsed;
};

// Helper function to convert session startTime (Unix MS) into your "YYYY-MM-DD HH:MM:SS" format
const formatSessionTime = (timestampMs) => {
  const d = timestampMs ? new Date(timestampMs) : new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

function Logs() {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [lecturerClasses, setLecturerClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("ALL");
  
  const [filterType, setFilterType] = useState("DAY"); 
  const [dateValue, setDateValue] = useState("");

  const currentUser = auth.currentUser;

  // =========================
  // 1. LOAD LECTURER
  // =========================
  useEffect(() => {
    if (!currentUser) return;
    const lecturersRef = ref(db, "lecturers");
    onValue(lecturersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const matched = Object.values(data).find(l => l.email === currentUser.email);
      if (matched) setLecturerClasses(Object.keys(matched.classes || {}));
    });
  }, [currentUser]);

  // =========================
  // 2. LOAD STUDENTS
  // =========================
  useEffect(() => {
    onValue(ref(db, "students"), (snapshot) => {
      const data = snapshot.val();
      if (data) setStudents(Object.values(data));
    });
  }, []);

  // =========================
  // 3. LOAD ACTIVE SESSIONS
  // =========================
  useEffect(() => {
    if (!currentUser) return;
    onValue(ref(db, "active_sessions"), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sessions = Object.values(data).filter(s => s.lecturerEmail === currentUser.email);
        setActiveSessions(sessions);
      } else {
        setActiveSessions([]);
      }
    });
  }, [currentUser]);

  // =========================
  // 4. LOAD ATTENDANCES
  // =========================
  useEffect(() => {
    const attendanceRef = ref(db, "attendances");
    onValue(attendanceRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return setAttendance([]);
      const arr = Object.entries(data).map(([id, value]) => ({ id, ...value }));
      setAttendance(arr);
    });
  }, []);

  // ============================================
  // 5. THE CLEAN STATE LOGIC EXECUTION ENGINE
  // ============================================
  const baseAttendance = attendance.filter((item) => {
    if (!item.class) return false;
    return lecturerClasses.includes(item.class);
  });

  let processedAttendance = [];

  const sessionMap = {};
  activeSessions.forEach(s => {
    if (s.class) sessionMap[s.class] = s;
  });

  // PASS 1: Check-in processing
  baseAttendance.forEach(record => {
    const session = sessionMap[record.class];
    let evaluatedStatus = record.status;

    if (session) {
      const startTime = session.startTime || 0;
      const scanTime = getSafeTime(record.timestamp);
      const LATE_THRESHOLD_MS = 60 * 1000;

      if (session.status === "CLOSED") {
        if (record.status === "IN" || record.status === "LATE") {
          evaluatedStatus = "OUT";
        }
      } else if (session.status === "OPEN" && scanTime >= startTime) {
        if (record.status === "IN" && scanTime > startTime + LATE_THRESHOLD_MS) {
          evaluatedStatus = "LATE";
        }
      }
    }

    processedAttendance.push({ ...record, status: evaluatedStatus });
  });

  // PASS 2: Roster sweep for absences
  activeSessions.forEach(session => {
    if (session.status === "CLOSED") {
      const startTime = session.startTime || 0;
      const classRoster = students.filter(s => s.class === session.class);

      // Lock down the timestamp matching this exact session context
      const sessionDateFormatted = formatSessionTime(startTime);

      classRoster.forEach(student => {
        const sNum = String(student.studentNumber || student.studentnumber || "").trim();
        const sName = student.studentName || student.studentname || "Unknown Student";

        if (!sNum) return;

        const hasScannedThisClass = processedAttendance.some(record => {
          const recordNum = String(record.studentNumber || record.studentnumber || "").trim();
          return recordNum === sNum && record.class === session.class;
        });

        if (!hasScannedThisClass) {
          processedAttendance.push({
            id: `absent-${sNum}-${startTime}`,
            studentName: sName,
            studentNumber: sNum,
            class: session.class,
            room: session.room || "Unknown Room",
            status: "ABSENT",
            timestamp: sessionDateFormatted, // FIXED: Using structured session date instead of live ticking loops
          });
        }
      });
    }
  });

  processedAttendance.sort((a, b) => getSafeTime(b.timestamp) - getSafeTime(a.timestamp));

  // =========================
  // 6. FILTER LOGIC
  // =========================
  const filteredAttendance = processedAttendance.filter((item) => {
    const allowedClass = lecturerClasses.includes(item.class);
    const matchesSearch = String(item.studentName || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          String(item.studentNumber || "").includes(searchTerm);
    const matchesClass = selectedClass === "ALL" ? true : item.class === selectedClass;
    
    if (!dateValue) return allowedClass && matchesSearch && matchesClass;

    const itemDate = new Date(item.timestamp.replace(" ", "T"));
    let matchesDate = false;

    if (filterType === "DAY") {
      matchesDate = item.timestamp.startsWith(dateValue);
    } else if (filterType === "WEEK") {
      const [year, weekNum] = dateValue.split("-W");
      const startOfWeek = new Date(year, 0, (weekNum - 1) * 7 + 1);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 7);
      matchesDate = itemDate >= startOfWeek && itemDate < endOfWeek;
    } else if (filterType === "MONTH") {
      matchesDate = item.timestamp.startsWith(dateValue);
    }

    return allowedClass && matchesSearch && matchesClass && matchesDate;
  });

  const exportToExcel = () => {
    if (filteredAttendance.length === 0) return;
    const dataToExport = filteredAttendance.map(entry => ({
      "Student Number": entry.studentNumber,
      "Student Name": entry.studentName,
      "Class": entry.class,
      "Room": entry.room,
      "Status": entry.status === 'OUT' ? 'LEFT' : entry.status === 'IN' ? 'PRESENT' : entry.status,
      "Date": entry.timestamp?.split(" ")[0] || "N/A",
      "Time": entry.timestamp?.split(" ")[1] || "N/A"
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = ws[XLSX.utils.encode_cell({c: C, r: R})];
        if (cell) cell.t = 's';
      }
    }
    ws['!cols'] = [{ wch: 18 }, { wch: 30 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");
    XLSX.writeFile(wb, `Attendance_Report.xlsx`);
  };

  // Group by date for view render
  const grouped = {};
  filteredAttendance.forEach(e => {
    const d = e.timestamp?.split(" ")[0];
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(e);
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex">
      <Sidebar />
      <div className="flex-1 ml-60 px-6 py-5 overflow-y-auto">
        <Topbar title="Attendance Logs" subtitle="View and filter records" showSystem={true} searchTerm={searchTerm} setSearchTerm={setSearchTerm} 
          actionButton={
            <div className="flex gap-2 h-full">
              <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setDateValue(""); }} className="bg-[#18181b] border border-[#27272a] rounded-xl px-3 text-sm text-zinc-300 outline-none hover:border-[#3f3f46] transition cursor-pointer">
                <option value="DAY">Day</option>
                <option value="WEEK">Week</option>
                <option value="MONTH">Month</option>
              </select>
              
              <div className="relative h-full cursor-pointer group" onClick={() => document.getElementById('dateInput').showPicker?.()}>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white pointer-events-none group-hover:text-orange-400 transition">
                  <CalendarDays size={17} />
                </div>
                <input id="dateInput" type={filterType === "DAY" ? "date" : filterType === "WEEK" ? "week" : "month"} value={dateValue} onChange={(e) => setDateValue(e.target.value)} className="h-full bg-[#18181b] border border-[#27272a] rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none cursor-pointer appearance-none hover:border-[#3f3f46] transition [&::-webkit-calendar-picker-indicator]:opacity-0" />
              </div>

              <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="bg-[#18181b] border border-[#27272a] rounded-xl px-4 text-sm text-white outline-none hover:border-[#3f3f46] transition cursor-pointer appearance-none pr-10">
                <option value="ALL">All Classes</option>
                {lecturerClasses.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              
              <button onClick={exportToExcel} className="bg-linear-to-r from-orange-500 to-orange-400 text-black font-bold px-5 py-3 rounded-xl text-sm flex items-center gap-2 hover:from-orange-400 hover:to-orange-300 transition-all">
                <Download size={16} /> Export
              </button>
            </div>
          }
        />

        <div className="space-y-6">
          {Object.entries(grouped).sort(([a], [b]) => new Date(b) - new Date(a)).map(([date, entries]) => (
            <div key={date} className="bg-[#111113] border border-[#1c1c1f] rounded-2xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#27272a] bg-[#18181b] font-semibold">{date}</div>
              <table className="w-full">
                <thead className="bg-[#151518] text-left text-xs text-zinc-500">
                  <tr><th className="px-5 py-3">Student #</th><th className="px-5 py-3">Name</th><th className="px-5 py-3">Class</th><th className="px-5 py-3">Room</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Time</th></tr>
                </thead>
                <tbody>
                  {entries.map(e => (
                    <tr key={e.id} className="border-t border-[#27272a] hover:bg-[#18181b]">
                      <td className="px-5 py-3 text-sm font-mono">{e.studentNumber}</td>
                      <td className="px-5 py-3 text-sm font-medium">{e.studentName}</td>
                      <td className="px-5 py-3 text-sm text-orange-400">{e.class}</td>
                      <td className="px-5 py-3 text-sm text-zinc-400">{e.room}</td>
                      <td className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider">
                        <span className={
                          e.status === 'IN' ? 'text-green-400' : 
                          e.status === 'LATE' ? 'text-blue-400' : 
                          e.status === 'ABSENT' ? 'text-red-400' : 
                          'text-purple-400'
                        }>
                          {e.status === 'OUT' ? 'LEFT' : e.status === 'IN' ? 'PRESENT' : e.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-zinc-500">{e.timestamp?.split(" ")[1]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Logs;