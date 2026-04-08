import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { FinancialsProvider, useFinancials } from './context/FinancialsContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/Chat';
import SettingsPage from './pages/Settings';
import FileUpload from './components/FileUpload';
import ChatAssistant from './components/ChatAssistant';
import ThemeToggle from './components/ThemeToggle';
import { LiquidButton } from './components/ui/liquid-glass-button';
import { BeamsBackground } from './components/ui/beams-background';

function Nav() {
  const { toast } = useFinancials();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? isDark
          ? 'bg-white/[0.08] text-white shadow-[0_0_12px_rgba(255,255,255,0.05)]'
          : 'bg-black/[0.06] text-black shadow-[0_0_12px_rgba(0,0,0,0.03)]'
        : isDark
          ? 'text-white/40 hover:text-white/80 hover:bg-white/[0.04]'
          : 'text-black/40 hover:text-black/80 hover:bg-black/[0.04]'
    }`;

  return (
    <>
      <nav className="sticky top-0 z-40 backdrop-blur-2xl bg-nav-bg border-b border-glass-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <NavLink to="/" className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-cyan-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2L2 10l8 8 8-8-8-8z" />
              </svg>
              <span className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>RS Financials</span>
            </NavLink>

            <div className="hidden sm:flex items-center gap-1">
              <NavLink to="/" className={linkClass} end>Home</NavLink>
              <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
              <NavLink to="/chat" className={linkClass}>Chat</NavLink>
              <NavLink to="/settings" className={linkClass}>Settings</NavLink>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <FileUpload />
              <NavLink to="/chat">
                <LiquidButton size="sm" className={isDark ? 'text-cyan-300' : 'text-cyan-700'}>
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="mb-8">
      <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${
        isDark
          ? 'bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/50'
          : 'text-gray-900'
      }`}>
        Rosemary Schafer — Financial Dashboard
      </h1>
      <div className="flex flex-wrap items-center gap-3 mt-2">
        <p className="text-text-secondary text-sm">January – December 2025 · Personal & Trust</p>
        {lastUpdated && (
          <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary bg-glass border border-glass-border px-2.5 py-1 rounded-full">
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
  const { theme } = useTheme();
  const isLanding = location.pathname === '/';
  const isDark = theme === 'dark';

  if (isLanding) {
    return (
      <>
        <Landing />
        <ChatAssistant />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-page-bg relative">
      {isDark && <BeamsBackground intensity="subtle" />}
      <div className="relative z-10">
        <Nav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <PageHeader />
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
      <ChatAssistant />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <FinancialsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<AppLayout />} />
          </Routes>
        </BrowserRouter>
      </FinancialsProvider>
    </ThemeProvider>
  );
}
