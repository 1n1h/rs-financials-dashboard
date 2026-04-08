import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function IncomeBreakdown({ breakdown }) {
  const items = [
    { label: 'LTC Reimbursement', value: breakdown.ltcReimbursement, color: '#10b981' },
    { label: 'Trust Transfers', value: breakdown.trustTransfers, color: '#06b6d4' },
    { label: 'Rental Income', value: breakdown.rentalIncome, color: '#8b5cf6' },
    { label: 'Brokerage (Closed)', value: breakdown.brokerageClosed, color: '#f59e0b' },
    { label: 'Social Security', value: breakdown.socialSecurity, color: '#ec4899' },
    { label: 'Interest', value: breakdown.interest, color: '#6366f1' },
  ].filter(i => i.value > 0).sort((a, b) => b.value - a.value);

  const data = {
    labels: items.map(i => i.label),
    datasets: [{
      data: items.map(i => i.value),
      backgroundColor: items.map(i => i.color + 'cc'),
      borderColor: items.map(i => i.color),
      borderWidth: 1,
      borderRadius: 6,
      barThickness: 32,
    }],
  };

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#fff',
        bodyColor: '#d1d5db',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => `$${ctx.parsed.x.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#6b7280',
          font: { size: 11 },
          callback: (v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`,
        },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#d1d5db', font: { size: 12 } },
      },
    },
  };

  return (
    <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-1">Income Sources</h3>
      <p className="text-xs text-gray-500 mb-4">YTD Breakdown</p>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
