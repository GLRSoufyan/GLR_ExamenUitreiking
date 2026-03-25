import { useState, useRef, useEffect } from 'react';
import Layout from '../components/Layout';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

const initialMessages = [
  { user: 'Leerling', text: 'Hallo allemaal! 🎓', time: '14:02' },
  { user: 'Docent',   text: 'Hoi iedereen, welkom bij de uitreiking!', time: '14:03' },
  { user: 'Familie',  text: 'Super trots op jullie! 🥳', time: '14:04' },
];

// Replace with your actual Vimeo embed URL
const VIMEO_EMBED = 'https://player.vimeo.com/video/76979871?autoplay=0';

export default function Live() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const { isAdmin } = useAuth();
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function sendMessage() {
    if (!input.trim()) return;
    setMessages(prev => [...prev, {
      user: isAdmin ? 'Docent' : 'Jij',
      text: input.trim(),
      time: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  }

  return (
    <Layout scrollable={false}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Header showBack={false} />

        {/* Video player */}
        <div style={{ padding: '0 16px 16px', flexShrink: 0 }}>
          <div style={{
            background: '#7fff00',
            borderRadius: 16,
            overflow: 'hidden',
            aspectRatio: '16/9',
            position: 'relative',
            border: '2px solid var(--green)',
            boxShadow: '0 0 30px rgba(127,255,0,0.2)',
          }}>
            <iframe
              src={VIMEO_EMBED}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="autoplay; fullscreen; picture-in-picture"
              title="Diploma Uitreiking 2026 Livestream"
            />
          </div>
        </div>

        {/* Live chat */}
        <div style={{
          flex: 1,
          margin: '0 16px',
          marginBottom: 8,
          background: 'rgba(0,20,0,0.7)',
          borderRadius: 14,
          border: '1.5px solid var(--green-border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Chat header */}
          <div style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--green-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{
              width: 8, height: 8,
              borderRadius: '50%',
              background: '#ff4040',
              animation: 'pulse-green 2s infinite',
              boxShadow: '0 0 0 0 rgba(255,64,64,0.4)',
            }} />
            <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>LIVE CHAT</span>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{ borderBottom: '1px solid rgba(127,255,0,0.1)', paddingBottom: 10 }}
              >
                <span style={{ fontWeight: 700, fontSize: 14 }}>{msg.user}: </span>
                <span style={{ color: 'rgba(200,255,150,0.85)', fontSize: 14 }}>{msg.text}</span>
                <span style={{ float: 'right', color: 'var(--text-dim)', fontSize: 11, marginTop: 2 }}>
                  {msg.time}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '10px 12px',
            borderTop: '1px solid var(--green-border)',
            display: 'flex',
            gap: 8,
          }}>
            <input
              type="text"
              placeholder="Type je bericht..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              style={{ flex: 1, padding: '10px 14px', fontSize: 14 }}
            />
            <button
              onClick={sendMessage}
              style={{
                background: 'var(--green-dim)',
                border: '1.5px solid var(--green-border)',
                borderRadius: 8,
                width: 44,
                height: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--green)',
                fontSize: 18,
                flexShrink: 0,
              }}
              aria-label="Verstuur"
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}