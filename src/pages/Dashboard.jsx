import { useState } from 'react';
import { useFinancials } from '../context/FinancialsContext';
import MetricCard from '../components/MetricCard';
import MonthlyChart from '../components/MonthlyChart';
import IncomeBreakdown from '../components/IncomeBreakdown';
import ExpenseDonut from '../components/ExpenseDonut';
import VisaBreakdown from '../components/VisaBreakdown';
import VV1Expenses from '../components/VV1Expenses';
import BalanceTrend from '../components/BalanceTrend';
import AccountRegister from '../components/AccountRegister';
import MonthDetail from '../components/MonthDetail';
import { LiquidButton } from '../components/ui/liquid-glass-button';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Dashboard() {
  const { data, loading, error } = useFinancials();
  const [view, setView] = useState('year');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Parsing financial data...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-8 max-w-md text-center">
          <p className="text-red-400 font-semibold mb-2">Failed to load financial data</p>
          <p className="text-gray-500 text-sm mb-4">{error || 'Unknown error'}</p>
          <p className="text-gray-600 text-xs">Try uploading the Excel file using the Upload button above.</p>
        </div>
      </div>
    );
  }

  const latestBrokerage = data._lastNonNull(data.balances.trust5299);

  return (
    <div className="space-y-6 relative">

      {/* Period Selector */}
      <div className="flex flex-wrap items-center gap-2">
        <LiquidButton
          onClick={() => setView('year')}
          size="sm"
          className={view === 'year' ? 'text-cyan-300' : 'text-gray-400'}
        >
          Full Year
        </LiquidButton>
        <div className="w-px h-6 bg-white/10 mx-1" />
        {MONTHS.map((m, i) => (
          <button
            key={m}
            onClick={() => setView(i)}
            className={`px-3 py-2 text-xs font-medium rounded-xl transition-all duration-200 ${
              view === i
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                : 'bg-white/[0.03] text-gray-500 hover:text-white hover:bg-white/[0.06] border border-white/[0.05]'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {view === 'year' ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Total Income" value={data.income.ytdTotal} color="green" />
            <MetricCard label="Total Expenses" value={data.expenses.ytdTotal} color="red" />
            <MetricCard label="Net Income" value={data.net.ytdTotal} color="dynamic" />
            <MetricCard label="Brokerage Balance" value={latestBrokerage} color="white" />
          </div>

          <MonthlyChart
            months={data.months}
            income={data.income.total}
            expenses={data.expenses.total}
            net={data.net.monthly}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncomeBreakdown breakdown={data.income.breakdown} />
            <ExpenseDonut expenses={data.expenses} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <VisaBreakdown visa={data.expenses.visa} />
            <VV1Expenses vv1={data.expenses.vv1} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BalanceTrend months={data.months} balances={data.balances} />
            <AccountRegister accounts={data.accounts} balances={data.balances} />
          </div>
        </>
      ) : (
        <MonthDetail data={data} monthIdx={view} />
      )}
    </div>
  );
}
