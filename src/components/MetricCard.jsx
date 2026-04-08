export default function MetricCard({ label, value, color = 'white', prefix = '$' }) {
  const colorMap = {
    green: 'text-emerald-400',
    red: 'text-red-400',
    cyan: 'text-cyan-400',
    white: 'text-white',
    dynamic: value >= 0 ? 'text-emerald-400' : 'text-red-400',
  };

  const glowMap = {
    green: 'hover:shadow-emerald-500/20',
    red: 'hover:shadow-red-500/20',
    cyan: 'hover:shadow-cyan-500/20',
    white: 'hover:shadow-cyan-500/10',
    dynamic: value >= 0 ? 'hover:shadow-emerald-500/20' : 'hover:shadow-red-500/20',
  };

  const fmt = (n) => {
    const abs = Math.abs(n);
    const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return n < 0 ? `-${prefix}${formatted}` : `${prefix}${formatted}`;
  };

  return (
    <div className={`bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg ${glowMap[color]} hover:bg-white/[0.07] group`}>
      <p className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-2">{label}</p>
      <p className={`text-3xl font-bold ${colorMap[color]} tracking-tight`}>
        {fmt(value)}
      </p>
    </div>
  );
}
