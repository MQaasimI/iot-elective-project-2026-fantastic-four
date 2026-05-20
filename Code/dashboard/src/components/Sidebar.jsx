import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart3,
  LogOut
} from "lucide-react";

import {
  useNavigate,
  useLocation
} from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // =========================
  // ACTIVE STYLE
  // =========================
  const activeClass =
    "w-full flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 p-3 rounded-xl text-sm transition";

  const normalClass =
    "w-full flex items-center gap-3 hover:bg-[#18181b] text-zinc-400 hover:text-white p-3 rounded-xl text-sm transition-all";

  return (
    <div className="fixed left-0 top-0 w-60 h-screen bg-[#111113] border-r border-[#1c1c1f] p-5 flex flex-col">
      {/* LOGO */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight">
          Smart<span className="text-orange-400">Attend</span>
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Attendance Monitoring
        </p>
      </div>

      {/* MENU */}
      <div className="space-y-2">
        <button
          onClick={() => navigate("/dashboard")}
          className={location.pathname === "/dashboard" ? activeClass : normalClass}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        <button
          onClick={() => navigate("/dashboard/students")}
          className={location.pathname === "/dashboard/students" ? activeClass : normalClass}
        >
          <Users size={18} />
          Students
        </button>

        <button
          onClick={() => navigate("/dashboard/logs")}
          className={location.pathname === "/dashboard/logs" ? activeClass : normalClass}
        >
          <ClipboardList size={18} />
          Logs
        </button>

        <button
          onClick={() => navigate("/dashboard/analytics")}
          className={location.pathname === "/dashboard/analytics" ? activeClass : normalClass}
        >
          <BarChart3 size={18} />
          Analytics
        </button>
      </div>

      {/* BOTTOM */}
      <div className="mt-auto space-y-2">
        <button 
          onClick={() => navigate("/logout")}
          className="w-full flex items-center gap-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 p-3 rounded-xl text-sm transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;