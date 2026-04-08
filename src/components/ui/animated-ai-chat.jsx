import { useEffect, useRef, useCallback, useState } from 'react';
import { cn } from '../../lib/utils';
import {
  DollarSign, TrendingUp, PieChart, Calendar,
  ArrowUpIcon, Paperclip, SendIcon, XIcon, LoaderIcon,
  Sparkles, Command, ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function useAutoResizeTextarea({ minHeight, maxHeight }) {
  const textareaRef = useRef(null);

  const adjustHeight = useCallback(
    (reset) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      if (reset) {
        textarea.style.height = `${minHeight}px`;
        return;
      }
      textarea.style.height = `${minHeight}px`;
      const newHeight = Math.max(minHeight, Math.min(textarea.scrollHeight, maxHeight ?? Infinity));
      textarea.style.height = `${newHeight}px`;
    },
    [minHeight, maxHeight]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) textarea.style.height = `${minHeight}px`;
  }, [minHeight]);

  useEffect(() => {
    const handleResize = () => adjustHeight();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}

const commandSuggestions = [
  {
    icon: <DollarSign className="w-4 h-4" />,
    label: 'Expenses',
    description: 'Analyze spending categories',
    prefix: 'What were the biggest expenses?',
  },
  {
    icon: <TrendingUp className="w-4 h-4" />,
    label: 'Trust Performance',
    description: 'Review trust account trends',
    prefix: 'How is the trust performing?',
  },
  {
    icon: <PieChart className="w-4 h-4" />,
    label: 'Visa Breakdown',
    description: 'Break down Visa charges',
    prefix: 'Break down the Visa spending by category',
  },
  {
    icon: <Calendar className="w-4 h-4" />,
    label: 'Monthly Compare',
    description: 'Compare months side by side',
    prefix: 'Compare February vs October expenses',
  },
];

export function AnimatedAIChat({ value, setValue, onSend, isLoading, onAttachFile, attachments, removeAttachment }) {
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [inputFocused, setInputFocused] = useState(false);
  const commandPaletteRef = useRef(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 60, maxHeight: 200 });

  useEffect(() => {
    if (value.startsWith('/') && !value.includes(' ')) {
      setShowCommandPalette(true);
      const idx = commandSuggestions.findIndex((cmd) => cmd.prefix.toLowerCase().startsWith(value.slice(1).toLowerCase()));
      setActiveSuggestion(idx >= 0 ? idx : -1);
    } else {
      setShowCommandPalette(false);
    }
  }, [value]);

  useEffect(() => {
    const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const commandButton = document.querySelector('[data-command-button]');
      if (commandPaletteRef.current && !commandPaletteRef.current.contains(event.target) && !commandButton?.contains(event.target)) {
        setShowCommandPalette(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (showCommandPalette) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestion((prev) => (prev < commandSuggestions.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestion((prev) => (prev > 0 ? prev - 1 : commandSuggestions.length - 1));
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        if (activeSuggestion >= 0) {
          setValue(commandSuggestions[activeSuggestion].prefix);
          setShowCommandPalette(false);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowCommandPalette(false);
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
        adjustHeight(true);
      }
    }
  };

  const selectCommandSuggestion = (index) => {
    setValue(commandSuggestions[index].prefix);
    setShowCommandPalette(false);
  };

  return (
    <>
      {/* Input Area */}
      <motion.div
        className="relative backdrop-blur-2xl bg-white/[0.02] rounded-2xl border border-white/[0.05] shadow-2xl"
        initial={{ scale: 0.98 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <AnimatePresence>
          {showCommandPalette && (
            <motion.div
              ref={commandPaletteRef}
              className="absolute left-4 right-4 bottom-full mb-2 backdrop-blur-xl bg-black/90 rounded-lg z-50 shadow-lg border border-white/10 overflow-hidden"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
            >
              <div className="py-1 bg-black/95">
                {commandSuggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.label}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-xs transition-colors cursor-pointer',
                      activeSuggestion === index ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'
                    )}
                    onClick={() => selectCommandSuggestion(index)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <div className="w-5 h-5 flex items-center justify-center text-white/60">{suggestion.icon}</div>
                    <div className="font-medium">{suggestion.label}</div>
                    <div className="text-white/40 text-xs ml-1 truncate">{suggestion.description}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              adjustHeight();
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Ask about Rosemary's finances..."
            className={cn(
              'w-full px-4 py-3 resize-none bg-transparent border-none',
              'text-white/90 text-sm focus:outline-none placeholder:text-white/20 min-h-[60px]'
            )}
            style={{ overflow: 'hidden' }}
          />
        </div>

        <AnimatePresence>
          {attachments && attachments.length > 0 && (
            <motion.div
              className="px-4 pb-3 flex gap-2 flex-wrap"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {attachments.map((file, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-2 text-xs bg-white/[0.03] py-1.5 px-3 rounded-lg text-white/70"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <span>{file}</span>
                  <button onClick={() => removeAttachment(index)} className="text-white/40 hover:text-white transition-colors">
                    <XIcon className="w-3 h-3" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-4 border-t border-white/[0.05] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <motion.button
              type="button"
              onClick={onAttachFile}
              whileTap={{ scale: 0.94 }}
              className="p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors relative group"
            >
              <Paperclip className="w-4 h-4" />
            </motion.button>
            <motion.button
              type="button"
              data-command-button
              onClick={(e) => {
                e.stopPropagation();
                setShowCommandPalette((prev) => !prev);
              }}
              whileTap={{ scale: 0.94 }}
              className={cn(
                'p-2 text-white/40 hover:text-white/90 rounded-lg transition-colors relative group',
                showCommandPalette && 'bg-white/10 text-white/90'
              )}
            >
              <Command className="w-4 h-4" />
            </motion.button>
          </div>

          <motion.button
            type="button"
            onClick={() => { if (value.trim()) { onSend(); adjustHeight(true); } }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={isLoading || !value.trim()}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2',
              value.trim()
                ? 'bg-white text-[#0A0A0B] shadow-lg shadow-white/10'
                : 'bg-white/[0.05] text-white/40'
            )}
          >
            {isLoading ? <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" /> : <SendIcon className="w-4 h-4" />}
            <span>Send</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Suggestions (only when no messages) */}
      <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
        {commandSuggestions.map((suggestion, index) => (
          <motion.button
            key={suggestion.label}
            onClick={() => selectCommandSuggestion(index)}
            className="flex items-center gap-2 px-3 py-2 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg text-sm text-white/60 hover:text-white/90 transition-all relative group border border-white/[0.05]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {suggestion.icon}
            <span>{suggestion.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Mouse glow */}
      {inputFocused && (
        <motion.div
          className="fixed w-[50rem] h-[50rem] rounded-full pointer-events-none z-0 opacity-[0.02] bg-gradient-to-r from-cyan-500 via-emerald-500 to-cyan-500 blur-[96px]"
          animate={{ x: mousePosition.x - 400, y: mousePosition.y - 400 }}
          transition={{ type: 'spring', damping: 25, stiffness: 150, mass: 0.5 }}
        />
      )}
    </>
  );
}

export function TypingDots() {
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
