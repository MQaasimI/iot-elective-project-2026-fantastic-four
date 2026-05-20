import { useEffect, useMemo, useState } from "react";
import { ref, onValue } from "firebase/database";
import { auth, db } from "../firebase";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatCard from "../components/StatCard";

import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, ArcElement, PointElement, LineElement,
  Tooltip, Legend, Filler
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { Activity, Users, Clock, BookOpen, Building2, Flame, ChevronDown } from "lucide-react";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend, Filler);

function Analytics() {
  const [attendance, setAttendance] = useState([]);
  const [lecturerClasses, setLecturerClasses] = useState([]);
  const [students, setStudents] = useState([]);

  // =========================
  // FILTERS STATE
  // =========================
  const [dateFilter, setDateFilter] = useState(() => {
    const saved = localStorage.getItem("analyticsDateFilter");
    return saved || "day";
  });
  
  const [classFilter, setClassFilter] = useState("ALL"); // New Class Filter
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    localStorage.setItem("analyticsDateFilter", dateFilter);
  }, [dateFilter]);

  const currentUser = auth.currentUser;

  // =========================
  // LOAD LECTURER
  // =========================
  useEffect(() => {
    if (!currentUser) return;
    const lecturersRef = ref(db, "lecturers");
    onValue(lecturersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const lecturersArray = Object.values(data);
      const matched = lecturersArray.find(l => l.email === currentUser.email);
      if (!matched) return;
      
      // Keep historical analytics for inactive classes
      const allAssociatedClasses = Object.keys(matched.classes || {});
      setLecturerClasses(allAssociatedClasses);
    });
  }, [currentUser]);

  // =========================
  // LOAD STUDENTS
  // =========================
  useEffect(() => {
    const studentsRef = ref(db, "students");
    onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return setStudents([]);
      setStudents(Object.values(data));
    });
  }, []);

  // =========================
  // LOAD ATTENDANCE
  // =========================
  useEffect(() => {
    const attendanceRef = ref(db, "attendances");
    onValue(attendanceRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return setAttendance([]);
      
      const arr = Object.entries(data).map(([id, v]) => ({ id, ...v }));
      
      // Strict Timestamp Sorting
      arr.sort((a, b) => 
        new Date(b.timestamp.replace(" ", "T")) - new Date(a.timestamp.replace(" ", "T"))
      );
      
      setAttendance(arr);
    });
  }, []);

  // =========================
  // DATE FILTER LOGIC
  // =========================
  const isSameDay = (timestamp) => {
    const item = new Date(timestamp.replace(" ", "T"));
    const today = new Date();
    return (
      item.getFullYear() === today.getFullYear() &&
      item.getMonth() === today.getMonth() &&
      item.getDate() === today.getDate()
    );
  };

  const getFilteredByDate = (data) => {
    const now = new Date();
    const map = { week: 7, twoWeeks: 14, month: 30, threeMonths: 90 };

    return data.filter((item) => {
      if (!item.timestamp) return false;
      const itemDate = new Date(item.timestamp.replace(" ", "T"));
      if (dateFilter === "day") return isSameDay(item.timestamp);
      
      const diff = (now - itemDate) / (1000 * 60 * 60 * 24);
      return diff <= map[dateFilter];
    });
  };

  // APPLY CLASS FILTER THEN DATE FILTER
  const baseFiltered = attendance.filter((item) => {
    const belongsToLecturer = lecturerClasses.includes(item.class);
    const matchesClassFilter = classFilter === "ALL" ? true : item.class === classFilter;
    return belongsToLecturer && matchesClassFilter;
  });
  
  const filtered = getFilteredByDate(baseFiltered);

  // =========================
  // CHARTS & BASE STATS
  // =========================
  const classStats = useMemo(() => {
    const s = {};
    filtered.forEach(i => { s[i.class] = (s[i.class] || 0) + 1; });
    return s;
  }, [filtered]);

  const roomStats = useMemo(() => {
    const s = {};
    filtered.forEach(i => { s[i.room] = (s[i.room] || 0) + 1; });
    return s;
  }, [filtered]);

  const hourlyStats = useMemo(() => {
    const s = {};
    filtered.forEach(i => {
      const timePart = i.timestamp?.split(" ")[1];
      if (!timePart) return;
      const hour = timePart.split(":")[0];
      s[hour] = (s[hour] || 0) + 1;
    });

    const sortedHours = Object.keys(s).sort((a, b) => parseInt(a) - parseInt(b));
    
    const formattedStats = {};
    sortedHours.forEach(hour => {
      formattedStats[`${hour}:00`] = s[hour];
    });

    return formattedStats;
  }, [filtered]);

  const topStudents = useMemo(() => {
    const s = {};
    filtered.forEach(i => {
      if (!s[i.studentNumber]) {
        s[i.studentNumber] = { name: i.studentName, scans: 0, class: i.class };
      }
      s[i.studentNumber].scans++;
    });
    return Object.entries(s)
      .map(([studentNumber, v]) => ({ studentNumber, ...v }))
      .sort((a, b) => b.scans - a.scans)
      .slice(0, 5);
  }, [filtered]);

  // =========================
  // STATS & INSIGHTS MATH
  // =========================
  
  // Only count enrolled students for the selected class (or all classes if "ALL")
  const totalEnrolled = students.filter((s) => {
    const belongsToLecturer = lecturerClasses.includes(s.class);
    const matchesClassFilter = classFilter === "ALL" ? true : s.class === classFilter;
    return belongsToLecturer && matchesClassFilter;
  }).length;
  
  const uniqueAttendees = new Set(
    filtered.filter(i => i.status === "IN" || i.status === "LATE").map(i => i.studentNumber)
  ).size;
  
  const absentCount = Math.max(0, totalEnrolled - uniqueAttendees);
  const lateCount = filtered.filter(i => i.status === "LATE").length;

  // 1. Calculate Attendance Percentage
  const attendanceRate = totalEnrolled > 0 
    ? Math.round((uniqueAttendees / totalEnrolled) * 100) 
    : 0;

  // 2. Calculate Top Class dynamically
  const topClass = Object.keys(classStats).length > 0 
    ? Object.keys(classStats).reduce((a, b) => classStats[a] > classStats[b] ? a : b) 
    : "None";

  // =========================
  // LABELS & STYLES
  // =========================
  const labels = {
    day: "Today", week: "Last Week", twoWeeks: "Last 2 Weeks",
    month: "Last Month", threeMonths: "Last 3 Months"
  };

  const cardStyle = "bg-[#111113] border border-[#1c1c1f] rounded-2xl p-5";
  const barColors = ["#fb923c", "#8b5cf6", "#38bdf8", "#34d399", "#f472b6", "#a855f7"];

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex">
      <Sidebar />
      <div className="flex-1 ml-60 px-6 py-5 overflow-y-auto">
        <Topbar title="Analytics Overview" subtitle="Attendance intelligence & insights" showSystem={true} />

        {/* FILTERS */}
        <div className="flex justify-start gap-3 mb-4 relative z-50">
          
          {/* Date Filter */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 transition cursor-pointer h-full"
            >
              <Clock size={16} className="text-white" />
              <span className="text-sm">{labels[dateFilter]}</span>
            </button>
            {showFilter && (
              <div className="absolute left-0 top-12 w-44 bg-[#111113] border border-white/10 rounded-xl overflow-hidden shadow-xl">
                {Object.entries(labels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => { setDateFilter(key); setShowFilter(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition ${
                      dateFilter === key ? "text-orange-400" : "text-zinc-300"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Class Filter Dropdown */}
          <div className="relative">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 pr-10 py-2 text-sm text-white outline-none appearance-none cursor-pointer hover:bg-white/10 transition h-full"
            >
              <option value="ALL" className="bg-[#111113] text-white">All Classes</option>
              {lecturerClasses.map((c) => (
                <option key={c} value={c} className="bg-[#111113] text-white">
                  Class {c}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
          </div>
          
        </div>

        {/* STATS */}
        <div className="grid grid-cols-4 gap-4 mb-6 relative z-10">
          <StatCard 
            title="Avg Attendance" 
            value={`${attendanceRate}%`} 
            subtitle="Overall turnout" 
            color="green" 
            iconType="activity" 
          />
          <StatCard 
            title="Total Absences" 
            value={absentCount} 
            subtitle="Missed classes" 
            color="red" 
            iconType="down" 
          />
          <StatCard 
            title="Late Arrivals" 
            value={lateCount} 
            subtitle="Tardy students" 
            color="cyan" 
            iconType="clock" 
          />
          <StatCard 
            title="Top Class" 
            value={topClass} 
            subtitle="Most active class" 
            color="purple" 
            iconType="users" 
          />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-12 gap-4 mb-6">
          <div className={`col-span-8 ${cardStyle}`}>
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="text-orange-400" />
              <h2 className="text-lg font-semibold">Class Activity</h2>
            </div>
            <div className="h-80">
              <Bar
                data={{
                  labels: Object.keys(classStats),
                  datasets: [{ data: Object.values(classStats), backgroundColor: barColors, borderRadius: 8 }]
                }}
                options={{ plugins: { legend: { display: false } }, scales: { x: { grid: { color: "#18181b" }, border: { display: false } }, y: { grid: { color: "#18181b" }, border: { display: false } } } }}
              />
            </div>
          </div>
          <div className={`col-span-4 ${cardStyle}`}>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="text-purple-400" />
              <h2 className="text-lg font-semibold">Room Activity</h2>
            </div>
            <div className="h-80 flex items-center justify-center">
              <Doughnut
                data={{
                  labels: Object.keys(roomStats),
                  datasets: [{ data: Object.values(roomStats), backgroundColor: ["#fb923c", "#a855f7", "#22c55e", "#38bdf8"], borderWidth: 0 }]
                }}
                options={{
                  plugins: { legend: { position: 'bottom', labels: { color: '#a1a1aa', padding: 20 } } },
                  cutout: '75%'
                }}
              />
            </div>
          </div>
        </div>

        {/* BOTTOM */}
        <div className="grid grid-cols-12 gap-4">
          <div className={`col-span-7 ${cardStyle}`}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="text-cyan-400" />
              <h2 className="text-lg font-semibold">Peak Activity</h2>
            </div>
            <div className="h-72">
              <Line
                data={{
                  labels: Object.keys(hourlyStats),
                  datasets: [{
                    data: Object.values(hourlyStats), borderColor: "#38bdf8", backgroundColor: "rgba(56,189,248,0.1)",
                    fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: "#38bdf8"
                  }]
                }}
                options={{ plugins: { legend: { display: false } }, scales: { x: { grid: { color: "#18181b" }, border: { display: false } }, y: { grid: { color: "#18181b" }, border: { display: false } } } }}
              />
            </div>
          </div>
          <div className={`col-span-5 ${cardStyle}`}>
            <div className="flex items-center gap-2 mb-4">
              <Flame className="text-orange-400" />
              <h2 className="text-lg font-semibold">Top Students</h2>
            </div>
            <div className="space-y-3">
              {topStudents.map(s => (
                <div key={s.studentNumber} className="bg-[#18181b] border border-[#27272a] rounded-xl p-4 flex justify-between cursor-pointer hover:bg-[#222225] transition">
                  <div>
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-zinc-500">{s.studentNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-400 font-bold">{s.scans}</p>
                    <p className="text-xs text-zinc-500">{s.class}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Analytics;