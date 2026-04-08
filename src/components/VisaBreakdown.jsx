import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function VisaBreakdown({ visa }) {
  const items = [
    { label: 'Personal Supplies', value: visa.personalSupplies },
    { label: 'Medical', value: visa.medical },
    { label: 'Hair & Nails', value: visa.hairAndNails },
    { label: 'Meals/Entertain.', value: visa.meals },
    { label: 'Clothing', value: visa.clothing },
    { label: 'Pharmacy', value: visa.pharmacy },
    { label: 'Aide', value: visa.aide },
    { label: 'Other', value: visa.other },
  ].filter(i => i.value > 0).sort((a, b) => b.value - a.value);

  const colors = ['#ef4444', '#f97316', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#6366f1'];

  const data = {
    labels: items.map(i => i.label),
    datasets: [{
      data: items.map(i => i.value),
      backgroundColor: items.map((_, i) => colors[i % colors.length] + 'cc'),
      borderColor: items.map((_, i) => colors[i % colors.length]),
      borderWidth: 1,
      borderRadius: 6,
      barThickness: 28,
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
          callback: (v) => v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v}`,
        },
      },
      y: {
        grid: { display: false },
        ticks: { color: '#d1d5db', font: { size: 11 } },
      },
    },
  };

  return (
    <div className="backdrop-blur-xl bg-glass border border-glass-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-1">Visa Spending</h3>
      <p className="text-xs text-gray-500 mb-4">
        Total: ${visa.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
