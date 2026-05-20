import {
  Activity,
  Users,
  TrendingDown,
  Clock
} from "lucide-react";

function StatCard({ title, value, subtitle, color = "orange", iconType = "activity" }) {

  // =========================
  // COLOR SYSTEM (BREAKS ORANGE MONOTONY)
  // =========================
  const styles = {
    orange: {
      glow: "bg-orange-500/10",
      text: "text-orange-400",
      border: "border-orange-400/20"
    },
    green: {
      glow: "bg-green-500/10",
      text: "text-green-400",
      border: "border-green-400/20"
    },
    red: {
      glow: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-400/20"
    },
    cyan: {
      glow: "bg-cyan-500/10",
      text: "text-cyan-400",
      border: "border-cyan-400/20"
    },
    purple: {
      glow: "bg-purple-500/10",
      text: "text-purple-400",
      border: "border-purple-400/20"
    }
  };

  // =========================
  // ICON SYSTEM
  // =========================
  const icons = {
    activity: Activity,
    users: Users,
    down: TrendingDown,
    clock: Clock
  };

  const Icon = icons[iconType];

  const theme = styles[color];

  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-5
      bg-white/5 backdrop-blur-xl
      border border-white/10
      transition-all duration-300
      hover:bg-white/10 hover:border-white/20
    `}>

      {/* GLASS GLOW BACKDROP */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl ${theme.glow}`}></div>

      {/* ICON ROW */}
      <div className="flex items-center justify-between mb-4">

        <div className={`
          w-10 h-10 rounded-xl flex items-center justify-center
          ${theme.glow} ${theme.text} ${theme.border} border
        `}>
          <Icon size={18} />
        </div>

        <span className="text-xs text-zinc-500 uppercase tracking-wider">
          {title}
        </span>

      </div>

      {/* VALUE */}
      <h1 className={`text-3xl font-bold ${theme.text}`}>
        {value}
      </h1>

      {/* SUBTITLE */}
      <p className="text-zinc-400 text-xs mt-2">
        {subtitle}
      </p>

      {/* BOTTOM ACCENT LINE */}
      <div className={`absolute bottom-0 left-0 w-full h-0.5 ${theme.glow}`}></div>

    </div>
  );
}

export default StatCard;