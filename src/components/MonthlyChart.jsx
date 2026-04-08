import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

export default function MonthlyChart({ months, income, expenses, net }) {
  // Detect LTC spike months: expenses > 2x median
  const sorted = [...expenses].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const spikeMonths = months.filter((_, i) => expenses[i] > median * 2);

  const data = {
    labels: months,
    datasets: [
      {
        type: 'bar',
        label: 'Income',
        data: income,
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
      {
        type: 'bar',
        label: 'Expenses',
        data: expenses,
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        borderRadius: 4,
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
      {
        type: 'line',
        label: 'Net Income',
        data: net,
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        borderWidth: 2,
        pointRadius: 4,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#0a0a0a',
        pointBorderWidth: 2,
        tension: 0.3,
        fill: false,
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
        labels: { color: '#9ca3af', usePointStyle: true, pointStyleWidth: 12, padding: 20, font: { size: 12 } },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#fff',
        bodyColor: '#d1d5db',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
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
    <div className="backdrop-blur-xl bg-glass border border-glass-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-1">Monthly Income vs Expenses</h3>
      <p className="text-xs text-gray-500 mb-4">January – December 2025</p>
      <div className="h-80">
        <Bar data={data} options={options} />
      </div>
      {spikeMonths.length > 0 && (
        <p className="text-xs text-gray-500 mt-3">
          * {spikeMonths.join(', ')}: elevated expenses due to LTC reimbursement timing
        </p>
      )}
    </div>
  );
}
