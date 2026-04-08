import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function VV1Expenses({ vv1 }) {
  const items = [
    { label: 'Taxes', value: vv1.taxes },
    { label: 'HOA', value: vv1.hoa },
    { label: 'Repair & Maint.', value: vv1.repairMaintenance },
    { label: 'LLC Registration', value: vv1.llcRegistration },
    { label: 'Insurance', value: vv1.insurance },
    { label: 'Utilities', value: vv1.utilities },
    { label: 'Township', value: vv1.township },
  ].filter(i => i.value > 0).sort((a, b) => b.value - a.value);

  const colors = ['#8b5cf6', '#a78bfa', '#7c3aed', '#6d28d9', '#c084fc', '#ddd6fe', '#e9d5ff'];
  const total = items.reduce((a, i) => a + i.value, 0);

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
      <h3 className="text-lg font-semibold text-text-primary mb-1">VV1 Rental Expenses</h3>
      <p className="text-xs text-gray-500 mb-4">
        Total: ${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
