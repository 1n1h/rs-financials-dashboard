import { useFinancials } from '../context/FinancialsContext';
import MetricCard from '../components/MetricCard';
import MonthlyChart from '../components/MonthlyChart';
import IncomeBreakdown from '../components/IncomeBreakdown';
import ExpenseDonut from '../components/ExpenseDonut';
import VisaBreakdown from '../components/VisaBreakdown';
import VV1Expenses from '../components/VV1Expenses';
import BalanceTrend from '../components/BalanceTrend';
import AccountRegister from '../components/AccountRegister';

export default function Dashboard() {
  const { data, loading, error } = useFinancials();

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
        <div className="bg-white/5 border border-red-500/30 rounded-2xl p-8 max-w-md text-center">
          <p className="text-red-400 font-semibold mb-2">Failed to load financial data</p>
          <p className="text-gray-500 text-sm mb-4">{error || 'Unknown error'}</p>
          <p className="text-gray-600 text-xs">Try uploading the Excel file using the Upload button above.</p>
        </div>
      </div>
    );
  }

  // Latest balance: last non-null from brokerage
  const latestBrokerage = data._lastNonNull(data.balances.trust5299);

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Income" value={data.income.ytdTotal} color="green" />
        <MetricCard label="Total Expenses" value={data.expenses.ytdTotal} color="red" />
        <MetricCard label="Net Income" value={data.net.ytdTotal} color="dynamic" />
        <MetricCard label="Brokerage Balance" value={latestBrokerage} color="white" />
      </div>

      {/* Monthly Chart */}
      <MonthlyChart
        months={data.months}
        income={data.income.total}
        expenses={data.expenses.total}
        net={data.net.monthly}
      />

      {/* Income + Expense Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncomeBreakdown breakdown={data.income.breakdown} />
        <ExpenseDonut expenses={data.expenses} />
      </div>

      {/* Visa + VV1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VisaBreakdown visa={data.expenses.visa} />
        <VV1Expenses vv1={data.expenses.vv1} />
      </div>

      {/* Balance + Register */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BalanceTrend months={data.months} balances={data.balances} />
        <AccountRegister accounts={data.accounts} balances={data.balances} />
      </div>
    </div>
  );
}
