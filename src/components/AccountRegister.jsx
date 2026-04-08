export default function AccountRegister({ accounts, balances }) {
  const balanceMap = {
    '9553': balances.personal9553,
    '5777': balances.trust5777,
    '5299': balances.trust5299,
    '3952': balances.vv13952,
    '6121': balances.vv16121,
  };

  function getLatestBalance(id) {
    const arr = balanceMap[id];
    if (!arr) return null;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] !== 0 && arr[i] != null) return arr[i];
    }
    return 0;
  }

  const statusColor = {
    active: 'bg-emerald-500/20 text-emerald-400',
    closed: 'bg-red-500/20 text-red-400',
  };

  const typeColor = {
    Personal: 'text-cyan-400',
    Trust: 'text-purple-400',
    Rental: 'text-amber-400',
  };

  return (
    <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-white mb-1">Account Register</h3>
      <p className="text-xs text-gray-500 mb-4">All accounts overview</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left py-3 px-2 text-gray-500 font-medium text-xs uppercase tracking-wider">Account</th>
              <th className="text-left py-3 px-2 text-gray-500 font-medium text-xs uppercase tracking-wider">Type</th>
              <th className="text-left py-3 px-2 text-gray-500 font-medium text-xs uppercase tracking-wider">Status</th>
              <th className="text-right py-3 px-2 text-gray-500 font-medium text-xs uppercase tracking-wider">Balance</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((acct) => {
              const bal = getLatestBalance(acct.id);
              return (
                <tr key={acct.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                  <td className="py-3 px-2">
                    <span className="text-white font-medium">{acct.name}</span>
                    <span className="text-gray-600 ml-2 text-xs">#{acct.id}</span>
                  </td>
                  <td className={`py-3 px-2 ${typeColor[acct.type] || 'text-gray-400'}`}>
                    {acct.type}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[acct.status]}`}>
                      {acct.status === 'active' ? 'Active' : `Closed ${acct.closedDate || ''}`}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right font-mono">
                    {bal !== null
                      ? <span className="text-white">${bal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      : <span className="text-gray-600">—</span>
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
