import React, { useState, useRef, useEffect, useContext } from 'react';
import api from '../api/config';
import { MessageCircle, X, Send, Globe2 } from 'lucide-react';
import LocaleContext from '../contexts/locale/LocaleContext';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

const LANG_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'हिन्दी' },
  { value: 'es', label: 'Español' },
  { value: 'mr', label: 'मराठी' },
  { value: 'te', label: 'తెలుగు' }
];

type AssistantLang = 'en' | 'hi' | 'es' | 'mr' | 'te' | 'fr';

const AssistantWidget: React.FC = () => {
  const { locale } = useContext(LocaleContext) || { locale: 'en' };
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: 'Hello! I can help you report issues, check transport updates, or vote in polls. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [language, setLanguage] = useState<AssistantLang>((locale as AssistantLang) || 'en');
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Sync assistant language when global locale changes (but preserve user manual change)
  useEffect(() => {
    setLanguage(prev => (prev === locale ? locale : prev));
  }, [locale]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setSending(true);
    try {
      const res = await api.post('/assistant', { message: userText, language });
      const reply = res.data?.reply || '…';
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Assistant is unavailable right now. Please try again later.' }]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-green-500 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden sm:block">Ask Assistant</span>
        </button>
      )}

      {open && (
        <div className="w-[92vw] sm:w-96 bg-white rounded-xl shadow-2xl border flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-blue-600 to-green-500 text-white">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <div className="font-semibold">CityConnect Assistant</div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/10 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-3 py-2 border-b flex items-center gap-2 text-sm">
            <Globe2 className="w-4 h-4 text-gray-500" />
            <select
              className="text-gray-700 border rounded px-2 py-1 focus:outline-none focus:ring"
              value={language}
              onChange={(e) => setLanguage(e.target.value as AssistantLang)}
              aria-label="Language"
            >
              {LANG_OPTIONS.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
            <div className="text-gray-500 ml-auto text-xs">Type 'help'</div>
          </div>

          <div ref={listRef} className="flex-1 overflow-auto p-3 space-y-2 bg-gray-50">
            {messages.map((m, idx) => (
              <div key={idx} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm shadow ${m.role === 'user' ? 'ml-auto bg-blue-600 text-white' : 'mr-auto bg-white text-gray-800'}`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="p-3 border-t flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring"
              placeholder="Ask something…"
              disabled={sending}
            />
            <button
              onClick={sendMessage}
              disabled={sending}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssistantWidget;
