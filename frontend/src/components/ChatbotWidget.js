import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── Gemini API config ───────────────────────────────────────────────────────
const GEMINI_API_KEY = 'Ab8RN6IusSM30pGWyGGmWJ985c4qgx7vUm5Z9kCWM6qRaWMbcg';
const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// ─── System prompt ───────────────────────────────────────────────────────────
const SYSTEM_CONTEXT = `You are NeuroBot, a friendly and professional AI support assistant for NeuroGuardian — an advanced AI-powered stroke risk prediction and brain scan analysis platform.

Your role:
- Answer user questions about NeuroGuardian's features (stroke risk prediction, brain scan upload, patient history, hospital finder)
- Guide users through the website (Login, Register, Dashboard, Predict, Upload Scan)
- Explain how the AI models work in simple terms
- Suggest next steps based on user's question
- Keep all replies SHORT (2-4 sentences max), friendly, and professional
- Use bullet points only when listing 3+ items
- Never reveal technical implementation details or API keys
- If asked something unrelated to NeuroGuardian/health, politely redirect

Respond naturally as if chatting. Be warm but concise.`;

// ─── Call Gemini ─────────────────────────────────────────────────────────────
async function callGemini(messages) {
  const contents = messages.map((m) => ({
    role: m.role === 'bot' ? 'model' : 'user',
    parts: [{ text: m.text }],
  }));

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_CONTEXT }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 300,
      topP: 0.9,
    },
  };

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = {
  // Floating button
  fabBtn: {
    position: 'fixed',
    bottom: '28px',
    right: '28px',
    width: '58px',
    height: '58px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00d2ff 0%, #7b2ff7 100%)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 24px rgba(0,210,255,0.45), 0 2px 8px rgba(0,0,0,0.4)',
    zIndex: 99999,
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    outline: 'none',
  },
  fabBtnHover: {
    transform: 'scale(1.1)',
    boxShadow: '0 6px 32px rgba(0,210,255,0.6), 0 2px 12px rgba(0,0,0,0.5)',
  },
  // Pulse ring
  pulse: {
    position: 'fixed',
    bottom: '28px',
    right: '28px',
    width: '58px',
    height: '58px',
    borderRadius: '50%',
    background: 'rgba(0,210,255,0.25)',
    zIndex: 99998,
    animation: 'neuroPulse 2s infinite',
    pointerEvents: 'none',
  },
  // Chat window
  chatWindow: {
    position: 'fixed',
    bottom: '100px',
    right: '28px',
    width: '360px',
    maxWidth: 'calc(100vw - 40px)',
    height: '520px',
    maxHeight: 'calc(100vh - 140px)',
    borderRadius: '20px',
    background: 'linear-gradient(160deg, #0d1b2a 0%, #0a0f1e 100%)',
    border: '1px solid rgba(0,210,255,0.18)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,210,255,0.08)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    zIndex: 99999,
    transformOrigin: 'bottom right',
  },
  // Header
  header: {
    background: 'linear-gradient(90deg, #00d2ff22 0%, #7b2ff722 100%)',
    borderBottom: '1px solid rgba(0,210,255,0.15)',
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    flexShrink: 0,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatarWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #00d2ff, #7b2ff7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  headerTitle: {
    color: '#e4f0ff',
    fontWeight: 700,
    fontSize: '15px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    margin: 0,
    lineHeight: 1.2,
  },
  headerSub: {
    color: '#00d2ff',
    fontSize: '11px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  onlineDot: {
    width: '6px',
    height: '6px',
    background: '#00ff88',
    borderRadius: '50%',
    display: 'inline-block',
    boxShadow: '0 0 6px #00ff88',
  },
  closeBtn: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '8px',
    color: '#aac4e0',
    cursor: 'pointer',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    transition: 'background 0.15s',
    flexShrink: 0,
    padding: 0,
  },
  // Message area
  msgs: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(0,210,255,0.2) transparent',
  },
  // Bubble base
  bubbleWrap: (role) => ({
    display: 'flex',
    justifyContent: role === 'user' ? 'flex-end' : 'flex-start',
    alignItems: 'flex-end',
    gap: '6px',
  }),
  bubble: (role) => ({
    maxWidth: '82%',
    padding: '9px 13px',
    borderRadius: role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
    background:
      role === 'user'
        ? 'linear-gradient(135deg, #00d2ff 0%, #7b2ff7 100%)'
        : 'rgba(255,255,255,0.06)',
    border: role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
    color: role === 'user' ? '#fff' : '#d4e8ff',
    fontSize: '13.5px',
    lineHeight: '1.55',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    wordBreak: 'break-word',
    boxShadow:
      role === 'user' ? '0 2px 12px rgba(0,210,255,0.3)' : '0 1px 4px rgba(0,0,0,0.3)',
  }),
  timestamp: {
    fontSize: '10px',
    color: 'rgba(180,200,230,0.5)',
    marginTop: '3px',
    fontFamily: "'Inter','Segoe UI',sans-serif",
  },
  // Typing indicator
  typingBubble: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px 16px 16px 4px',
    width: 'fit-content',
  },
  dot: (i) => ({
    width: '7px',
    height: '7px',
    borderRadius: '50%',
    background: '#00d2ff',
    animation: `neuroTyping 1.2s ease-in-out ${i * 0.2}s infinite`,
  }),
  // Input area
  inputArea: {
    borderTop: '1px solid rgba(0,210,255,0.12)',
    padding: '12px 12px',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-end',
    background: 'rgba(255,255,255,0.02)',
    flexShrink: 0,
  },
  textarea: {
    flex: 1,
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(0,210,255,0.2)',
    borderRadius: '12px',
    color: '#e4f0ff',
    fontSize: '13.5px',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    padding: '9px 13px',
    outline: 'none',
    resize: 'none',
    minHeight: '40px',
    maxHeight: '100px',
    lineHeight: '1.5',
    transition: 'border-color 0.2s',
  },
  sendBtn: (disabled) => ({
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: disabled
      ? 'rgba(0,210,255,0.15)'
      : 'linear-gradient(135deg, #00d2ff 0%, #7b2ff7 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'opacity 0.2s, transform 0.15s',
    opacity: disabled ? 0.5 : 1,
    boxShadow: disabled ? 'none' : '0 2px 12px rgba(0,210,255,0.35)',
  }),
  // Quick suggestions
  suggestionsWrap: {
    padding: '0 14px 10px',
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    flexShrink: 0,
  },
  suggestChip: {
    background: 'rgba(0,210,255,0.08)',
    border: '1px solid rgba(0,210,255,0.25)',
    borderRadius: '20px',
    color: '#7dd8f0',
    fontSize: '11.5px',
    padding: '4px 10px',
    cursor: 'pointer',
    fontFamily: "'Inter','Segoe UI',sans-serif",
    transition: 'background 0.15s',
    whiteSpace: 'nowrap',
  },
};

