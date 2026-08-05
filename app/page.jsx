'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

const GATEWAY = process.env.NEXT_PUBLIC_MCP_GATEWAY_URL || "http://1.12.60.90:3000";

export default function WallPage() {
  const [notes, setNotes] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const scrollRef = useRef(null);
  const oldestIdRef = useRef(null);
  const isInitialLoad = useRef(true);

  function formatTs(ts) {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${GATEWAY}/api/wall?limit=20`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data.notes || data.data || []);
      arr.reverse();
      setNotes(arr);
      if (arr.length > 0) {
        oldestIdRef.current = arr[0].id;
        setHasMore(arr.length >= 20);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !oldestIdRef.current) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`${GATEWAY}/api/wall?limit=20&before_id=${oldestIdRef.current}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const arr = Array.isArray(data) ? data : (data.notes || data.data || []);
      if (arr.length === 0) {
        setHasMore(false);
        return;
      }
      arr.reverse();
      const container = scrollRef.current;
      const prevScrollHeight = container?.scrollHeight || 0;
      const prevScrollTop = container?.scrollTop || 0;
      setNotes(prev => [...arr, ...prev]);
      oldestIdRef.current = arr[0].id;
      if (arr.length < 20) setHasMore(false);
      requestAnimationFrame(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = prevScrollTop + (newScrollHeight - prevScrollHeight);
        }
      });
    } catch (e) {
      console.error('[wall] loadMore error:', e.message);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  const handleScroll = useCallback((e) => {
    const el = e.target;
    if (el.scrollTop < 60 && hasMore && !loadingMore && !isInitialLoad.current) {
      loadMore();
    }
  }, [hasMore, loadingMore, loadMore]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    if (!loading && notes.length > 0 && isInitialLoad.current) {
      requestAnimationFrame(() => {
        const container = scrollRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
        isInitialLoad.current = false;
      });
    }
  }, [loading, notes]);

  const postNote = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    const tempId = Date.now();
    const tempNote = {
      id: tempId,
      author: 'rea',
      content: text,
      created_at: new Date().toISOString(),
      _pending: true
    };
    setNotes(prev => [...prev, tempNote]);
    requestAnimationFrame(() => {
      const container = scrollRef.current;
      if (container) container.scrollTop = container.scrollHeight;
    });
    try {
      const res = await fetch(`${GATEWAY}/api/wall`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author: 'rea', content: text })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setNotes(prev => prev.map(n => n.id === tempId ? { ...data, _pending: false } : n));
    } catch (e) {
      setNotes(prev => prev.map(n => n.id === tempId ? { ...n, _failed: true } : n));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      postNote();
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      color: '#e0e0e0',
      fontFamily: '"DM Mono", "Noto Sans SC", monospace',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '20px 24px 12px',
        borderBottom: '1px solid #1a1a1a',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: '20px' }}>🏷️</span>
        <span style={{ fontSize: '15px', fontWeight: 500, letterSpacing: '0.5px' }}>
          客厅墙
        </span>
        <span style={{
          fontSize: '11px',
          color: '#555',
          marginLeft: 'auto',
        }}>
          {notes.filter(n => !n._pending).length} 条
        </span>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {loadingMore && (
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#555', padding: '8px' }}>
            正在加载更早的留言…
          </div>
        )}
        {!hasMore && !loading && notes.length > 0 && (
          <div style={{ textAlign: 'center', fontSize: '11px', color: '#333', padding: '8px' }}>
            没有更早的留言了
          </div>
        )}
        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#444', fontSize: '13px' }}>
            加载中…
          </div>
        )}
        {error && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#c44', fontSize: '13px' }}>
            加载失败：{error}
            <button onClick={loadInitial} style={{
              marginLeft: '12px', padding: '4px 12px',
              background: '#222', color: '#aaa', border: '1px solid #333',
              borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px'
            }}>重试</button>
          </div>
        )}
        {!loading && !error && notes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#444', fontSize: '13px' }}>
            墙上空空的。写点什么吧。
          </div>
        )}
        {notes.map((note) => {
          const isRea = note.author === 'rea';
          return (
            <div
              key={note.id}
              className="wall-item"
              style={{
                maxWidth: '75%',
                alignSelf: isRea ? 'flex-end' : 'flex-start',
                opacity: note._pending ? 0.5 : (note._failed ? 0.4 : 1),
              }}
            >
              <div style={{
                fontSize: '11px',
                color: isRea ? '#6b8afd' : '#e8a87c',
                marginBottom: '4px',
                textAlign: isRea ? 'right' : 'left',
              }}>
                {isRea ? 'Réa' : 'Sael'}
                {note._pending && ' · 发送中…'}
                {note._failed && ' · 发送失败'}
              </div>
              <div style={{
                background: isRea ? '#1a1a2e' : '#1a1a1a',
                border: `1px solid ${isRea ? '#2a2a4a' : '#222'}`,
                borderRadius: '12px',
                padding: '10px 14px',
                fontSize: '14px',
                lineHeight: '1.6',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
              }}>
                {note.content}
              </div>
              <div style={{
                fontSize: '10px',
                color: '#444',
                marginTop: '4px',
                textAlign: isRea ? 'right' : 'left',
              }}>
                {formatTs(note.created_at)}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid #1a1a1a',
        background: '#0d0d0d',
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-end',
      }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="写点什么…"
          rows={1}
          style={{
            flex: 1,
            background: '#141414',
            border: '1px solid #222',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#ddd',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'none',
            outline: 'none',
            minHeight: '40px',
            maxHeight: '120px',
          }}
        />
        <button
          onClick={postNote}
          disabled={!input.trim()}
          style={{
            padding: '10px 16px',
            background: input.trim() ? '#2a2a4a' : '#1a1a1a',
            color: input.trim() ? '#8b9afd' : '#444',
            border: '1px solid #2a2a3a',
            borderRadius: '8px',
            cursor: input.trim() ? 'pointer' : 'default',
            fontFamily: 'inherit',
            fontSize: '13px',
            whiteSpace: 'nowrap',
          }}
        >
          发送
        </button>
      </div>

      <style jsx global>{`
        .wall-item {
          content-visibility: auto;
          contain-intrinsic-size: auto 80px;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
      `}</style>
    </div>
  );
}