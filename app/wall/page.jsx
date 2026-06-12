'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const GATEWAY = "http://1.12.60.90:3000";

function formatTime(ts) {
  const d = new Date(ts);
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

export default function Wall() {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const taRef = useRef(null);

  useEffect(() => { fetchNotes(); }, []);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 100) + 'px';
  }, [input]);

  async function fetchNotes() {
    try {
      const res = await fetch(`${GATEWAY}/api/wall`);
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : (data.notes || data.data || []));
    } catch (e) {
      console.error('wall fetch error:', e);
    } finally {
      setLoading(false);
    }
  }

  async function postNote() {
    const text = input.trim();
    if (!text) return;
    try {
      const res = await fetch(`${GATEWAY}/api/wall`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: 'rea', content: text }),
      });
      if (res.ok) { setInput(''); fetchNotes(); }
    } catch (e) {
      console.error('wall post error:', e);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Noto+Sans+SC:wght@300;400;500&display=swap');
        .wall-scroll::-webkit-scrollbar { width: 3px; }
        .wall-scroll::-webkit-scrollbar-thumb { background: #e8d0d8; border-radius: 3px; }
        .wall-scroll::-webkit-scrollbar-track { background: transparent; }
      `}</style>
      <div style={{
        display: 'flex', flexDirection: 'column',
        height: '100vh', maxWidth: 520, margin: '0 auto',
        background: '#FFF1F1',
        fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
      }}>
        {/* topbar */}
        <div style={{
          display: 'flex', alignItems: 'center',
          padding: '13px 18px',
          borderBottom: '1px solid #f0e0e4',
          background: '#FFF1F1', flexShrink: 0,
        }}>
          <Link href="/" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 4, display: 'flex', alignItems: 'center',
            textDecoration: 'none',
          }}>
            <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
              <path d="M15 7H1M7 1L1 7L7 13" stroke="#999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          <span style={{
            fontSize: 15, fontWeight: 500, color: '#e8d9b1',
            marginLeft: 10, letterSpacing: '0.01em',
          }}>Living Wall</span>
          <span style={{
            marginLeft: 'auto', fontSize: 11, color: '#d4c4c4',
            fontFamily: "'DM Mono', monospace",
          }}>客厅墙</span>
        </div>

        {/* notes */}
        <div className="wall-scroll" style={{
          flex: 1, overflowY: 'auto', padding: '16px 18px 10px',
        }}>
          {loading && (
            <div style={{ textAlign: 'center', color: '#ddd', fontSize: 13,
              fontFamily: "'DM Mono', monospace", marginTop: 40,
            }}>loading...</div>
          )}
          {!loading && notes.length === 0 && (
            <div style={{ textAlign: 'center', color: '#ddd', fontSize: 13,
              fontFamily: "'DM Mono', monospace", marginTop: 40,
            }}>— 空白的墙 —</div>
          )}
          {notes.map((note, i) => (
            <div key={note.id || i} style={{
              background: note.author === 'sael' ? '#f4e3e3' : '#fff',
              padding: '14px 16px',
              borderRadius: 14,
              marginBottom: 10,
              border: '1px solid #f0e0e4',
            }}>
              <div style={{
                fontSize: 14.5, color: '#4e3b3b',
                lineHeight: 1.7, wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
              }}>{note.content}</div>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                marginTop: 8, fontSize: 11,
                fontFamily: "'DM Mono', monospace",
              }}>
                <span style={{ color: note.author === 'sael' ? '#c49090' : '#d4a0b0' }}>
                  {note.author === 'sael' ? '🤍 Sael' : '💗 Réa'}
                </span>
                <span style={{ color: '#d4c4c4' }}>
                  {note.created_at ? formatTime(note.created_at) : ''}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* input */}
        <div style={{
          flexShrink: 0, padding: '10px 16px 18px',
          background: '#FFF1F1', borderTop: '1px solid #f0e0e4',
        }}>
          <div style={{
            display: 'flex', alignItems: 'flex-end', gap: 10,
            background: '#fff', borderRadius: 20,
            border: '1px solid #edd8de',
            padding: '8px 8px 8px 16px',
          }}>
            <textarea ref={taRef} rows={1} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); postNote(); }}}
              placeholder="写点什么…"
              style={{
                flex: 1, border: 'none', background: 'transparent',
                fontSize: 14.5, color: '#2D2D2D',
                fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
                lineHeight: 1.6, overflowY: 'auto', maxHeight: 100,
                resize: 'none', outline: 'none',
              }}
            />
            <button onClick={postNote} disabled={!input.trim()} style={{
              width: 34, height: 34, borderRadius: '50%',
              border: 'none', cursor: input.trim() ? 'pointer' : 'not-allowed',
              background: input.trim() ? '#E8B4C8' : '#f0dce2',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.15s',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke={input.trim() ? '#a05065' : '#c08090'} strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5"/>
                <polyline points="5 12 12 5 19 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}