import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/config';

interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: string;
}

const sampleMessages: Message[] = [
  { id: 'm1', from: 'City Authority', to: 'You', text: 'Your report has been assigned to a maintenance team.', timestamp: new Date(Date.now()-3600_000).toISOString() },
  { id: 'm2', from: 'You', to: 'City Authority', text: 'Thanks for the update!', timestamp: new Date(Date.now()-3500_000).toISOString() },
  { id: 'm3', from: 'City Authority', to: 'You', text: 'Estimated completion by Friday.', timestamp: new Date(Date.now()-1800_000).toISOString() },
];

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    const fetchMessages = async () => {
      setError(null);
      try {
        let res;
        try {
          res = await api.get('/messages');
        } catch {
          try { res = await api.get('/my-messages'); } catch { res = undefined as any; }
        }
        const data: Message[] = Array.isArray(res?.data) ? res!.data : sampleMessages;
        if (mounted) setMessages(data);
      } catch {
        if (mounted) {
          setMessages(sampleMessages);
          setError('Could not load messages from the server. Showing sample data.');
        }
      }
    };
    fetchMessages();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    const msg: Message = { id: Math.random().toString(36).slice(2), from: 'You', to: 'City Authority', text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, msg]);
    setInput('');
    try {
      await api.post('/messages', { text });
    } catch {
      // Keep optimistic message; in real app show error state
    }
  };

  return (
    <DashboardLayout title="Messages">
      <div className="flex flex-col h-[calc(100vh-220px)] bg-white rounded-xl shadow border">
        <div className="px-4 py-3 border-b font-semibold">Conversation</div>
        <div ref={containerRef} className="flex-1 overflow-auto p-4 space-y-3">
          {messages.map(m => (
            <div key={m.id} className={`max-w-[70%] p-3 rounded-lg ${m.from === 'You' ? 'ml-auto bg-blue-600 text-white' : 'bg-gray-100 text-gray-800' }`}>
              <div className="text-xs opacity-70 mb-1">{m.from} • {new Date(m.timestamp).toLocaleString()}</div>
              <div className="text-sm">{m.text}</div>
            </div>
          ))}
        </div>
        {error && (
          <div className="text-xs text-yellow-700 bg-yellow-50 border-y border-yellow-200 px-4 py-2">{error}</div>
        )}
        <div className="p-3 flex gap-2 border-t">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
            className="flex-1 border rounded-lg px-3 py-2"
            placeholder="Type a message..."
          />
          <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Send</button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
