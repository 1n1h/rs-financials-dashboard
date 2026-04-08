import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { FinancialsProvider, useFinancials } from './context/FinancialsContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/Chat';
import FileUpload from './components/FileUpload';
import ChatAssistant from './components/ChatAssistant';
import { LiquidButton } from './components/ui/liquid-glass-button';

function Nav() {
  const { toast } = useFinancials();
  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-white/[0.08] text-white shadow-[0_0_12px_rgba(255,255,255,0.05)]'
        : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
    }`;

  return (
    <>
      <nav className="sticky top-0 z-40 backdrop-blur-2xl bg-[#030303]/60 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2L2 10l8 8 8-8-8-8z" />
              </svg>
              <span className="text-lg font-bold text-white tracking-tight">RS Financials</span>
            </NavLink>

            <div className="hidden sm:flex items-center gap-1">
              <NavLink to="/" className={linkClass} end>Home</NavLink>
              <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
              <NavLink to="/chat" className={linkClass}>Chat</NavLink>
            </div>

            <div className="flex items-center gap-3">
              <FileUpload />
              <NavLink to="/chat">
                <LiquidButton size="sm" className="text-cyan-300">
                  Ask AI
                </LiquidButton>
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/20 text-emerald-300 text-sm px-4 py-3 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          {toast}
        </div>
      )}
    </>
  );
}

function PageHeader() {
  const { lastUpdated } = useFinancials();
  return (
    <div className="mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/50">
        Rosemary Schafer — Financial Dashboard
      </h1>
      <div className="flex flex-wrap items-center gap-3 mt-2">
        <p className="text-white/30 text-sm">January – December 2025 · Personal & Trust</p>
        {lastUpdated && (
          <span className="inline-flex items-center gap-1.5 text-xs text-white/30 bg-white/[0.03] border border-white/[0.05] px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Updated {lastUpdated.toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

function AppLayout() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) {
    return (
      <>
        <Landing />
        <ChatAssistant />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#030303]">
      <Nav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader />
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<ChatPage />} />
        </Routes>
      </main>
      <ChatAssistant />
    </div>
  );
}

export default function App() {
  return (
    <FinancialsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<AppLayout />} />
        </Routes>
      </BrowserRouter>
    </FinancialsProvider>
  );
}
