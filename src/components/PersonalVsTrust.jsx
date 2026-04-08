import { Bar } from 'react-chartjs-2';

const fmt = (n) => {
  const abs = Math.abs(n);
  const s = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? `-$${s}` : `$${s}`;
};

export default function PersonalVsTrust({ data }) {
  const personalIncome = data.income.personal.reduce((a, b) => a + b, 0);
  const trustIncome = data.income.trust.reduce((a, b) => a + b, 0);
  const personalExpense = data.expenses.personal.reduce((a, b) => a + b, 0);
  const trustExpense = data.expenses.trust.reduce((a, b) => a + b, 0);
  const personalNet = personalIncome - personalExpense;
  const trustNet = trustIncome - trustExpense;

  const chartData = {
    labels: ['Income', 'Expenses', 'Net'],
    datasets: [
      {
        label: 'Personal',
        data: [personalIncome, personalExpense, personalNet],
        backgroundColor: ['rgba(6, 182, 212, 0.6)', 'rgba(6, 182, 212, 0.6)', personalNet >= 0 ? 'rgba(6, 182, 212, 0.6)' : 'rgba(6, 182, 212, 0.3)'],
        borderColor: 'rgba(6, 182, 212, 1)',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.6,
      },
      {
        label: 'Trust',
        data: [trustIncome, trustExpense, trustNet],
        backgroundColor: ['rgba(139, 92, 246, 0.6)', 'rgba(139, 92, 246, 0.6)', trustNet >= 0 ? 'rgba(139, 92, 246, 0.6)' : 'rgba(139, 92, 246, 0.3)'],
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1,
        borderRadius: 6,
        barPercentage: 0.6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#9ca3af', usePointStyle: true, pointStyleWidth: 10, padding: 16, font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: '#1f2937',
        titleColor: '#fff',
        bodyColor: '#d1d5db',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: $${Math.abs(ctx.parsed.y).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 12 } } },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#6b7280',
          callback: (v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : v <= -1000 ? `-$${(Math.abs(v) / 1000).toFixed(0)}k` : `$${v}`,
        },
      },
    },
  };

  return (
    <div className="backdrop-blur-xl bg-glass border border-glass-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-1">Personal vs Trust</h3>
      <p className="text-xs text-text-secondary mb-4">YTD comparison of personal and trust accounts</p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Personal */}
        <div className="bg-glass border border-glass-border rounded-xl p-3 space-y-2">
          <p className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Personal</p>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Income</span>
            <span className="text-emerald-400 font-mono">{fmt(personalIncome)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Expenses</span>
            <span className="text-red-400 font-mono">{fmt(personalExpense)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-glass-border pt-2">
            <span className="text-text-secondary font-medium">Net</span>
            <span className={`font-bold font-mono ${personalNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(personalNet)}</span>
          </div>
        </div>

        {/* Trust */}
        <div className="bg-glass border border-glass-border rounded-xl p-3 space-y-2">
          <p className="text-xs font-medium text-violet-400 uppercase tracking-wider">Trust</p>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Income</span>
            <span className="text-emerald-400 font-mono">{fmt(trustIncome)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Expenses</span>
            <span className="text-red-400 font-mono">{fmt(trustExpense)}</span>
          </div>
          <div className="flex justify-between text-sm border-t border-glass-border pt-2">
            <span className="text-text-secondary font-medium">Net</span>
            <span className={`font-bold font-mono ${trustNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(trustNet)}</span>
          </div>
        </div>
      </div>

      <div className="h-56">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
}
