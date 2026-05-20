import { useState, useEffect } from "react";
import { ref, get, set, remove, push, onValue } from "firebase/database";
import { db } from "../firebase";
import { ChevronDown, Play, Square } from "lucide-react";

const ALL_ROOMS = ["A101", "B202", "C303"];

function SessionPanel({ lecturer, classes }) {
  const [selectedRoom, setSelectedRoom] = useState("A101");
  const [selectedClasses, setSelectedClasses] = useState([]);
  
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [occupiedRooms, setOccupiedRooms] = useState([]);
  
  // NEW STATE FOR CLOSE CONFIRMATION MODAL
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  // =========================
  // REAL-TIME SESSION LISTENER
  // =========================
  useEffect(() => {
    if (!lecturer?.email) return;
    const safeEmail = lecturer.email.replace(/\./g, ",");
    const sessionsRef = ref(db, "active_sessions");

    const unsubscribe = onValue(sessionsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        let mySession = null;
        const takenRooms = [];

        Object.entries(data).forEach(([emailKey, session]) => {
          if (emailKey === safeEmail) {
            mySession = session; 
          } else {
            takenRooms.push(session.room); 
          }
        });

        setOccupiedRooms(takenRooms);

        if (mySession) {
          setSessionActive(true);
          setSelectedRoom(mySession.room);
          if (mySession.class) {
            setSelectedClasses(mySession.class.split(", "));
          }
          setSessionStartTime(mySession.startTime);
        } else {
          setSessionActive(false);
          setSessionStartTime(null);
          
          if (takenRooms.includes(selectedRoom)) {
            const availableRoom = ALL_ROOMS.find(r => !takenRooms.includes(r));
            if (availableRoom) setSelectedRoom(availableRoom);
          }
        }
      } else {
        setSessionActive(false);
        setSessionStartTime(null);
        setOccupiedRooms([]);
      }
    });

    return () => unsubscribe();
  }, [lecturer, selectedRoom]);

  // =========================
  // MULTI-SELECT HANDLERS
  // =========================
  const handleAddClass = (e) => {
    const val = e.target.value;
    if (val !== "SELECT" && !selectedClasses.includes(val)) {
      setSelectedClasses([...selectedClasses, val]);
    }
  };

  const handleClearClasses = () => setSelectedClasses([]);

  // =========================
  // OPEN SESSION
  // =========================
  const handleOpenSession = async () => {
    if (selectedClasses.length === 0 || !selectedRoom || !lecturer) return;
    
    setIsProcessing(true);
    const safeEmail = lecturer.email.replace(/\./g, ",");
    const startTime = new Date().getTime(); 
    
    const combinedClasses = selectedClasses.join(", ");

    const sessionData = {
      lecturerEmail: lecturer.email,
      class: combinedClasses,
      room: selectedRoom,
      startTime: startTime,
      status: "OPEN"
    };

    try {
      await set(ref(db, `active_sessions/${safeEmail}`), sessionData);
    } catch (error) {
      console.error("Failed to open session:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  // =========================
  // CLOSE SESSION & MARK ABSENT
  // =========================
  const handleCloseSession = async () => {
    if (!lecturer) return;
    setIsProcessing(true);

    try {
      const studentsSnap = await get(ref(db, "students"));
      const allStudents = studentsSnap.val() || {};
      
      const sessionStudents = Object.values(allStudents).filter((s) => 
        selectedClasses.includes(s.class)
      );

      const attendanceSnap = await get(ref(db, "attendances"));
      const allAttendances = attendanceSnap.val() || {};
      
      const presentStudentNumbers = new Set();
      
      Object.values(allAttendances).forEach((record) => {
        const recordTime = new Date(record.timestamp.replace(" ", "T")).getTime();
        if (recordTime >= sessionStartTime && record.room === selectedRoom) {
          presentStudentNumbers.add(record.studentNumber);
        }
      });

      const missingStudents = sessionStudents.filter(
        (s) => !presentStudentNumbers.has(s.studentNumber)
      );

      const timestamp = new Date().toLocaleString("en-ZA", { 
        year: 'numeric', month: '2-digit', day: '2-digit', 
        hour: '2-digit', minute:'2-digit', second:'2-digit' 
      }).replace(/,/g, ''); 

      for (const student of missingStudents) {
        await push(ref(db, "attendances"), {
          studentNumber: student.studentNumber,
          studentName: student.studentName || "Unknown",
          class: student.class, 
          room: selectedRoom,
          status: "ABSENT",
          timestamp: timestamp
        });
      }

      const safeEmail = lecturer.email.replace(/\./g, ",");
      await remove(ref(db, `active_sessions/${safeEmail}`));
      
      setSelectedClasses([]); 

    } catch (error) {
      console.error("Failed to close session:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-[#111113] border border-[#1c1c1f] rounded-2xl p-5 flex flex-col h-full">
        <div className="mb-5">
          <h1 className="text-lg font-semibold">Session Control</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage attendance scanning</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-sm text-zinc-500">Classes</label>
              {selectedClasses.length > 0 && !sessionActive && (
                <button onClick={handleClearClasses} className="text-xs text-orange-400 hover:text-orange-300 transition">
                  Clear All
                </button>
              )}
            </div>
            
            <div className="relative mb-3">
              <select 
                disabled={sessionActive}
                value="SELECT"
                onChange={handleAddClass}
                className="w-full appearance-none bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-sm outline-none text-white cursor-pointer disabled:opacity-50"
              >
                <option value="SELECT" disabled>Select classes...</option>
                {classes?.length > 0 ? (
                  classes.map((cls) => <option key={cls} value={cls}>{cls}</option>)
                ) : (
                  <option disabled>No classes</option>
                )}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedClasses.length > 0 ? (
                selectedClasses.map((cls) => (
                  <span key={cls} className="flex items-center gap-1 bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-1 rounded-lg text-xs font-semibold">
                    {cls}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-600">No classes selected</span>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm text-zinc-500 mb-2">Room</label>
            <div className="relative">
              <select 
                disabled={sessionActive}
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="w-full appearance-none bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-3 text-sm outline-none text-white cursor-pointer disabled:opacity-50"
              >
                {ALL_ROOMS.map(room => (
                  <option 
                    key={room} 
                    value={room} 
                    disabled={occupiedRooms.includes(room)}
                    className={occupiedRooms.includes(room) ? "text-zinc-600" : "text-white"}
                  >
                    {room} {occupiedRooms.includes(room) ? "(In Use)" : ""}
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className={`border rounded-xl p-4 mb-4 transition-colors ${sessionActive ? 'bg-green-500/10 border-green-500/20' : 'bg-[#18181b] border-[#27272a]'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-500 text-xs mb-1">Session Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${sessionActive ? 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-red-400'}`}></div>
                <span className={`font-semibold text-sm ${sessionActive ? 'text-green-400' : 'text-zinc-300'}`}>
                  {sessionActive ? "SCANNING ACTIVE" : "CLOSED"}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-zinc-500 text-xs">Lecturer</p>
              <p className="text-sm">{lecturer?.name || "Lecturer"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-auto">
          <button 
            onClick={handleOpenSession}
            disabled={sessionActive || isProcessing || selectedClasses.length === 0}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-orange-500 to-orange-400 hover:from-orange-400 hover:to-orange-300 disabled:from-zinc-700 disabled:to-zinc-700 disabled:text-zinc-500 disabled:shadow-none disabled:transform-none text-black font-bold py-3 rounded-xl text-sm shadow-[0_0_15px_rgba(251,146,60,0.2)] hover:shadow-[0_0_25px_rgba(251,146,60,0.4)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <Play size={16} fill="currentColor" /> Open
          </button>

          <button 
            onClick={() => setShowConfirmClose(true)}
            disabled={!sessionActive || isProcessing}
            className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 disabled:bg-[#111113] disabled:text-zinc-600 disabled:border-[#1c1c1f] disabled:transform-none border border-red-500/20 hover:border-red-500/30 text-red-400 font-bold py-3 rounded-xl text-sm transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <Square size={16} fill="currentColor" /> Close
          </button>
        </div>
      </div>

      {/* CONFIRMATION POPUP */}
      {showConfirmClose && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-100">
          <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all">
            <h2 className="text-xl font-bold text-white mb-2">Terminate Session?</h2>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              Are you sure you want to close this session? Any student who has not scanned in yet will automatically be marked as <span className="font-bold text-red-400">ABSENT</span> in the database.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmClose(false)}
                className="bg-[#18181b] border border-[#27272a] text-zinc-300 hover:text-white px-5 py-2.5 rounded-xl text-sm font-medium transition hover:bg-[#232326]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmClose(false);
                  handleCloseSession();
                }}
                className="bg-red-500 hover:bg-red-400 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-[0_0_15px_rgba(239,68,68,0.3)] transition"
              >
                Yes, End Session
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SessionPanel;