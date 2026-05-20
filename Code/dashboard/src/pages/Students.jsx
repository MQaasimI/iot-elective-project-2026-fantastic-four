import { useEffect, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { auth, db } from "../firebase";
import { ChevronDown, ChevronUp } from "lucide-react";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Students() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [lecturerId, setLecturerId] = useState("");
  const [savedClasses, setSavedClasses] = useState({});
  const [tempClasses, setTempClasses] = useState({});
  const [openClasses, setOpenClasses] = useState({});
  const [showPopup, setShowPopup] = useState(false);

  const currentUser = auth.currentUser;

  // LOAD LECTURER & STUDENTS
  useEffect(() => {
    if (!currentUser) return;
    
    const lecturersRef = ref(db, "lecturers");
    onValue(lecturersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const matched = Object.entries(data).find(([id, l]) => l.email === currentUser.email);
      if (!matched) return;

      setLecturerId(matched[0]);
      const loadedClasses = matched[1].classes || {};
      setSavedClasses(loadedClasses);
      setTempClasses(loadedClasses);
      
      const initialOpen = {};
      Object.keys(loadedClasses).forEach(c => initialOpen[c] = true);
      setOpenClasses(initialOpen);
    });

    const studentsRef = ref(db, "students");
    onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setStudents(Object.entries(data).map(([id, value]) => ({ id, ...value })));
    });
  }, [currentUser]);

  const handleClassToggle = (className) => setTempClasses(p => ({ ...p, [className]: !p[className] }));
  const saveClasses = async () => {
    await update(ref(db, `lecturers/${lecturerId}`), { classes: tempClasses });
    setSavedClasses(tempClasses);
    setShowPopup(false);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex">
      <Sidebar />
      <div className="flex-1 ml-60 px-6 py-5 overflow-y-auto">
        <Topbar
          title="Manage Classes"
          subtitle="Assign students to your active lecture sessions"
          showSystem={true}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* TOGGLE BAR */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex gap-4">
            {Object.keys(tempClasses).map((c) => (
              <div key={c} className="bg-[#111113] border border-[#1c1c1f] rounded-xl px-5 py-3 flex items-center gap-4">
                <div>
                  <h2 className="font-semibold text-sm">{c}</h2>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-bold">Status</p>
                </div>
                <button onClick={() => handleClassToggle(c)} className={`w-11 h-6 rounded-full transition relative ${tempClasses[c] ? "bg-orange-500" : "bg-zinc-800"}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${tempClasses[c] ? "left-6" : "left-1"}`} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={() => setShowPopup(true)} className="bg-gradient-to-r from-orange-500 to-orange-400 text-black font-bold px-6 py-3 rounded-xl text-sm hover:from-orange-400 transition-all">
            Save Changes
          </button>
        </div>

        {/* TABLES */}
        <div className="space-y-6">
          {Object.keys(savedClasses).filter(c => savedClasses[c]).map((c) => {
            
            // ==========================================
            // BUG FIX: Variables wrapped in String()
            // ==========================================
            const classStudents = students.filter(s => 
              s.class === c && 
              (String(s.studentName || "").toLowerCase().includes(searchTerm.toLowerCase()) || String(s.studentNumber || "").includes(searchTerm))
            );

            return (
              <div key={c} className="bg-[#111113] border border-[#1c1c1f] rounded-2xl overflow-hidden">
                <button onClick={() => setOpenClasses(p => ({...p, [c]: !p[c]}))} className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#18181b] transition">
                  <div className="text-left">
                    <h2 className="font-semibold text-sm">Class {c}</h2>
                    <p className="text-xs text-zinc-500">{classStudents.length} Students registered</p>
                  </div>
                  {openClasses[c] ? <ChevronUp size={18} className="text-zinc-500" /> : <ChevronDown size={18} className="text-zinc-500" />}
                </button>

                {openClasses[c] && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-[#151518] text-left text-xs text-zinc-500 uppercase tracking-wider font-bold">
                        <tr>
                          <th className="px-5 py-3">Student #</th>
                          <th className="px-5 py-3">Student Name</th>
                          <th className="px-5 py-3">Class</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classStudents.map(s => (
                          <tr key={s.id} className="border-t border-[#27272a] hover:bg-[#18181b] transition">
                            <td className="px-5 py-3 text-sm font-mono text-zinc-300">{s.studentNumber}</td>
                            <td className="px-5 py-3 text-sm font-medium">{s.studentName}</td>
                            <td className="px-5 py-3 text-sm text-orange-400 font-semibold">{s.class}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* POPUP */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-6 w-full max-w-sm">
            <h2 className="text-lg font-bold text-white mb-2">Confirm Changes</h2>
            <p className="text-zinc-400 text-sm mb-6">Are you sure you want to update your active classes?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => { setTempClasses(savedClasses); setShowPopup(false); }} className="bg-[#18181b] px-5 py-2.5 rounded-xl text-sm">Cancel</button>
              <button onClick={saveClasses} className="bg-orange-500 hover:bg-orange-400 text-black font-bold px-5 py-2.5 rounded-xl text-sm">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;