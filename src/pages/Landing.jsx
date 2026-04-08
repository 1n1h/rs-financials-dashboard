import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  BarChart3, MessageSquare, Upload, Calendar, Shield, TrendingUp,
  PieChart, CreditCard, Building2, ArrowRight, Bot, FileSpreadsheet,
  Eye, ChevronRight,
} from 'lucide-react';
import { HeroGeometric } from '../components/ui/shape-landing-hero';
import { LiquidButton } from '../components/ui/liquid-glass-button';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.8, delay: i * 0.1, ease: [0.25, 0.4, 0.25, 1] },
  }),
};

function FeatureCard({ icon: Icon, title, description, color, delay = 0 }) {
  return (
    <motion.div
      custom={delay}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      className="group relative bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 hover:bg-white/[0.06] hover:border-white/[0.12] transition-all duration-500"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color} bg-opacity-10`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function StatCard({ value, label, delay }) {
  return (
    <motion.div
      custom={delay}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="text-center"
    >
      <p className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400">{value}</p>
      <p className="text-sm text-white/40 mt-1">{label}</p>
    </motion.div>
  );
}

export default function Landing() {
  return (
    <div className="bg-[#030303] min-h-screen relative">
      {/* ===== TOP-RIGHT DASHBOARD BUTTON ===== */}
      <div className="fixed top-5 right-6 z-50">
        <Link to="/dashboard">
          <LiquidButton size="sm" className="text-cyan-300">
            <span className="flex items-center gap-2">
              Dashboard
              <ArrowRight className="w-4 h-4" />
            </span>
          </LiquidButton>
        </Link>
      </div>

      {/* ===== HERO ===== */}
      <HeroGeometric
        badge="RS Financials"
        title1="Your Complete"
        title2="Financial Dashboard"
        description="A real-time financial overview for Rosemary Schafer's personal and trust accounts. Every dollar tracked, every month visualized, powered by AI insights."
      >
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/dashboard">
            <LiquidButton size="xl" className="text-cyan-300 text-base">
              <span className="flex items-center gap-2">
                Open Dashboard
                <ArrowRight className="w-5 h-5" />
              </span>
            </LiquidButton>
          </Link>
          <a href="#features">
            <LiquidButton size="xl" variant="outline" className="text-white/70 text-base">
              <span className="flex items-center gap-2">
                See Features
                <ChevronRight className="w-4 h-4" />
              </span>
            </LiquidButton>
          </a>
        </div>
      </HeroGeometric>

      {/* ===== STATS BAR ===== */}
      <div className="relative z-10 -mt-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl p-8 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <StatCard value="7" label="Accounts Tracked" delay={0} />
            <StatCard value="12" label="Months of Data" delay={1} />
            <StatCard value="30+" label="Line Items Parsed" delay={2} />
            <StatCard value="AI" label="Powered Insights" delay={3} />
          </div>
        </div>
      </div>

      {/* ===== WHAT IS THIS ===== */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <p className="text-xs font-medium uppercase tracking-widest text-cyan-400 mb-4">What is this?</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 tracking-tight">
              A live financial dashboard built from your bookkeeping data
            </h2>
            <p className="text-white/40 text-lg leading-relaxed">
              This dashboard reads directly from the Excel workbook maintained by your bookkeeper.
              Every number you see is parsed in real-time — nothing is hardcoded. When the file is updated,
              the dashboard updates automatically. You can also upload a new file at any time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section id="features" className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-medium uppercase tracking-widest text-cyan-400 mb-4">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Everything you need at a glance
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={BarChart3}
              title="Monthly Income vs Expenses"
              description="Grouped bar chart showing income (green), expenses (red), and net income (cyan line) for every month. Instantly spot trends and LTC reimbursement spikes."
              color="text-emerald-400"
              delay={0}
            />
            <FeatureCard
              icon={Calendar}
              title="Month-by-Month Drill Down"
              description="Click any month (Jan–Dec) to see a detailed breakdown of every single income and expense line item for that period, with account balances."
              color="text-cyan-400"
              delay={1}
            />
            <FeatureCard
              icon={PieChart}
              title="Expense Category Breakdown"
              description="Donut chart showing where money goes — Visa CC, LTC reimbursements, VV1 rental costs, professional fees, aide care, and Blue Cross insurance."
              color="text-red-400"
              delay={2}
            />
            <FeatureCard
              icon={CreditCard}
              title="Visa Spending Detail"
              description="See exactly how the Visa is used: personal supplies, medical, pharmacy, hair & nails, clothing, meals, and more — all parsed from the workbook."
              color="text-orange-400"
              delay={3}
            />
            <FeatureCard
              icon={Building2}
              title="VV1 Rental Property Tracking"
              description="Dedicated view of VV1 rental expenses: HOA, taxes, insurance, utilities, maintenance, LLC registration, and township fees."
              color="text-purple-400"
              delay={4}
            />
            <FeatureCard
              icon={TrendingUp}
              title="Balance Trend Over Time"
              description="Line chart tracking total, trust, and personal balances month by month. See your financial trajectory across all accounts at once."
              color="text-cyan-400"
              delay={5}
            />
            <FeatureCard
              icon={Eye}
              title="Account Register"
              description="View all 7 accounts (personal, trust, rental, brokerage) with their latest balance, status, and type. Closed accounts are flagged."
              color="text-amber-400"
              delay={6}
            />
            <FeatureCard
              icon={Bot}
              title="AI Financial Assistant"
              description='Ask questions in plain English: "What were the biggest expenses?" or "How is the trust performing?" The AI has access to your complete financial data.'
              color="text-emerald-400"
              delay={7}
            />
            <FeatureCard
              icon={Upload}
              title="Upload New Data Anytime"
              description="Drop in a new Excel workbook or CSV — the entire dashboard refreshes instantly. No manual data entry, no waiting for reports."
              color="text-rose-400"
              delay={8}
            />
          </div>
        </div>
      </section>

      {/* ===== HOW THE AI WORKS ===== */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-medium uppercase tracking-widest text-cyan-400 mb-4">AI Chat</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Ask anything about the finances
            </h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              The AI assistant has your complete 2025 financial data loaded as context.
              It understands every account, every line item, every monthly value.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6"
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-cyan-400" />
                Things you can ask
              </h3>
              <ul className="space-y-3">
                {[
                  '"What were the biggest expenses this year?"',
                  '"How much rental income came in from VV1?"',
                  '"Explain the LTC reimbursement in February"',
                  '"Compare personal vs trust spending"',
                  '"What\'s the current brokerage balance?"',
                  '"Break down the Visa charges for October"',
                ].map((q) => (
                  <li key={q} className="flex items-start gap-2 text-sm text-white/50">
                    <ChevronRight className="w-4 h-4 text-cyan-500 flex-shrink-0 mt-0.5" />
                    {q}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6"
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                How it works
              </h3>
              <ol className="space-y-4">
                {[
                  { title: 'Data is parsed from Excel', desc: 'SheetJS reads the workbook and extracts every row, column, and value programmatically.' },
                  { title: 'Structured as JSON', desc: 'Income, expenses, balances, and line items are organized into a clean data model.' },
                  { title: 'Sent to the AI with your question', desc: 'The full financial context is included so the AI can answer accurately.' },
                  { title: 'Response streams back live', desc: 'You see the answer appear in real time with proper formatting.' },
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xs text-cyan-400 font-bold">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm text-white/80 font-medium">{step.title}</p>
                      <p className="text-xs text-white/40 mt-0.5">{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== INTEGRATIONS ===== */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-16">
            <p className="text-xs font-medium uppercase tracking-widest text-emerald-400 mb-4">Integrations</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
              Connect your accounting tools
            </h2>
            <p className="text-white/40 text-lg max-w-2xl mx-auto">
              Link QuickBooks and Google Sheets to auto-sync data. New months are created automatically as transactions flow in.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <circle cx="12" cy="12" r="10" fill="#2CA01C" />
                  <path d="M7.5 8.5h2.5a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H7.5v-7z" fill="white" />
                  <path d="M16.5 15.5h-2.5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h2.5v7z" fill="white" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">QuickBooks Online</h3>
              <ul className="space-y-2">
                {[
                  'Import P&L and Balance Sheet data',
                  'Upload QuickBooks CSV exports for the AI',
                  'Auto-create new months as data arrives',
                  'Transaction-level detail coming soon',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/50">
                    <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div custom={2} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-6"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <rect x="4" y="2" width="16" height="20" rx="2" fill="#0F9D58" />
                  <rect x="7" y="6" width="10" height="2" rx="0.5" fill="white" opacity="0.9" />
                  <rect x="7" y="10" width="10" height="2" rx="0.5" fill="white" opacity="0.7" />
                  <rect x="7" y="14" width="7" height="2" rx="0.5" fill="white" opacity="0.5" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Google Sheets</h3>
              <ul className="space-y-2">
                {[
                  'Link any Google Spreadsheet by URL',
                  'Read financial data directly from sheets',
                  'Push monthly summaries back to Sheets',
                  'Scheduled sync (daily/weekly) coming soon',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/50">
                    <ChevronRight className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          <motion.div custom={3} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mt-8">
            <Link to="/settings">
              <LiquidButton size="lg" className="text-emerald-300">
                <span className="flex items-center gap-2">
                  Set Up Integrations
                  <ArrowRight className="w-4 h-4" />
                </span>
              </LiquidButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== DATA SECURITY NOTE ===== */}
      <section className="py-16 px-4">
        <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 text-center"
        >
          <Shield className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-3">Your data stays private</h3>
          <p className="text-white/40 text-sm leading-relaxed max-w-lg mx-auto">
            The Excel file is parsed entirely in your browser — no financial data is stored on any server.
            The AI chat uses a secure server-side proxy so API keys are never exposed. All communication is encrypted.
          </p>
        </motion.div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <h2 className="text-3xl sm:text-5xl font-bold text-white tracking-tight mb-6">
              Ready to explore?
            </h2>
            <p className="text-white/40 text-lg mb-10">
              Your complete 2025 financial picture is one click away.
            </p>
            <Link to="/dashboard">
              <LiquidButton size="xxl" className="text-cyan-300 text-lg">
                <span className="flex items-center gap-3">
                  Open Dashboard
                  <ArrowRight className="w-5 h-5" />
                </span>
              </LiquidButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/[0.04] py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 2L2 10l8 8 8-8-8-8z" />
            </svg>
            <span className="text-sm font-semibold text-white/60">RS Financials</span>
          </div>
          <p className="text-xs text-white/20">
            Built for Rosemary Schafer &middot; Personal & Trust Accounts &middot; 2025
          </p>
        </div>
      </footer>
    </div>
  );
}
