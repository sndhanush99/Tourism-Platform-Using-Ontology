import React, { useState, useRef, useEffect, useCallback } from 'react';
import api from '../../api/axios';

// Render **bold** markdown in bot messages
function BotMessage({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**')
          ? <strong key={i}>{part.slice(2, -2)}</strong>
          : part
      )}
    </span>
  );
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: 'Namaste! 🙏 I\'m your Village State assistant.\n\nI know all the villages, prices, activities and products on this platform. Ask me anything!',
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    'Show all villages',
    'Best rated villages',
    'Cheapest stays',
    'Solo travel safety tips',
    'How to book a stay?',
    'Show marketplace products',
  ]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [history, setHistory] = useState([]);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Fetch dynamic suggestions from backend (uses real DB data)
  const fetchSuggestions = useCallback(async () => {
    try {
      const data = await api.get('/chatbot/suggestions');
      if (data.suggestions?.length) setSuggestions(data.suggestions);
    } catch { /* keep defaults */ }
  }, []);

  useEffect(() => {
    if (open) {
      fetchSuggestions();
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, fetchSuggestions]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');
    setShowSuggestions(false);

    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);

    try {
      const data = await api.post('/chatbot/message', {
        message: msg,
        conversationHistory: history
      });

      const botReply = data.reply;
      setMessages(prev => [...prev, { role: 'bot', text: botReply }]);
      setHistory(prev => [
        ...prev,
        { role: 'user', content: msg },
        { role: 'assistant', content: botReply }
      ].slice(-16));
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'bot',
        text: 'Sorry, I had trouble connecting. Please check if the backend server is running on port 5000.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{ role: 'bot', text: 'Namaste! 🙏 Chat cleared. How can I help you?' }]);
    setHistory([]);
    setShowSuggestions(true);
  };

  return (
    <>
      {/* Chat window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 96, right: 28, zIndex: 1000,
          width: 380, height: 540,
          background: 'white', borderRadius: 16,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
          border: '1px solid #e5e7eb', overflow: 'hidden'
        }}>

          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #15803d, #16a34a)',
            color: 'white', padding: '14px 16px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.1rem'
              }}>🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Village Assistant</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>
                  Knows all villages, prices & activities
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={clearChat} title="Clear chat"
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: '0.75rem' }}>
                Clear
              </button>
              <button onClick={() => setOpen(false)}
                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', fontSize: '1rem' }}>
                ✕
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                alignItems: 'flex-end', gap: 6
              }}>
                {m.role === 'bot' && (
                  <div style={{ width: 26, height: 26, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', flexShrink: 0 }}>
                    🤖
                  </div>
                )}
                <div style={{
                  maxWidth: '82%',
                  padding: '10px 13px',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role === 'user' ? '#16a34a' : '#f3f4f6',
                  color: m.role === 'user' ? 'white' : '#111827',
                  fontSize: '0.855rem',
                }}>
                  {m.role === 'bot' ? <BotMessage text={m.text} /> : m.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
                <div style={{ width: 26, height: 26, background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}>🤖</div>
                <div style={{ background: '#f3f4f6', borderRadius: '16px 16px 16px 4px', padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: '50%', background: '#6b7280',
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                      }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Quick suggestions */}
          {showSuggestions && messages.length <= 2 && (
            <div style={{ padding: '6px 12px 2px', borderTop: '1px solid #f3f4f6' }}>
              <p style={{ fontSize: '0.72rem', color: '#6b7280', marginBottom: 6, fontWeight: 500 }}>QUICK QUESTIONS</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {suggestions.slice(0, 6).map((s, i) => (
                  <button key={i} onClick={() => sendMessage(s)}
                    style={{
                      fontSize: '0.75rem', padding: '5px 10px',
                      border: '1px solid #d1fae5',
                      borderRadius: 20, background: '#f0fdf4',
                      color: '#15803d', cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => { e.target.style.background = '#dcfce7'; }}
                    onMouseLeave={e => { e.target.style.background = '#f0fdf4'; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about villages, prices, activities..."
              disabled={loading}
              rows={1}
              style={{
                flex: 1, padding: '9px 12px',
                border: '1.5px solid #e5e7eb', borderRadius: 12,
                fontSize: '0.875rem', resize: 'none', outline: 'none',
                fontFamily: 'inherit', lineHeight: 1.4,
                maxHeight: 80, overflowY: 'auto',
                transition: 'border-color 0.2s'
              }}
              onFocus={e => e.target.style.borderColor = '#16a34a'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: input.trim() && !loading ? '#16a34a' : '#e5e7eb',
                border: 'none', color: 'white', cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', flexShrink: 0, transition: 'background 0.2s'
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Bounce animation */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>

      {/* FAB button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 28, right: 28, zIndex: 1001,
          width: 58, height: 58,
          background: open ? '#dc2626' : 'linear-gradient(135deg, #15803d, #16a34a)',
          color: 'white', border: 'none', borderRadius: '50%',
          fontSize: '1.5rem', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(22,163,74,0.45)',
          transition: 'all 0.25s', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        title="Village Assistant"
      >
        {open ? '✕' : '💬'}
      </button>
    </>
  );
}
