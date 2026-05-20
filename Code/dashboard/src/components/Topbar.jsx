import { Bell, Search } from "lucide-react";

function Topbar({
  title = "Dashboard",
  subtitle = "Attendance monitoring overview",
  showSystem = true,
  searchTerm = "",
  setSearchTerm = null,
  actionButton = null
}) {
  return (
    <div className="mb-6">
      {/* TOP SECTION */}
      <div className="flex items-start justify-between gap-4 mb-5">
        {/* LEFT */}
        <div>
          <h1 className="text-3xl font-bold text-white">{title}</h1>
          <p className="text-zinc-500 mt-1">{subtitle}</p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          
          {/* SYSTEM STATUS - NOW WITH A GREENISH TINT */}
          {showSystem && (
            <div className="hidden md:flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
              <span className="text-sm font-medium text-green-400">
                System Online
              </span>
            </div>
          )}

          {/* NOTIFICATIONS */}
          <button className="w-11 h-11 rounded-xl bg-[#111113] border border-[#1c1c1f] flex items-center justify-center hover:bg-[#18181b] transition">
            <Bell size={18} className="text-zinc-400 hover:text-white" />
          </button>
        </div>
      </div>

      {/* SEARCH */}
      {(setSearchTerm || actionButton) && (
        <div className="flex gap-3 items-center">
          {/* SEARCH BAR */}
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => {
                if (setSearchTerm) {
                  setSearchTerm(e.target.value);
                }
              }}
              className="w-full bg-[#111113] border border-[#1c1c1f] rounded-xl pl-11 pr-4 py-3 text-sm text-white outline-none focus:border-orange-400 transition"
            />
          </div>

          {/* BUTTON */}
          {actionButton}
        </div>
      )}
    </div>
  );
}

export default Topbar;