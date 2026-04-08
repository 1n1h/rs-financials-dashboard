import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, Sparkles, Paperclip, SendIcon, LoaderIcon } from 'lucide-react';
import { useFinancials } from '../context/FinancialsContext';
import { readSSEStream } from '../utils/streamParser';

function TypingDots() {
  return (
    <div className="flex items-center ml-1">
      {[1, 2, 3].map((dot) => (
        <motion.div
          key={dot}
          className="w-1.5 h-1.5 bg-cyan-400 rounded-full mx-0.5"
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.85, 1.1, 0.85] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: dot * 0.15, ease: 'easeInOut' }}
          style={{ boxShadow: '0 0 4px rgba(6, 182, 212, 0.3)' }}
        />
      ))}
    </div>
  );
}

function PulsingOrb() {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        </motion.div>
      </div>
      <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-2xl px-4 py-2.5">
        <motion.span
          className="text-sm text-white/50"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Thinking
        </motion.span>
        <TypingDots />
      </div>
    </motion.div>
  );
}

function GlassFilter() {
  return (
    <svg className="hidden">
      <defs>
        <filter id="fab-glass" x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.05 0.05" numOctaves="1" seed="1" result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          <feDisplacementMap in="SourceGraphic" in2="blurredNoise" scale="70" xChannelSelector="R" yChannelSelector="B" result="displaced" />
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  );
}

export default function ChatAssistant() {
  const { data, csvData } = useFinancials();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const fileRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Show typing indicator when loading AND the last message is either
  // not yet from assistant, or assistant message is still empty
  const showTyping = loading && (
    messages.length === 0 ||
    messages[messages.length - 1]?.role !== 'assistant' ||
    messages[messages.length - 1]?.content === ''
  );

  async function sendMessage(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages.slice(-9), userMsg];
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const financialContext = data ? { ...data, _lastNonNull: undefined } : {};
      if (csvData.length > 0) {
        financialContext.quickbooksCsvData = csvData.map(f => ({ name: f.name, content: f.content.slice(0, 5000) }));
      }
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          financialContext,
        }),
      });

      if (!res.ok) throw new Error('Chat API error');

      let assistantText = '';
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      await readSSEStream(res, (delta) => {
        assistantText += delta;
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: assistantText };
          return updated;
        });
      });
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t connect to the AI service.' }]);
    } finally {
      setLoading(false);
    }
  }

  function handleFileAttach(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (file.type.startsWith('image/')) {
        setInput((prev) => prev + `\n[Attached image: ${file.name}]`);
      } else {
        setInput((prev) => prev + `\n--- ${file.name} ---\n${reader.result}\n---`);
      }
    };
    file.type.startsWith('image/') ? reader.readAsDataURL(file) : reader.readAsText(file);
    e.target.value = '';
  }

  // Floating Action Button — Liquid Glass
  if (!open) {
    return (
      <>
        <GlassFilter />
        <motion.button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full flex items-center justify-center cursor-pointer group"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          title="Ask AI"
        >
          <div className="absolute inset-0 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)] transition-all" />
          <div
            className="absolute inset-0 rounded-full overflow-hidden isolate -z-10"
            style={{ backdropFilter: 'url("#fab-glass")' }}
          />
          <div className="absolute inset-0 rounded-full border border-cyan-400/20 shadow-[0_0_20px_rgba(6,182,212,0.2)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.35)] transition-all duration-500" />
          <Sparkles className="w-6 h-6 text-cyan-400 relative z-10 group-hover:text-cyan-300 transition-colors" />
        </motion.button>
      </>
    );
  }

  // Pop-out Panel
  return (
    <>
      <GlassFilter />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed inset-0 sm:inset-auto z-50 w-full sm:w-[440px] h-full sm:h-[640px] sm:bottom-6 sm:right-6 sm:rounded-2xl flex flex-col overflow-hidden"
        >
          {/* Ambient glow behind panel */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden sm:rounded-2xl">
            <div className="absolute top-[10%] left-[20%] w-48 h-48 bg-cyan-500/[0.06] rounded-full filter blur-[80px] animate-pulse" />
            <div className="absolute bottom-[20%] right-[10%] w-48 h-48 bg-violet-500/[0.04] rounded-full filter blur-[80px] animate-pulse delay-700" />
          </div>

          {/* LIGHTER glass background — distinct from dashboard */}
          <div className="absolute inset-0 sm:rounded-2xl backdrop-blur-2xl bg-[#0f1218]/90 border border-white/[0.08] shadow-2xl shadow-black/40" />

          {/* Header */}
          <div className="relative flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-sm font-semibold text-white">AI Assistant</span>
            </div>
            <motion.button
              onClick={() => setOpen(false)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/[0.05] transition-all"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="relative flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && !loading && (
              <div className="text-center mt-12">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                </div>
                <p className="text-sm text-white/40 mb-2">Ask about Rosemary's finances</p>
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {['Biggest expenses?', 'Trust performance', 'VV1 rental income'].map(q => (
                    <button
                      key={q}
                      onClick={() => setInput(q)}
                      className="text-xs px-3 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.08] transition-all"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              // Don't render empty assistant messages (typing indicator handles it)
              if (msg.role === 'assistant' && msg.content === '') return null;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mt-1">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                    msg.role === 'user'
                      ? 'bg-white/[0.08] border border-white/[0.06] text-white/90'
                      : 'bg-white/[0.04] border border-white/[0.05] text-white/80'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div className="chat-markdown">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mt-1">
                      <User className="w-3.5 h-3.5 text-white/50" />
                    </div>
                  )}
                </motion.div>
              );
            })}

            {/* Thinking animation — visible until actual text starts streaming */}
            <AnimatePresence>
              {showTyping && <PulsingOrb />}
            </AnimatePresence>

            {/* Scroll anchor */}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="relative px-4 py-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2 backdrop-blur-xl bg-white/[0.03] rounded-xl border border-white/[0.06] px-3 py-1">
              <input ref={fileRef} type="file" className="hidden" onChange={handleFileAttach} />
              <motion.button
                type="button"
                onClick={() => fileRef.current?.click()}
                whileTap={{ scale: 0.9 }}
                className="flex-shrink-0 p-2 text-white/30 hover:text-white/70 transition-colors"
              >
                <Paperclip className="w-4 h-4" />
              </motion.button>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about the finances..."
                className="flex-1 bg-transparent text-sm text-white/90 placeholder-white/20 py-2 focus:outline-none"
              />
              <motion.button
                type="submit"
                disabled={loading || !input.trim()}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                  input.trim()
                    ? 'bg-white text-[#030303] shadow-lg shadow-white/10'
                    : 'bg-white/[0.05] text-white/30'
                }`}
              >
                {loading ? <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" /> : <SendIcon className="w-4 h-4" />}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
