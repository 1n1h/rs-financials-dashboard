import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { FinancialsProvider, useFinancials } from './context/FinancialsContext';
import Dashboard from './pages/Dashboard';
import ChatPage from './pages/Chat';
import FileUpload from './components/FileUpload';
import ChatAssistant from './components/ChatAssistant';

function Nav() {
  const { lastUpdated, toast } = useFinancials();
  const linkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <>
      <nav className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2L2 10l8 8 8-8-8-8z" />
              </svg>
              <span className="text-lg font-bold text-white tracking-tight">RS Financials</span>
            </div>

            {/* Nav Links */}
            <div className="hidden sm:flex items-center gap-1">
              <NavLink to="/" className={linkClass} end>Overview</NavLink>
              <NavLink to="/chat" className={linkClass}>Chat</NavLink>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <FileUpload />
              <NavLink
                to="/chat"
                className="px-4 py-2 text-sm font-medium bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl transition-colors"
              >
                Ask AI
              </NavLink>
            </div>
          </div>
        </div>
      </nav>

      {/* Toast */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm px-4 py-3 rounded-xl backdrop-blur-sm animate-[fadeIn_0.3s]">
          {toast}
        </div>
      )}
    </>
  );
}

function PageHeader() {
  const { lastUpdated, fileName } = useFinancials();
  return (
    <div className="mb-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
        Rosemary Schafer — Financial Dashboard
      </h1>
      <div className="flex flex-wrap items-center gap-3 mt-2">
        <p className="text-gray-500 text-sm">January – December 2025 · Personal & Trust</p>
        {lastUpdated && (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-white/5 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Updated {lastUpdated.toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <FinancialsProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#0a0a0a]">
          <Nav />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <PageHeader />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/chat" element={<ChatPage />} />
            </Routes>
          </main>
          <ChatAssistant />
        </div>
      </BrowserRouter>
    </FinancialsProvider>
  );
}