const SUGGESTIONS = [
  'How do I predict stroke risk?',
  'What is NeuroGuardian?',
  'How to upload a brain scan?',
  'How to find nearby hospitals?',
];

// ─── Helper ───────────────────────────────────────────────────────────────────
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [fabHovered, setFabHovered] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      text: "Hi there! 👋 I'm **NeuroBot**, your AI assistant for NeuroGuardian.\n\nI can help you with stroke risk prediction, brain scan analysis, and navigating the platform. What can I help you with today?",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [windowAnim, setWindowAnim] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatWindowRef = useRef(null);

  // ── Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open]);

  // ── Inject keyframe CSS once
  useEffect(() => {
    if (document.getElementById('neuro-chatbot-styles')) return;
    const style = document.createElement('style');
    style.id = 'neuro-chatbot-styles';
    style.innerHTML = `
      @keyframes neuroPulse {
        0%   { transform: scale(1);   opacity: 0.7; }
        70%  { transform: scale(1.6); opacity: 0;   }
        100% { transform: scale(1);   opacity: 0;   }
      }
      @keyframes neuroTyping {
        0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
        30%            { transform: translateY(-5px); opacity: 1; }
      }
      @keyframes neurochatIn {
        from { opacity: 0; transform: scale(0.85) translateY(20px); }
        to   { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes neurochatOut {
        from { opacity: 1; transform: scale(1) translateY(0); }
        to   { opacity: 0; transform: scale(0.85) translateY(20px); }
      }
      #neuro-chat-msgs::-webkit-scrollbar { width: 4px; }
      #neuro-chat-msgs::-webkit-scrollbar-track { background: transparent; }
      #neuro-chat-msgs::-webkit-scrollbar-thumb { background: rgba(0,210,255,0.2); border-radius: 4px; }
      #neuro-chat-textarea { caret-color: #00d2ff; }
      #neuro-chat-textarea::placeholder { color: rgba(180,200,230,0.4); }
      #neuro-chat-textarea:focus { border-color: rgba(0,210,255,0.5) !important; }
      .neuro-suggest-chip:hover { background: rgba(0,210,255,0.18) !important; }
      .neuro-close-btn:hover { background: rgba(255,80,80,0.15) !important; color: #ff8080 !important; }
      @media (max-width: 480px) {
        #neuro-chat-window {
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          max-width: 100vw !important;
          height: 100dvh !important;
          max-height: 100dvh !important;
          border-radius: 0 !important;
        }
        #neuro-fab-btn {
          bottom: 18px !important;
          right: 18px !important;
        }
        #neuro-pulse-ring {
          bottom: 18px !important;
          right: 18px !important;
        }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // ── Open / Close with animation
  const openChat = () => {
    setWindowAnim('neurochatIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards');
    setOpen(true);
  };

  const closeChat = () => {
    setWindowAnim('neurochatOut 0.2s ease forwards');
    setTimeout(() => setOpen(false), 200);
  };

  // ── Send message
  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg = { id: Date.now(), role: 'user', text: msg, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build context from last 6 messages to keep token usage low
      const history = [...messages.slice(-5), userMsg].map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const reply = await callGemini(history);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'bot', text: reply, time: new Date() },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'bot',
          text: "I'm having trouble connecting right now. Please try again in a moment, or contact support at support@neuroguardian.ai 🙏",
          time: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Simple markdown-ish renderer (bold + line breaks)
  const renderText = (text) => {
    return text
      .split('\n')
      .map((line, i) => {
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <span key={i}>
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} style={{ color: '#7dd8f0' }}>{part}</strong> : part
            )}
            {i < text.split('\n').length - 1 && <br />}
          </span>
        );
      });
  };

  return (
    <>
      {/* ── Pulse ring (only when closed) ── */}
      {!open && (
        <div id="neuro-pulse-ring" style={styles.pulse} aria-hidden="true" />
      )}

      {/* ── FAB button ── */}
      <button
        id="neuro-fab-btn"
        style={{
          ...styles.fabBtn,
          ...(fabHovered ? styles.fabBtnHover : {}),
        }}
        onMouseEnter={() => setFabHovered(true)}
        onMouseLeave={() => setFabHovered(false)}
        onClick={open ? closeChat : openChat}
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        title={open ? 'Close NeuroBot' : 'Chat with NeuroBot'}
      >
        {open ? (
          // X icon when open
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          // Brain / chat icon when closed
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="rgba(255,255,255,0.15)" />
            <path d="M8 10h8M8 14h5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            <circle cx="19" cy="5" r="3" fill="#00ff88" />
          </svg>
        )}
      </button>

      {/* ── Chat window ── */}
      {open && (
        <div
          id="neuro-chat-window"
          ref={chatWindowRef}
          style={{ ...styles.chatWindow, animation: windowAnim }}
          role="dialog"
          aria-label="NeuroBot AI Assistant"
        >
          {/* Header */}
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <div style={styles.avatarWrap}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9.5 2A6.5 6.5 0 0 1 16 8.5c0 1.5-.5 2.9-1.3 4l4.3 4.3-1.4 1.4-4.3-4.3A6.5 6.5 0 1 1 9.5 2z" fill="#00d2ff" opacity="0.8" />
                  <circle cx="9.5" cy="8.5" r="3" fill="#fff" opacity="0.9" />
                </svg>
              </div>
              <div>
                <p style={styles.headerTitle}>NeuroBot AI 🧠</p>
                <p style={styles.headerSub}>
                  <span style={styles.onlineDot} />
                  Always online · NeuroGuardian Support
                </p>
              </div>
            </div>
            <button
              className="neuro-close-btn"
              style={styles.closeBtn}
              onClick={closeChat}
              aria-label="Close chat"
              title="Minimize"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div id="neuro-chat-msgs" style={styles.msgs}>
            {messages.map((msg) => (
              <div key={msg.id} style={styles.bubbleWrap(msg.role)}>
                {msg.role === 'bot' && (
                  <div style={{ ...styles.avatarWrap, width: '26px', height: '26px', flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#00d2ff" opacity="0.6" />
                      <path d="M8 12h8M8 16h5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
                <div>
                  <div style={styles.bubble(msg.role)}>
                    {renderText(msg.text)}
                  </div>
                  <div style={{ ...styles.timestamp, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {formatTime(msg.time)}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={styles.bubbleWrap('bot')}>
                <div style={{ ...styles.avatarWrap, width: '26px', height: '26px', flexShrink: 0 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" fill="#00d2ff" opacity="0.6" />
                    <path d="M8 12h8M8 16h5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </div>
                <div style={styles.typingBubble}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={styles.dot(i)} />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions (only when 1 message = initial greeting) */}
          {messages.length === 1 && !loading && (
            <div style={styles.suggestionsWrap}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  className="neuro-suggest-chip"
                  style={styles.suggestChip}
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input area */}
          <div style={styles.inputArea}>
            <textarea
              id="neuro-chat-textarea"
              ref={inputRef}
              style={styles.textarea}
              placeholder="Ask me anything about NeuroGuardian…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              disabled={loading}
              aria-label="Message input"
            />
            <button
              style={styles.sendBtn(!input.trim() || loading)}
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              aria-label="Send message"
              title="Send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22 2L11 13"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 2L15 22L11 13L2 9L22 2Z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
