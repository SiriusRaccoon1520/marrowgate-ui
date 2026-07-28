// Bubble 消息气泡组件 — 从 ChatClient.jsx 抽离 (原242-474行)
import { useState, useRef, useEffect, memo } from 'react';
import { AVATAR_CONFIG, formatTs } from '../lib/config';
import MarkdownContent from './MarkdownContent';
import ReasoningBlock from './ReasoningBlock';
import TokenRow, { menuBtnStyle } from './TokenRow';

function BubbleInner({ msg, theme, bubbleStyle, isStreaming, isMobile, showAvatar, showNickname, fontSize, onEdit, avatarUrls }) {
  const isUser = msg.role === "user";
  const hasImages = msg.images && msg.images.length > 0;
  const avatarCfg = isUser ? AVATAR_CONFIG.rea : AVATAR_CONFIG.sael;

  // 【功能2】长按消息菜单
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const longPressRef = useRef(null);
  const menuRef = useRef(null);

  const startLongPress = (e) => {
    const touch = e.touches?.[0] || e;
    const x = touch.clientX || 0;
    const y = touch.clientY || 0;
    longPressRef.current = setTimeout(() => {
      setMenuPos({ x, y });
      setMenuOpen(true);
    }, 500);
  };
  const cancelLongPress = () => {
    if (longPressRef.current) { clearTimeout(longPressRef.current); longPressRef.current = null; }
  };

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    const esc = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', close);
    document.addEventListener('touchstart', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('touchstart', close);
      document.removeEventListener('keydown', esc);
    };
  }, [menuOpen]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(msg.content || '');
    setMenuOpen(false);
  };
  const handleSelect = () => {
    const el = document.querySelector(`[data-ts="${msg.ts}"] .md-render`);
    if (el) {
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    setMenuOpen(false);
  };
  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ text: msg.content || '' }); } catch (e) {}
    } else {
      navigator.clipboard?.writeText(msg.content || '');
    }
    setMenuOpen(false);
  };
  const handleEditMsg = () => {
    setMenuOpen(false);
    if (onEdit) onEdit(msg);
  };

  const liquidGlassStyle = {
    position: 'relative',
    background: 'rgba(255,255,255,0.25)',
    backdropFilter: 'blur(20px) saturate(180%)',
    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
    border: '1px solid rgba(255,255,255,0.45)',
    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.6), 0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)`,
    overflow: 'hidden',
  };

  const bubbleInner = (
    <div style={{
      maxWidth: isMobile ? "85%" : "70%",
      padding: isMobile ? "10px 12px" : "12px 16px",
      borderRadius: 16,
      ...(isUser ? {
        background: theme.userBubble,
        color: theme.userText,
        borderRadius: '16px 16px 4px 16px',
      } : bubbleStyle === 'liquidGlass' ? {
        ...liquidGlassStyle,
        color: theme.aiText,
        borderRadius: '16px 16px 16px 4px',
      } : {
        background: theme.aiBubbleSolid,
        color: theme.aiText,
        borderRadius: '16px 16px 16px 4px',
      }),
      fontSize: fontSize || (isMobile ? 14.5 : 15),
      lineHeight: 1.7,
      wordBreak: "break-word",
      fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
    }}>
      {!isUser && bubbleStyle === 'liquidGlass' && (
        <>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.2) 100%)',
            pointerEvents: 'none', zIndex: 1,
          }} />
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0))',
            borderRadius: 'inherit', pointerEvents: 'none', zIndex: 2,
            mixBlendMode: 'screen',
          }} />
        </>
      )}

      <div style={{ position: 'relative', zIndex: 3 }}>
        {hasImages && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            {msg.images.map((img, idx) => (
              <img key={idx} src={img} alt="" style={{
                maxWidth: 120, maxHeight: 120, borderRadius: 8,
                objectFit: 'cover', border: `1px solid ${theme.border}`,
              }} />
            ))}
          </div>
        )}
        {isUser ? (
          <span style={{ whiteSpace: "pre-wrap" }}>{msg.content}</span>
        ) : (
          <>
            {/* 【功能1】思考链显示 */}
            {msg.meta?.reasoning && (
              <ReasoningBlock reasoning={msg.meta.reasoning} theme={theme} isStreaming={isStreaming} />
            )}
            <MarkdownContent content={msg.content} />
            {isStreaming && !msg.content && (
              <span style={{ color: '#999' }}>
                <span style={{ animation: 'blink 1.5s ease-in-out infinite' }}>思考中</span>
              </span>
            )}
          </>
        )}
        {isStreaming && msg.content && (
          <span style={{
            display: "inline-block", width: 1.5, height: "1em",
            background: "#c06080", marginLeft: 2,
            verticalAlign: "text-bottom", borderRadius: 1,
            animation: "blink 0.8s step-start infinite",
          }}/>
        )}
      </div>
    </div>
  );

  const avatarRoleKey = isUser ? 'rea' : 'sael';
  const uploadedAvatar = avatarUrls?.[avatarRoleKey];

  const avatarEl = showAvatar ? (
    <div style={{
      width: isMobile ? 26 : 30, height: isMobile ? 26 : 30,
      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: isMobile ? 13 : 15, flexShrink: 0, marginTop: 2,
      background: isUser ? `${theme.userBubble}30` : `${theme.aiBubbleSolid}`,
      border: `1px solid ${theme.border}`,
      overflow: 'hidden',
    }}>
      {uploadedAvatar ? (
        <img src={uploadedAvatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
      ) : (
        avatarCfg.emoji
      )}
    </div>
  ) : null;

  return (
    <div style={{ marginBottom: 2, position: 'relative' }} data-ts={msg.ts}
      onTouchStart={startLongPress}
      onTouchEnd={cancelLongPress}
      onTouchMove={cancelLongPress}
      onContextMenu={(e) => { e.preventDefault(); setMenuPos({ x: e.clientX, y: e.clientY }); setMenuOpen(true); }}
    >
      <div style={{
        textAlign: isUser ? "right" : "left",
        fontSize: 11, color: theme.timestamp,
        padding: "8px 4px 4px",
        fontFamily: "'DM Mono', monospace",
        letterSpacing: "0.01em",
        display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start',
        alignItems: 'center', gap: 6,
      }}>
        {showNickname && <span style={{ fontSize: 11, fontWeight: 500, color: theme.accent }}>{avatarCfg.name}</span>}
        {formatTs(new Date(msg.ts))}
      </div>

      <div style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
        alignItems: 'flex-start',
        gap: 8,
        marginBottom: 6,
      }}>
        {!isUser && avatarEl}
        {bubbleInner}
        {isUser && avatarEl}
      </div>

      {!isUser && <TokenRow meta={msg.meta} theme={theme} />}

      {/* 【功能2】长按消息菜单 */}
      {menuOpen && (
        <div ref={menuRef} style={{
          position: 'fixed',
          left: Math.min(menuPos.x, window.innerWidth - 160),
          top: Math.min(menuPos.y, window.innerHeight - 180),
          zIndex: 9999,
          background: theme.aiBubbleSolid,
          border: `1px solid ${theme.border}`,
          borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          padding: '4px 0',
          minWidth: 140,
          overflow: 'hidden',
        }}>
          <button onClick={handleCopy} style={menuBtnStyle(theme)}>📋 复制</button>
          <button onClick={handleSelect} style={menuBtnStyle(theme)}>✂️ 选择文本</button>
          {isUser && <button onClick={handleEditMsg} style={menuBtnStyle(theme)}>✏️ 编辑</button>}
          <button onClick={handleShare} style={menuBtnStyle(theme)}>📤 分享</button>
        </div>
      )}
    </div>
  );
}

// React.memo 防止打字时所有气泡重渲染
function areEqual(prev, next) {
  return prev.msg === next.msg &&
    prev.theme === next.theme &&
    prev.bubbleStyle === next.bubbleStyle &&
    prev.isStreaming === next.isStreaming &&
    prev.isMobile === next.isMobile &&
    prev.showAvatar === next.showAvatar &&
    prev.showNickname === next.showNickname &&
    prev.fontSize === next.fontSize &&
    prev.onEdit === next.onEdit &&
    prev.avatarUrls === next.avatarUrls;
}

const Bubble = memo(BubbleInner, areEqual);

export default Bubble;
