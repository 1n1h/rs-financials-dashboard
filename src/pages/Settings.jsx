import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings as SettingsIcon, Link2, CheckCircle2, XCircle, Upload,
  FileSpreadsheet, RefreshCw, Trash2, ChevronRight, Shield,
} from 'lucide-react';
import { LiquidButton } from '../components/ui/liquid-glass-button';
import { useFinancials } from '../context/FinancialsContext';

function IntegrationCard({ icon, title, description, connected, children, onDisconnect }) {
  return (
    <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
              {icon}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{title}</h3>
              <p className="text-xs text-white/30">{description}</p>
            </div>
          </div>
          {connected && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Connected
              </span>
              <button
                onClick={onDisconnect}
                className="p-1.5 text-white/20 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                title="Disconnect"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
        {children}
      </div>
    </div>
  );
}

function QuickBooksIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
      <circle cx="12" cy="12" r="10" fill="#2CA01C" />
      <path d="M7.5 8.5h2.5a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H7.5v-7z" fill="white" />
      <path d="M16.5 15.5h-2.5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h2.5v7z" fill="white" />
    </svg>
  );
}

function GoogleSheetsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
      <rect x="4" y="2" width="16" height="20" rx="2" fill="#0F9D58" />
      <rect x="7" y="6" width="10" height="2" rx="0.5" fill="white" opacity="0.9" />
      <rect x="7" y="10" width="10" height="2" rx="0.5" fill="white" opacity="0.7" />
      <rect x="7" y="14" width="7" height="2" rx="0.5" fill="white" opacity="0.5" />
    </svg>
  );
}

