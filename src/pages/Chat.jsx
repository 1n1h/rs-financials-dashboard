import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useFinancials } from '../context/FinancialsContext';

export default function ChatPage() {
  const { data } = useFinancials();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          financialContext,
        }),
      });

      if (!res.ok) throw new Error('Chat API error');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const payload = line.slice(6);
            if (payload === '[DONE]') continue;
            try {
              const json = JSON.parse(payload);
              const delta = json.choices?.[0]?.delta?.content || '';
              assistantText += delta;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantText };
                return updated;
              });
            } catch { /* skip */ }
          }
        }
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Unable to connect to the AI service. Ensure the API is configured.' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 220px)' }}>
        <div className="px-6 py-4 border-b border-white/10 flex items-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
          <h2 className="text-lg font-semibold text-white">Financial AI Assistant</h2>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 text-sm mt-16">
              <p className="text-2xl mb-4">💬</p>
              <p className="mb-2">Ask anything about Rosemary's 2025 financials</p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {['What were the biggest expenses?', 'How is the trust performing?', 'Explain the LTC reimbursements'].map(q => (
                  <button
                    key={q}
                    onClick={() => setInput(q)}
                    className="text-xs px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user' ? 'bg-cyan-500 text-black' : 'bg-white/5 text-gray-200'
              }`}>
                {msg.role === 'assistant' ? (
                  <div className="prose prose-invert prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0">
                    <ReactMarkdown>{msg.content || '...'}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex gap-1.5 px-4 py-2">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="p-4 border-t border-white/10 flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the finances..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-black font-medium rounded-xl transition-colors text-sm"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
