export default function MetricCard({ label, value, color = 'white', prefix = '$' }) {
  const colorMap = {
    green: 'text-emerald-400',
    red: 'text-red-400',
    cyan: 'text-cyan-400',
    white: 'text-white',
    dynamic: value >= 0 ? 'text-emerald-400' : 'text-red-400',
  };

  const glowMap = {
    green: 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]',
    red: 'hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]',
    cyan: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]',
    white: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]',
    dynamic: value >= 0 ? 'hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]',
  };

  const borderGlow = {
    green: 'hover:border-emerald-500/20',
    red: 'hover:border-red-500/20',
    cyan: 'hover:border-cyan-500/20',
    white: 'hover:border-cyan-500/15',
    dynamic: value >= 0 ? 'hover:border-emerald-500/20' : 'hover:border-red-500/20',
  };

  const fmt = (n) => {
    const abs = Math.abs(n);
    const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return n < 0 ? `-${prefix}${formatted}` : `${prefix}${formatted}`;
  };

  return (
    <div className={`relative backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 transition-all duration-500 ${glowMap[color]} ${borderGlow[color]} hover:bg-white/[0.05] group overflow-hidden`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <p className="relative text-xs font-medium uppercase tracking-wider text-white/40 mb-2">{label}</p>
      <p className={`relative text-3xl font-bold ${colorMap[color]} tracking-tight`}>
        {fmt(value)}
      </p>
    </div>
  );
}