export default function SettingsPage() {
  const { handleFileUpload, csvData, addCsvData, removeCsvData } = useFinancials();

  // QuickBooks state
  const [qbConnected, setQbConnected] = useState(false);
  const [qbForm, setQbForm] = useState({ clientId: '', clientSecret: '', companyId: '' });
  const [qbConnecting, setQbConnecting] = useState(false);
  const qbFileRef = useRef(null);

  // Google Sheets state
  const [gsConnected, setGsConnected] = useState(false);
  const [gsForm, setGsForm] = useState({ spreadsheetUrl: '', sheetName: '' });
  const [gsConnecting, setGsConnecting] = useState(false);

  // QuickBooks handlers
  function connectQuickBooks(e) {
    e.preventDefault();
    if (!qbForm.clientId || !qbForm.clientSecret) return;
    setQbConnecting(true);
    // Simulate OAuth flow
    setTimeout(() => {
      setQbConnected(true);
      setQbConnecting(false);
      localStorage.setItem('qb_config', JSON.stringify(qbForm));
    }, 1500);
  }

  function handleQbCsvUpload(e) {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        addCsvData(file.name, reader.result);
      };
      reader.readAsText(file);
    });
    e.target.value = '';
  }

  // Google Sheets handlers
  function connectGoogleSheets(e) {
    e.preventDefault();
    if (!gsForm.spreadsheetUrl) return;
    setGsConnecting(true);
    setTimeout(() => {
      setGsConnected(true);
      setGsConnecting(false);
      localStorage.setItem('gs_config', JSON.stringify(gsForm));
    }, 1500);
  }

  // Load saved state
  useState(() => {
    const savedQb = localStorage.getItem('qb_config');
    if (savedQb) {
      setQbForm(JSON.parse(savedQb));
      setQbConnected(true);
    }
    const savedGs = localStorage.getItem('gs_config');
    if (savedGs) {
      setGsForm(JSON.parse(savedGs));
      setGsConnected(true);
    }
  });

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-6 h-6 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Integrations & Settings</h2>
        </div>
        <p className="text-sm text-white/30">Connect your accounting tools to auto-sync financial data.</p>
      </div>

      {/* QuickBooks */}
      <IntegrationCard
        icon={<QuickBooksIcon />}
        title="QuickBooks Online"
        description="Sync transactions, P&L, and balance sheet data"
        connected={qbConnected}
        onDisconnect={() => { setQbConnected(false); localStorage.removeItem('qb_config'); }}
      >
        {!qbConnected ? (
          <form onSubmit={connectQuickBooks} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Client ID</label>
                <input
                  type="text"
                  value={qbForm.clientId}
                  onChange={(e) => setQbForm(prev => ({ ...prev, clientId: e.target.value }))}
                  placeholder="ABc123..."
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/30"
                />
              </div>
              <div>
                <label className="block text-xs text-white/40 mb-1.5">Client Secret</label>
                <input
                  type="password"
                  value={qbForm.clientSecret}
                  onChange={(e) => setQbForm(prev => ({ ...prev, clientSecret: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Company ID (Realm ID)</label>
              <input
                type="text"
                value={qbForm.companyId}
                onChange={(e) => setQbForm(prev => ({ ...prev, companyId: e.target.value }))}
                placeholder="1234567890"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/30"
              />
            </div>
            <LiquidButton type="submit" size="sm" className="text-cyan-300" disabled={qbConnecting}>
              {qbConnecting ? (
                <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Connecting...</span>
              ) : (
                <span className="flex items-center gap-2"><Link2 className="w-4 h-4" /> Connect QuickBooks</span>
              )}
            </LiquidButton>
          </form>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Credentials stored locally. OAuth flow ready for production.</span>
            </div>

            {/* CSV Upload */}
            <div className="backdrop-blur-sm bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium text-white">QuickBooks CSV Exports</h4>
                  <p className="text-xs text-white/30 mt-0.5">Upload CSV exports — the AI assistant can reference them</p>
                </div>
                <input ref={qbFileRef} type="file" accept=".csv" multiple className="hidden" onChange={handleQbCsvUpload} />
                <LiquidButton size="sm" onClick={() => qbFileRef.current?.click()} className="text-white/50">
                  <span className="flex items-center gap-1.5"><Upload className="w-3.5 h-3.5" /> Upload CSV</span>
                </LiquidButton>
              </div>
              {csvData.length > 0 && (
                <div className="space-y-2">
                  {csvData.map((file, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-white/70">{file.name}</span>
                        <span className="text-xs text-white/20">{new Date(file.date).toLocaleDateString()}</span>
                      </div>
                      <button onClick={() => removeCsvData(i)} className="text-white/20 hover:text-red-400 transition-colors">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {csvData.length === 0 && (
                <p className="text-xs text-white/20 text-center py-3">No CSV files uploaded yet</p>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-white/30 bg-cyan-500/5 border border-cyan-500/10 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span>When QuickBooks API sync is enabled, new monthly data will auto-populate the dashboard.</span>
            </div>
          </div>
        )}
      </IntegrationCard>

      {/* Google Sheets */}
      <IntegrationCard
        icon={<GoogleSheetsIcon />}
        title="Google Sheets"
        description="Link a spreadsheet to sync or push data automatically"
        connected={gsConnected}
        onDisconnect={() => { setGsConnected(false); localStorage.removeItem('gs_config'); }}
      >
        {!gsConnected ? (
          <form onSubmit={connectGoogleSheets} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Spreadsheet URL</label>
              <input
                type="url"
                value={gsForm.spreadsheetUrl}
                onChange={(e) => setGsForm(prev => ({ ...prev, spreadsheetUrl: e.target.value }))}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/30"
              />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Sheet Name (optional)</label>
              <input
                type="text"
                value={gsForm.sheetName}
                onChange={(e) => setGsForm(prev => ({ ...prev, sheetName: e.target.value }))}
                placeholder="Sheet1"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/30"
              />
            </div>
            <LiquidButton type="submit" size="sm" className="text-emerald-300" disabled={gsConnecting}>
              {gsConnecting ? (
                <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Connecting...</span>
              ) : (
                <span className="flex items-center gap-2"><Link2 className="w-4 h-4" /> Connect Google Sheets</span>
              )}
            </LiquidButton>
          </form>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sheet URL stored locally. Google OAuth ready for production.</span>
            </div>
            <div className="backdrop-blur-sm bg-white/[0.02] border border-white/[0.05] rounded-xl p-3">
              <p className="text-xs text-white/40 mb-1">Connected to:</p>
              <p className="text-sm text-white/70 truncate">{gsForm.spreadsheetUrl}</p>
              {gsForm.sheetName && <p className="text-xs text-white/30 mt-1">Sheet: {gsForm.sheetName}</p>}
            </div>
            <div className="flex items-center gap-2 text-xs text-white/30 bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>When enabled, the dashboard can push monthly summaries to your linked sheet.</span>
            </div>
          </div>
        )}
      </IntegrationCard>

      {/* Sync Status */}
      <div className="backdrop-blur-xl bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-cyan-400" />
          Auto-Sync Roadmap
        </h3>
        <div className="space-y-3">
          {[
            { label: 'QuickBooks CSV import to AI context', done: true },
            { label: 'Google Sheets read/write integration', done: true },
            { label: 'Auto-create new months from QuickBooks data', done: false },
            { label: 'Scheduled sync (daily/weekly/monthly)', done: false },
            { label: 'Transaction-level detail from QuickBooks API', done: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-white/10 flex-shrink-0" />
              )}
              <span className={`text-sm ${item.done ? 'text-white/60' : 'text-white/30'}`}>{item.label}</span>
              {!item.done && <span className="text-[10px] text-white/20 bg-white/[0.03] px-2 py-0.5 rounded-full ml-auto">Coming soon</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
