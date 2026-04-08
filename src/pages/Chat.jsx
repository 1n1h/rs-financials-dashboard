import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import { useFinancials } from '../context/FinancialsContext';
import { readSSEStream } from '../utils/streamParser';
import { AnimatedAIChat, TypingDots } from '../components/ui/animated-ai-chat';

export default function ChatPage() {
  const { data, csvData } = useFinancials();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const scrollRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages.slice(-9), userMsg];
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setAttachments([]);
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
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
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
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Unable to connect to the AI service. Ensure the API is configured.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleAttachFile() {
    fileRef.current?.click();
  }

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachments((prev) => [...prev, file.name]);
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

  function removeAttachment(index) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="min-h-[calc(100vh-180px)] flex flex-col w-full items-center justify-center text-white relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full mix-blend-normal filter blur-[128px] animate-pulse delay-700" />
        <div className="absolute top-1/4 right-1/3 w-64 h-64 bg-violet-500/10 rounded-full mix-blend-normal filter blur-[96px] animate-pulse delay-1000" />
      </div>

      <input ref={fileRef} type="file" className="hidden" onChange={onFileChange} />

      <div className="w-full max-w-2xl mx-auto relative z-10 flex flex-col" style={{ minHeight: 'calc(100vh - 220px)' }}>
        {/* Header area — shown when no messages */}
        {!hasMessages && (
          <motion.div
            className="text-center space-y-3 pt-12 pb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-block"
            >
              <h1 className="text-3xl font-medium tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/40 pb-1">
                How can I help today?
              </h1>
              <motion.div
                className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: '100%', opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              />
            </motion.div>
            <motion.p className="text-sm text-white/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              Ask anything about Rosemary's 2025 financial data
            </motion.p>
          </motion.div>
        )}

        {/* Messages */}
        {hasMessages && (
          <div ref={scrollRef} className="flex-1 overflow-y-auto py-6 space-y-6 mb-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mt-1">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      msg.role === 'user'
                        ? 'bg-white/[0.08] border border-white/[0.06] text-white/90'
                        : 'bg-white/[0.03] border border-white/[0.04] text-white/80'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="chat-markdown">
                        <ReactMarkdown>{msg.content || '...'}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mt-1">
                      <User className="w-4 h-4 text-white/60" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            {loading && messages[messages.length - 1]?.role !== 'assistant' && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.04] rounded-2xl px-4 py-3">
                  <span className="text-sm text-white/50">Thinking</span>
                  <TypingDots />
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Spacer to push input down when no messages */}
        {!hasMessages && <div className="flex-1" />}

        {/* Animated Input */}
        <div className="pb-6">
          <AnimatedAIChat
            value={input}
            setValue={setInput}
            onSend={sendMessage}
            isLoading={loading}
            onAttachFile={handleAttachFile}
            attachments={attachments}
            removeAttachment={removeAttachment}
          />
        </div>
      </div>

      {/* Floating thinking indicator */}
      <AnimatePresence>
        {loading && hasMessages && (
          <motion.div
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 backdrop-blur-2xl bg-white/[0.02] rounded-full px-4 py-2 shadow-lg border border-white/[0.05] z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-7 rounded-full bg-cyan-500/10 flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-cyan-400" />
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <span>Analyzing</span>
                <TypingDots />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
