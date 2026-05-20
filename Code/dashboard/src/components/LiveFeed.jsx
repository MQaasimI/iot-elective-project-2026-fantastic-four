import { Link } from "react-router-dom";

function LiveFeed({ attendance }) {
  // =========================
  // LIMIT TO 10
  // =========================
  const limitedAttendance = attendance.slice(0, 10);

  // Helper to keep your JSX clean for the new statuses
  const renderStatus = (status) => {
    if (status === "IN") {
      return <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-lg text-xs font-semibold">PRESENT</span>;
    }
    if (status === "LATE") {
      // CHANGED TO BLUE HERE
      return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-xs font-semibold">LATE</span>;
    }
    if (status === "ABSENT") {
      return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-lg text-xs font-semibold">ABSENT</span>;
    }
    // Default for "OUT" or anything else
    return <span className="bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 px-3 py-1 rounded-lg text-xs font-semibold">LEFT</span>;
  };

  return (
    <div className="bg-[#111113] border border-[#1c1c1f] rounded-2xl p-5">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-lg font-semibold">Attendance Logs</h1>
          <p className="text-zinc-500 text-sm mt-1">{new Date().toDateString()}</p>
        </div>

        {/* VIEW ALL */}
        <Link to="/dashboard/logs">
          <button className="bg-orange-400/10 hover:bg-orange-400/20 text-orange-400 border border-orange-400/20 px-4 py-2 rounded-xl text-sm font-medium transition">
            View All
          </button>
        </Link>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-xl border border-[#27272a] overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#18181b]">
            <tr className="text-left text-sm text-zinc-500">
              <th className="px-5 py-3 font-medium">Student Number</th>
              <th className="px-5 py-3 font-medium">Student Name</th>
              <th className="px-5 py-3 font-medium">Class</th>
              <th className="px-5 py-3 font-medium">Room</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Time</th>
            </tr>
          </thead>
          <tbody>
            {limitedAttendance.length > 0 ? (
              limitedAttendance.map((entry) => (
                <tr
                  key={entry.id}
                  className="border-t border-[#27272a] hover:bg-[#18181b] transition"
                >
                  {/* STUDENT NUMBER */}
                  <td className="px-5 py-3 text-sm">
                    {entry.studentNumber || "N/A"}
                  </td>

                  {/* STUDENT NAME */}
                  <td className="px-5 py-3 text-sm text-white font-medium">
                    {entry.studentName || "Unknown Student"}
                  </td>

                  {/* CLASS */}
                  <td className="px-5 py-3 text-sm">
                    <span className="bg-orange-400/10 text-orange-400 border border-orange-400/20 px-3 py-1 rounded-lg text-xs font-semibold">
                      {entry.class || "N/A"}
                    </span>
                  </td>

                  {/* ROOM */}
                  <td className="px-5 py-3 text-sm text-zinc-400">
                    {entry.room || "N/A"}
                  </td>

                  {/* STATUS */}
                  <td className="px-5 py-3">
                    {renderStatus(entry.status)}
                  </td>

                  {/* TIME */}
                  <td className="px-5 py-3 text-sm text-zinc-500">
                    {entry.timestamp || "N/A"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center text-zinc-500 text-sm py-8"
                >
                  No attendance logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LiveFeed;