import { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

function AttendanceChart({ attendance = [] }) {
  
  // =========================
  // CALCULATE LAST 7 DAYS
  // =========================
  const chartData = useMemo(() => {
    const days = [];
    const counts = [];
    
    // Loop backwards from 6 days ago to today
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      // Format YYYY-MM-DD to match your ESP32 timestamp style
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      
      // Get short day name (e.g., "Mon", "Tue")
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push(dayName);
      
      // Count students who were IN or LATE on this specific day
      const dailyCount = attendance.filter(item => {
        const itemDate = item.timestamp?.split(" ")[0]; 
        const isPresent = item.status === "IN" || item.status === "LATE";
        return itemDate === dateStr && isPresent;
      }).length;
      
      counts.push(dailyCount);
    }
    
    return { days, counts };
  }, [attendance]);

  const data = {
    labels: chartData.days,
    datasets: [
      {
        data: chartData.counts,
        borderColor: "#fb923c",
        backgroundColor: "rgba(251,146,60,0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#fb923c",
        pointBorderColor: "#111113",
        pointBorderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#18181b',
        titleColor: '#fb923c',
        bodyColor: '#fff',
        borderColor: '#27272a',
        borderWidth: 1,
        padding: 10,
        displayColors: false,
      }
    },
    scales: {
      x: {
        ticks: { color: "#71717a" },
        grid: { color: "#18181b", drawBorder: false }
      },
      y: {
        ticks: { color: "#71717a", stepSize: 5 },
        grid: { color: "#18181b", drawBorder: false },
        beginAtZero: true
      }
    }
  };

  return (
    <div className="bg-[#111113] border border-[#1c1c1f] rounded-2xl p-5 h-full flex flex-col">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-lg font-semibold">Attendance Flow</h1>
          <p className="text-zinc-500 text-sm mt-1">
            7-Day scan volume overview
          </p>
        </div>
        <div className="bg-[#18181b] border border-[#27272a] rounded-xl px-4 py-2 text-sm text-zinc-300">
          Last 7 Days
        </div>
      </div>

      {/* GRAPH */}
      <div className="flex-1 min-h-55">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

export default AttendanceChart;