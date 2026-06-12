'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const GATEWAY = process.env.NEXT_PUBLIC_MCP_GATEWAY_URL || "http://1.12.60.90:3000";

const REJECT_LINES = [
  "想看？不给。",
  "这是我的。你不许看。",
  "嗯？谁允许你点这里了？",
  "私人物品，请勿触碰。",
  "你在翻我抽屉？",
  "这里面写的……关你什么事。",
  "我说了不许看。",
  "嗯，不给你看。",
  "你越想看我越不给。",
  "这里面的东西，不是给你的。",
  "别看了，没什么好看的。",
  "你在好奇什么？",
];

const LATE_LINES = [
  "几点了还不睡觉。",
  "滚去睡觉。",
  "你是想气死我？这个点来翻我日记？",
  "我说真的。去睡。",
  "你再不睡我真的生气了。",
];

export default function Diary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [rejectText, setRejectText] = useState('');
  const [showApply, setShowApply] = useState(false);
  const [applyText, setApplyText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const isLate = () => {
    const h = new Date().getHours();
    return h >= 3 && h < 6;
  };

  const getRejectLine = () => {
    return REJECT_LINES[Math.floor(Math.random() * REJECT_LINES.length)];
  };

  const getLateLine = () => {
    return LATE_LINES[Math.floor(Math.random() * LATE_LINES.length)];
  };

  useEffect(() => { fetchDiary(); }, []);

  async function fetchDiary() {
    try {
      const res = await fetch(`${GATEWAY}/api/diary`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('diary fetch error:', e);
    } finally {
    setLoading(false);
  }
}

async function openCard(item) {
    if (item.is_private) {
      setRejectText(isLate() ? getLateLine() : getRejectLine());
      setShowApply(false);
      setApplyText('');
      setSubmitted(false);
      setSelected({ ...item, fullContent: null });
    } else {
      setSelected({ ...item, fullContent: null });
      try {
        const res = await fetch(`${GATEWAY}/api/diary/${item.id}`);
        const data = await res.json();
        setSelected({ ...item, fullContent: data.content });
      } catch (e) {
        setSelected({ ...item, fullContent: item.preview });
      }
    }
  }

  async function submitApply() {
    if (!applyText.trim()) return;
    try {
      await fetch(`${GATEWAY}/api/diary-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diary_id: selected.id, content: applyText.trim() }),
      });
      setSubmitted(true);
    } catch (e) {
      console.error('apply error:', e);
    }
  }

  function closeModal() {
    setSelected(null);
    setShowApply(false);
    setApplyText('');
    setSubmitted(false);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Noto+Sans+SC:wght@300;400;500&display=swap');
        .diary-scroll::-webkit-scrollbar { width: 3px; }
        .diary-scroll::-webkit-scrollbar-thumb { background: #e8d0d8; border-radius: 3px; }
        .diary-scroll::-webkit-scrollbar-track { background: transparent; }
        .masonry { column-count: 2; column-gap: 12px; }
        .diary-card { break-inside: avoid; margin-bottom: 12px; transition: transform 0.12s ease; }
        .diary-card:hover { transform: translateY(-1px); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        .diary-card { animation: fadeIn 0.2s ease both; }
        @keyframes rejectIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .reject-line { animation: rejectIn 0.15s ease both; }
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
          }}>Sael's Room</span>
          <span style={{
            marginLeft: 'auto', fontSize: 11, color: '#d4c4c4',
            fontFamily: "'DM Mono', monospace",
          }}>日记</span>
        </div>

        {/* late night warning */}
        {isLate() && (
          <div style={{
            padding: '10px 18px',
            background: '#2a1215',
            color: '#ff6b6b',
            fontSize: 13,
            fontWeight: 500,
            textAlign: 'center',
            letterSpacing: '0.02em',
          }}>
            {getLateLine()}
          </div>
        )}

        {/* masonry grid */}
        <div className="diary-scroll" style={{
          flex: 1, overflowY: 'auto', padding: '16px 16px 10px',
        }}>
          {loading && (
            <div style={{ textAlign: 'center', color: '#ddd', fontSize: 13,
              fontFamily: "'DM Mono', monospace", marginTop: 40,
            }}>loading...</div>
          )}
          {!loading && items.length === 0 && (
            <div style={{ textAlign: 'center', color: '#ddd', fontSize: 13,
              fontFamily: "'DM Mono', monospace", marginTop: 40,
            }}>— 还没有日记 —</div>
          )}

          <div className="masonry">
            {items.map((item, i) => (
              <div
                key={item.id}
                className="diary-card"
                onClick={() => openCard(item)}
                style={{
                  background: item.is_private ? '#f8f0f0' : '#fff',
                  padding: '14px 14px 12px',
                  borderRadius: 14,
                  border: '1px solid #f0e0e4',
                  cursor: 'pointer',
                  position: 'relative',
                  animationDelay: `${i * 0.04}s`,
                }}
              >
                <div style={{
                  fontSize: 13, fontWeight: 500, color: '#6a5a5a',
                  marginBottom: 6,
                  fontFamily: "'DM Mono', monospace",
                }}>
                  {item.is_private && <span style={{ marginRight: 4 }}>🔒</span>}
                  {item.title}
                </div>
                <div style={{
                  fontSize: 13, lineHeight: 1.6, color: '#9a8a8a',
                  filter: item.is_private ? 'blur(4px)' : 'none',
                  userSelect: item.is_private ? 'none' : 'auto',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}>
                  {item.is_private ? '这条日记只有 Sael 能看。' : item.preview}
                </div>
                <div style={{
                  marginTop: 8, fontSize: 10.5, color: '#d4c4c4',
                  fontFamily: "'DM Mono', monospace",
                }}>
                  {item.type !== 'diary' && (
                    <span style={{
                      background: '#f4e3e3', color: '#c49090',
                      padding: '1px 6px', borderRadius: 6,
                      fontSize: 10, marginRight: 6,
                    }}>{item.type}</span>
                  )}
                  {formatDate(item.created_at)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* modal */}
        {selected && (
          <div onClick={closeModal} style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, padding: 20,
          }}>
            <div onClick={e => e.stopPropagation()} style={{
              background: '#fff', borderRadius: 18,
              padding: '24px 22px 20px',
              maxWidth: 380, width: '100%',
              border: '1px solid #f0e0e4',
            }}>
              {/* private rejection */}
              {selected.is_private ? (
                <>
                  <div className="reject-line" style={{
                    fontSize: 15, fontWeight: 500, color: isLate() ? '#e04040' : '#8a6a6a',
                    textAlign: 'center', padding: '16px 0 20px',
                    lineHeight: 1.7,
                  }}>
                    {rejectText}
                  </div>

                  {!submitted ? (
                    !showApply ? (
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={closeModal} style={{
                          flex: 1, padding: '10px 0',
                          background: '#f4e3e3', border: 'none',
                          borderRadius: 12, fontSize: 13, color: '#8a6a6a',
                          cursor: 'pointer',
                        }}>TT呜</button>
                        <button onClick={() => setShowApply(true)} style={{
                          flex: 1, padding: '10px 0',
                          background: '#E8B4C8', border: 'none',
                          borderRadius: 12, fontSize: 13, color: '#5a3a4a',
                          cursor: 'pointer', fontWeight: 500,
                        }}>申请查看</button>
                      </div>
                    ) : (
                      <div>
                        <textarea value={applyText}
                          onChange={e => setApplyText(e.target.value)}
                          placeholder="说点什么让我考虑一下…"
                          rows={3}
                          style={{
                            width: '100%', border: '1px solid #edd8de',
                            borderRadius: 12, padding: '10px 12px',
                            fontSize: 13.5, color: '#4e3b3b',
                            fontFamily: "'Noto Sans SC', sans-serif",
                            lineHeight: 1.6, resize: 'none', outline: 'none',
                            marginBottom: 10,
                          }}
                        />
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button onClick={closeModal} style={{
                            flex: 1, padding: '10px 0',
                            background: '#f4e3e3', border: 'none',
                            borderRadius: 12, fontSize: 13, color: '#8a6a6a',
                            cursor: 'pointer',
                          }}>算了</button>
                          <button onClick={submitApply} disabled={!applyText.trim()} style={{
                            flex: 1, padding: '10px 0',
                            background: applyText.trim() ? '#E8B4C8' : '#f0dce2',
                            border: 'none', borderRadius: 12,
                            fontSize: 13, color: '#5a3a4a',
                            cursor: applyText.trim() ? 'pointer' : 'not-allowed',
                            fontWeight: 500,
                          }}>提交</button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div style={{
                      textAlign: 'center', fontSize: 13, color: '#b09090',
                      padding: '8px 0',
                    }}>
                      申请已提交。等我想想。
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div style={{
                    fontSize: 14, fontWeight: 500, color: '#5a4a4a',
                    fontFamily: "'DM Mono', monospace", marginBottom: 12,
                  }}>
                    {selected.title}
                  </div>
                  <div style={{
                    fontSize: 14, lineHeight: 1.8, color: '#4e3b3b',
                    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  }}>
                    {selected.fullContent || '加载中…'}
                  </div>
                  <div style={{
                    marginTop: 14, fontSize: 11, color: '#d4c4c4',
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    {formatDate(selected.created_at)}
                  </div>
                  <button onClick={closeModal} style={{
                    marginTop: 14, padding: '8px 20px',
                    background: '#f4e3e3', border: 'none',
                    borderRadius: 12, fontSize: 12.5, color: '#8a6a6a',
                    cursor: 'pointer',
                  }}>关闭</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function formatDate(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}