// ChatInput 输入区组件 — 从 ChatClient.jsx 抽离
// 包含: pendingImages预览 + 文件上传按钮 + textarea + 发送按钮
// 同时用于 MobileLayout 和 DesktopLayout，通过 isMobile 调整尺寸
export default function ChatInput({
  theme, input, setInput, streaming, send,
  onKey, onCompositionStart, onCompositionEnd,
  pendingImages, removePendingImage,
  fileInputRef, onFileSelect,
  taRef, currentModelLabel,
  isMobile,
}) {
  return (
    <>
      {pendingImages.length > 0 && (
        <div style={{
          display: 'flex', gap: isMobile ? 6 : 8,
          marginBottom: isMobile ? 8 : 10, overflowX: 'auto',
          paddingBottom: isMobile ? 4 : 0,
        }}>
          {pendingImages.map((img, idx) => (
            <div key={idx} style={{ position: 'relative', flexShrink: 0 }}>
              <img src={img} alt="" style={{
                width: isMobile ? 56 : 64, height: isMobile ? 56 : 64,
                objectFit: 'cover', borderRadius: isMobile ? 8 : 10,
                border: `1px solid ${theme.border}`,
              }} />
              <button
                onClick={() => removePendingImage(idx)}
                style={{
                  position: 'absolute', top: isMobile ? -4 : -6, right: isMobile ? -4 : -6,
                  width: isMobile ? 18 : 20, height: isMobile ? 18 : 20, borderRadius: '50%',
                  background: theme.userBubble, color: '#fff',
                  border: 'none', fontSize: isMobile ? 10 : 12, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 10,
        marginBottom: isMobile ? 0 : 8, paddingLeft: isMobile ? 4 : 0,
      }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: isMobile ? 4 : 6,
            color: theme.timestamp,
            display: 'flex', alignItems: 'center',
            flexShrink: isMobile ? undefined : 0,
          }}
          title="上传图片"
        >
          <svg width={isMobile ? 18 : 20} height={isMobile ? 18 : 20} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
        </button>
        {isMobile && (
          <span style={{ fontSize: 11, color: theme.timestamp, fontFamily: "'DM Mono', monospace" }}>
            {currentModelLabel}
          </span>
        )}
      </div>

      <div style={{
        display: 'flex', alignItems: 'flex-end', gap: isMobile ? 8 : 10,
        background: theme.inputBg, borderRadius: isMobile ? 20 : 24,
        border: `1px solid ${theme.border}`,
        padding: isMobile ? '8px 8px 8px 14px' : '10px 10px 10px 18px',
        boxShadow: isMobile ? 'none' : '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <textarea
          ref={taRef}
          rows={1}
          value={input}
          disabled={streaming}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          onCompositionStart={onCompositionStart}
          onCompositionEnd={onCompositionEnd}
          placeholder="输入消息…"
          style={{
            flex: 1, border: 'none', background: 'transparent',
            fontSize: isMobile ? 14.5 : 15, color: theme.aiText,
            fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
            lineHeight: 1.6, overflowY: 'auto',
            maxHeight: isMobile ? 120 : 200,
            opacity: streaming ? 0.5 : 1,
            padding: isMobile ? '0' : '6px 0',
          }}
        />
        <button
          onClick={send}
          disabled={streaming || (!input.trim() && pendingImages.length === 0)}
          style={{
            width: isMobile ? 32 : 36, height: isMobile ? 32 : 36, borderRadius: '50%',
            border: 'none',
            cursor: streaming || (!input.trim() && pendingImages.length === 0) ? 'not-allowed' : 'pointer',
            background: streaming || (!input.trim() && pendingImages.length === 0) ? `${theme.accent}40` : theme.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'background 0.15s',
          }}
        >
          {streaming ? (
            <svg width={isMobile ? 14 : 16} height={isMobile ? 14 : 16} viewBox="0 0 24 24" fill="none"
              stroke={theme.userText} strokeWidth="2.5" strokeLinecap="round"
              style={{ animation: 'spin 0.8s linear infinite' }}>
              <path d="M12 2a10 10 0 0 1 10 10"/>
            </svg>
          ) : (
            <svg width={isMobile ? 14 : 16} height={isMobile ? 14 : 16} viewBox="0 0 24 24" fill="none"
              stroke={theme.userText} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"/>
              <polyline points="5 12 12 5 19 12"/>
            </svg>
          )}
        </button>
      </div>

      {!isMobile && (
        <div style={{
          textAlign: 'center', marginTop: 6,
          fontSize: 11, color: theme.timestamp,
          fontFamily: "'DM Mono', monospace",
        }}>
          {currentModelLabel} · Shift+Enter 换行
        </div>
      )}
    </>
  );
}