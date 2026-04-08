import { useMemo } from 'react';

const fmt = (n) => {
  if (n === 0) return '—';
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return n < 0 ? `-$${formatted}` : `$${formatted}`;
};

function SectionTable({ title, items, monthIdx, color }) {
  if (items.length === 0) return null;
  const sectionTotal = items.reduce((sum, item) => sum + item.monthly[monthIdx], 0);

  return (
    <div className="mb-6">
      <h4 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${color}`}>{title}</h4>
      <div className="space-y-0.5">
        {items
          .filter(item => item.monthly[monthIdx] !== 0)
          .sort((a, b) => Math.abs(b.monthly[monthIdx]) - Math.abs(a.monthly[monthIdx]))
          .map((item) => (
            <div key={item.label} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.03] transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{item.section}</span>
                <span className="text-sm text-gray-300">{item.label}</span>
              </div>
              <span className="text-sm font-mono text-white">{fmt(item.monthly[monthIdx])}</span>
            </div>
          ))}
        <div className="flex items-center justify-between py-2 px-3 border-t border-white/10 mt-1">
          <span className="text-sm font-semibold text-gray-400">Subtotal</span>
          <span className={`text-sm font-bold font-mono ${color}`}>{fmt(sectionTotal)}</span>
        </div>
      </div>
    </div>
  );
}

export default function MonthDetail({ data, monthIdx }) {
  const month = data.months[monthIdx];

  const incomeItems = useMemo(() =>
    data.lineItems.filter(i => i.category === 'Income'), [data.lineItems]);
  const expenseItems = useMemo(() =>
    data.lineItems.filter(i => i.category === 'Expense'), [data.lineItems]);

  const monthIncome = data.income.total[monthIdx];
  const monthExpenses = data.expenses.total[monthIdx];
  const monthNet = data.net.monthly[monthIdx];

  // Balances for this month
  const balanceRows = [
    { label: 'Personal Checking (9553)', value: data.balances.personal9553[monthIdx] },
    { label: 'Trust Checking (5777)', value: data.balances.trust5777[monthIdx] },
    { label: 'VV1 Checking (3952)', value: data.balances.vv13952[monthIdx] },
    { label: 'VV1 Security Dep. (6121)', value: data.balances.vv16121[monthIdx] },
    { label: 'Trust Brokerage (5299)', value: data.balances.trust5299[monthIdx] },
  ].filter(b => b.value !== 0);

  return (
    <div className="space-y-6">
      {/* Month Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Income — {month}</p>
          <p className="text-2xl font-bold text-emerald-400">{fmt(monthIncome)}</p>
        </div>
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Expenses — {month}</p>
          <p className="text-2xl font-bold text-red-400">{fmt(monthExpenses)}</p>
        </div>
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1">Net — {month}</p>
          <p className={`text-2xl font-bold ${monthNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{fmt(monthNet)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Detail */}
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Income — {month} 2025</h3>
          <SectionTable title="Personal Income" items={incomeItems.filter(i => i.section === 'Personal')} monthIdx={monthIdx} color="text-emerald-400" />
          <SectionTable title="Trust Income" items={incomeItems.filter(i => i.section === 'Trust')} monthIdx={monthIdx} color="text-cyan-400" />
          <div className="flex items-center justify-between py-3 px-3 bg-emerald-500/10 rounded-xl mt-2">
            <span className="text-sm font-bold text-emerald-300">Total Income</span>
            <span className="text-lg font-bold font-mono text-emerald-400">{fmt(monthIncome)}</span>
          </div>
        </div>

        {/* Expense Detail */}
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Expenses — {month} 2025</h3>
          <SectionTable title="Personal Visa" items={expenseItems.filter(i => i.section === 'Personal Visa')} monthIdx={monthIdx} color="text-red-400" />
          <SectionTable title="Personal Other" items={expenseItems.filter(i => i.section === 'Personal')} monthIdx={monthIdx} color="text-orange-400" />
          <SectionTable title="VV1 Rental" items={expenseItems.filter(i => i.section === 'VV1')} monthIdx={monthIdx} color="text-purple-400" />
          <SectionTable title="Trust" items={expenseItems.filter(i => i.section === 'Trust')} monthIdx={monthIdx} color="text-amber-400" />
          <SectionTable title="Professional" items={expenseItems.filter(i => i.section === 'Professional')} monthIdx={monthIdx} color="text-cyan-400" />
          <div className="flex items-center justify-between py-3 px-3 bg-red-500/10 rounded-xl mt-2">
            <span className="text-sm font-bold text-red-300">Total Expenses</span>
            <span className="text-lg font-bold font-mono text-red-400">{fmt(monthExpenses)}</span>
          </div>
        </div>
      </div>

      {/* Balances for the month */}
      {balanceRows.length > 0 && (
        <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Account Balances — End of {month}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {balanceRows.map(b => (
              <div key={b.label} className="flex items-center justify-between py-3 px-4 bg-white/[0.03] rounded-xl">
                <span className="text-sm text-gray-400">{b.label}</span>
                <span className="text-sm font-mono font-semibold text-white">{fmt(b.value)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between py-3 px-4 bg-cyan-500/10 rounded-xl mt-3">
            <span className="text-sm font-bold text-cyan-300">Total Balance</span>
            <span className="text-lg font-bold font-mono text-cyan-400">{fmt(data.balances.grandTotal[monthIdx])}</span>
          </div>
        </div>
      )}
    </div>
  );
}
