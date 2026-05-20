import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { auth, db } from "../firebase";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";
import LiveFeed from "../components/LiveFeed";
import AttendanceChart from "../components/AttendanceChart";
import SessionPanel from "../components/SessionPanel";

// Safe date parser to avoid standard javascript parsing bugs
const getSafeTime = (timeStr) => {
  if (!timeStr) return 0;
  const parsed = new Date(timeStr.replace(" ", "T")).getTime();
  return isNaN(parsed) ? 0 : parsed;
};

// Converts session startTime (Unix MS) into your "YYYY-MM-DD HH:MM:SS" format
const formatSessionTime = (timestampMs) => {
  const d = timestampMs ? new Date(timestampMs) : new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};

function Dashboard() {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  
  const [lecturerData, setLecturerData] = useState(null);
  const [lecturerClasses, setLecturerClasses] = useState([]);

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
      
      const lecturersArray = Object.values(data);
      const matchedLecturer = lecturersArray.find((l) => l.email === currentUser.email);
      if (!matchedLecturer) return;

      setLecturerData(matchedLecturer);
      const activeClasses = Object.entries(matchedLecturer.classes || {})
        .filter(([_, value]) => value === true)
        .map(([key]) => key);
      setLecturerClasses(activeClasses);
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
      if (!data) {
        setAttendance([]);
        return;
      }
      const attendanceArray = Object.entries(data).map(([id, value]) => ({ id, ...value }));
      setAttendance(attendanceArray);
    });
  }, []);

  // ============================================
  // 5. THE CLEAN EXECUTION ENGINE
  // ============================================
  const lecturerLogs = attendance.filter(item => item.class && lecturerClasses.includes(item.class));
  let finalFeed = [];

  const sessionMap = {};
  activeSessions.forEach(s => {
    if (s.class) sessionMap[s.class] = s;
  });

  // PASS 1: Map raw log status updates safely
  lecturerLogs.forEach(record => {
    const session = sessionMap[record.class];
    let evaluatedStatus = record.status;

    if (session) {
      const startTime = session.startTime || 0;
      const scanTime = getSafeTime(record.timestamp);
      const LATE_THRESHOLD_MS = 60 * 1000; // 1-minute window

      if (session.status === "CLOSED") {
        if (record.status === "IN" || record.status === "LATE") {
          evaluatedStatus = "OUT"; // Safely shifts to LEFT visually on dashboard closure
        }
      } else if (session.status === "OPEN" && scanTime >= startTime) {
        if (record.status === "IN" && scanTime > startTime + LATE_THRESHOLD_MS) {
          evaluatedStatus = "LATE";
        }
      }
    }

    finalFeed.push({ ...record, status: evaluatedStatus });
  });

  // PASS 2: ROSTER SWEEP FOR ABSENTEES (Fixed Context Lookup)
  activeSessions.forEach(session => {
    if (session.status === "CLOSED") {
      const startTime = session.startTime || 0;
      const classRoster = students.filter(s => s.class === session.class);
      const sessionDateFormatted = formatSessionTime(startTime);

      classRoster.forEach(student => {
        const sNum = String(student.studentNumber || student.studentnumber || "").trim();
        const sName = student.studentName || student.studentname || "Unknown Student";

        if (!sNum) return;

        // FIXED: Check the RAW un-mutated database logs (lecturerLogs) instead of finalFeed
        // This ensures scanning in at all guards them from getting hit with an ABSENT override
        const hasScannedThisClass = lecturerLogs.some(record => {
          const recordNum = String(record.studentNumber || record.studentnumber || "").trim();
          return recordNum === sNum && record.class === session.class;
        });

        if (!hasScannedThisClass) {
          finalFeed.push({
            id: `absent-${sNum}-${startTime}`,
            studentName: sName,
            studentNumber: sNum,
            class: session.class,
            room: session.room || "Unknown Room",
            status: "ABSENT",
            timestamp: sessionDateFormatted
          });
        }
      });
    }
  });

  finalFeed.sort((a, b) => getSafeTime(b.timestamp) - getSafeTime(a.timestamp));

  // =========================
  // STATS CARD CALCULATIONS
  // =========================
  const totalScans = finalFeed.length;
  const presentCount = finalFeed.filter((item) => item.status === "IN" || item.status === "LATE").length;
  const outCount = finalFeed.filter((item) => item.status === "OUT").length;
  const absentCount = finalFeed.filter((item) => item.status === "ABSENT").length;

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-60 px-6 py-5 overflow-y-auto">
        <Topbar
          title="Dashboard"
          subtitle="Attendance overview and monitoring"
          showSystem={true}
        />

        <div className="grid grid-cols-4 gap-4 mb-5">
          <StatCard title="Total Scans" value={totalScans} subtitle="Attendance records" color="orange" iconType="activity" />
          <StatCard title="Present/Late" value={presentCount} subtitle="Students checked in" color="green" iconType="users" />
          <StatCard title="LEFT" value={outCount} subtitle="Students checked out" color="purple" iconType="down" />
          <StatCard title="Absent" value={absentCount} subtitle="Missed closed sessions" color="red" iconType="activity" />
        </div>

        <div className="grid grid-cols-12 gap-4 mb-5">
          <div className="col-span-8">
            <AttendanceChart attendance={finalFeed} />
          </div>
          <div className="col-span-4">
            <SessionPanel
              lecturer={lecturerData}
              classes={lecturerClasses}
            />
          </div>
        </div>

        <LiveFeed attendance={finalFeed.slice(0, 10)} />
      </div>
    </div>
  );
}

export default Dashboard;