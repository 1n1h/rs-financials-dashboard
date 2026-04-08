import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, LineElement,
  PointElement, Tooltip, Legend, Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend, Filler);

export default function BalanceTrend({ months, balances }) {
  const data = {
    labels: months,
    datasets: [
      {
        label: 'Total Balance',
        data: balances.grandTotal,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.08)',
        borderWidth: 2.5,
        pointRadius: 4,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#0a0a0a',
        pointBorderWidth: 2,
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Trust Balance',
        data: balances.totalTrust,
        borderColor: '#8b5cf6',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        pointRadius: 3,
        pointBackgroundColor: '#8b5cf6',
        borderDash: [4, 4],
        tension: 0.3,
      },
      {
        label: 'Personal Balance',
        data: balances.totalPersonal,
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        pointRadius: 3,
        pointBackgroundColor: '#10b981',
        borderDash: [4, 4],
        tension: 0.3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#9ca3af', usePointStyle: true, pointStyleWidth: 12, padding: 16, font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#fff',
        bodyColor: '#d1d5db',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => {
            const val = ctx.parsed.y;
            if (val === 0) return `${ctx.dataset.label}: —`;
            return `${ctx.dataset.label}: $${val.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 11 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
          callback: (v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`,
        },
      },
    },
  };

  return (
    <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-1">Balance Trend</h3>
      <p className="text-xs text-gray-500 mb-4">Monthly account balances</p>
      <div className="h-80">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
