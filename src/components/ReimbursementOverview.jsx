import { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { ArrowDown, ArrowUp, AlertTriangle } from 'lucide-react';

const fmt = (n) => {
  if (n === 0) return '$0.00';
  const abs = Math.abs(n);
  const s = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? `-$${s}` : `$${s}`;
};

export default function ReimbursementOverview({ data }) {
  const MONTHLY_COST = 6500;
  const months = data.months;

  // Find LTC-related line items for monthly breakdown
  const ltcIncomeItem = data.lineItems.find(i => i.label === 'LTC Reimbursement');
  const ltcExpensePersonal = data.lineItems.find(i => i.label === 'Asst Living/LTC Reimb');
  const ltcExpenseTrust = data.lineItems.find(i => i.label === 'Reimb to WS for LTC');
  const ltcExpense7850 = data.lineItems.find(i => i.label === 'Assisted Living/LTC (7850)');
  const ltcExpenseTrustGen = data.lineItems.find(i => i.label === 'Assisted Living/LTC (5777)');

  const analysis = useMemo(() => {
    const incomeMonthly = ltcIncomeItem?.monthly || new Array(12).fill(0);

    // Combine all LTC expense outflows
    const expenseMonthly = months.map((_, i) => {
      let total = 0;
      if (ltcExpensePersonal) total += ltcExpensePersonal.monthly[i];
      if (ltcExpenseTrust) total += ltcExpenseTrust.monthly[i];
      if (ltcExpense7850) total += ltcExpense7850.monthly[i];
      if (ltcExpenseTrustGen) total += ltcExpenseTrustGen.monthly[i];
      return total;
    });

    const totalIncome = incomeMonthly.reduce((a, b) => a + b, 0);
    const totalExpense = expenseMonthly.reduce((a, b) => a + b, 0);
    const annualCost = MONTHLY_COST * 12;
    const netPosition = totalIncome - totalExpense;

    // Flag months with large reimbursement events (>$10k)
    const largeEvents = [];
    incomeMonthly.forEach((val, i) => {
      if (val >= 10000) largeEvents.push({ month: months[i], amount: val });
    });
    expenseMonthly.forEach((val, i) => {
      if (val >= 10000) largeEvents.push({ month: months[i], amount: -val, type: 'out' });
    });

    return { incomeMonthly, expenseMonthly, totalIncome, totalExpense, annualCost, netPosition, largeEvents };
  }, [data, ltcIncomeItem, ltcExpensePersonal, ltcExpenseTrust, ltcExpense7850, ltcExpenseTrustGen]);

  const chartData = {
    labels: months,
    datasets: [
      {
        label: 'LTC Income (Reimbursed)',
        data: analysis.incomeMonthly,
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: 'LTC Expense (Paid Out)',
        data: analysis.expenseMonthly,
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        borderRadius: 4,
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
          label: (ctx) => `${ctx.dataset.label}: $${ctx.parsed.y.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7280', font: { size: 11 } } },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: {
          color: '#6b7280',
          callback: (v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`,
        },
      },
    },
  };

  return (
    <div className="backdrop-blur-xl bg-glass border border-glass-border rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">LTC Reimbursement Workflow</h3>
          <p className="text-xs text-text-secondary mt-0.5">Will's assisted living cost vs LTC policy reimbursements</p>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-glass border border-glass-border rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Monthly Cost</p>
          <p className="text-lg font-bold text-red-400">{fmt(MONTHLY_COST)}</p>
        </div>
        <div className="bg-glass border border-glass-border rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">YTD Reimbursed</p>
          <p className="text-lg font-bold text-emerald-400 flex items-center gap-1">
            <ArrowDown className="w-3.5 h-3.5" />
            {fmt(analysis.totalIncome)}
          </p>
        </div>
        <div className="bg-glass border border-glass-border rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">YTD Paid Out</p>
          <p className="text-lg font-bold text-red-400 flex items-center gap-1">
            <ArrowUp className="w-3.5 h-3.5" />
            {fmt(analysis.totalExpense)}
          </p>
        </div>
        <div className="bg-glass border border-glass-border rounded-xl p-3">
          <p className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Net Position</p>
          <p className={`text-lg font-bold ${analysis.netPosition >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {fmt(analysis.netPosition)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-56 mb-4">
        <Bar data={chartData} options={chartOptions} />
      </div>

      {/* Large reimbursement events */}
      {analysis.largeEvents.length > 0 && (
        <div className="mt-3 space-y-1.5">
          <p className="text-xs text-text-secondary flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Large reimbursement events (timing differences):
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.largeEvents.map((evt, i) => (
              <span key={i} className={`text-xs px-2.5 py-1 rounded-lg border ${
                evt.type === 'out'
                  ? 'bg-red-500/10 border-red-500/20 text-red-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}>
                {evt.month}: {fmt(Math.abs(evt.amount))} {evt.type === 'out' ? 'paid' : 'received'}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-[10px] text-text-muted mt-4">
        Will pays $6,500/month for Rosemary's assisted living. ~$4,500/month is covered by the LTC policy.
        Reimbursements arrive in large irregular chunks from the trust, creating timing differences.
      </p>
    </div>
  );
}
