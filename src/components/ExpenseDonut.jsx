import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpenseDonut({ expenses }) {
  const items = [
    { label: 'Visa CC', value: expenses.visa.total, color: '#ef4444' },
    { label: 'LTC Reimb Out', value: expenses.ltcReimbursementOut, color: '#f97316' },
    { label: 'VV1 Operating', value: Object.values(expenses.vv1).reduce((a, b) => a + b, 0), color: '#8b5cf6' },
    { label: 'Aide Care', value: expenses.aideCare, color: '#ec4899' },
    { label: 'Professional Fees', value: expenses.professional, color: '#06b6d4' },
    { label: 'Blue Cross', value: expenses.visa.blueCross, color: '#f59e0b' },
  ].filter(i => i.value > 0).sort((a, b) => b.value - a.value);

  const data = {
    labels: items.map(i => i.label),
    datasets: [{
      data: items.map(i => i.value),
      backgroundColor: items.map(i => i.color + 'cc'),
      borderColor: '#0a0a0a',
      borderWidth: 3,
      hoverOffset: 8,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'right',
        labels: { color: '#d1d5db', padding: 12, usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#fff',
        bodyColor: '#d1d5db',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = ((ctx.parsed / total) * 100).toFixed(1);
            return ` $${ctx.parsed.toLocaleString('en-US', { minimumFractionDigits: 2 })} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-1">Expense Categories</h3>
      <p className="text-xs text-gray-500 mb-4">YTD Distribution</p>
      <div className="h-64">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}
