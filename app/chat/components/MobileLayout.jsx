// MobileLayout 移动端布局 — v2 改版：左滑抽屉式会话列表
import Bubble from './Bubble.jsx';
import SettingsMenu from './SettingsMenu.jsx';
import ChatInput from './ChatInput.jsx';
import { THEMES } from '../lib/config.js';

export default function MobileLayout(state) {
  const {
    theme, bgImage, goHome,
    showSessionList, setShowSessionList,
    showSearch, setShowSearch,
    currentModelLabel,
    model, setModel, themeId, setThemeId, bubbleStyle, setBubbleStyle,
    bgImage: bg, setBgImage,
    showAvatar, setShowAvatar, showNickname, setShowNickname,
    fontSize, setFontSize, imageRetention, setImageRetention,
    avatarUrls, handleAvatarUpload, scrollToTop, scrollToBottom,
    customColors, setCustomColors, gatewayUrl, setGatewayUrl, apiKey, setApiKey,
    modelList, loadingModels, refreshModels,
    worldBookEntries, setWorldBookEntries,
    mcpServers, setMcpServers,
    sessions, sessionId, switchToSession, handleDeleteSession, handleNewChat,
    searchQuery, setSearchQuery, handleSearch, searchResults, jumpToMessage,
    messages, streaming, scrollRef, bottomRef,
    bubbleStyle: bs, showAvatar: sa, showNickname: sn, fontSize: fs, avatarUrls: au,
    input, setInput, send, onKey, onCompositionStart, onCompositionEnd,
    pendingImages, removePendingImage, fileInputRef, onFileSelect,
    taRef, handleEditMessage,
  } = state;

  const sessionPanelProps = {
    theme, showSessionList, sessions, sessionId,
    switchToSession, handleDeleteSession, handleNewChat,
    showSearch, searchQuery, setSearchQuery, handleSearch,
    searchResults, jumpToMessage,
  };

  const settingsMenuProps = {
    model, setModel, themeId, setThemeId, bubbleStyle, setBubbleStyle,
    themes: THEMES, bgImage, setBgImage,
    showAvatar, setShowAvatar, showNickname, setShowNickname,
    fontSize, setFontSize, imageRetention, setImageRetention,
    avatarUrls, onAvatarUpload: handleAvatarUpload, scrollToTop, scrollToBottom,
    customColors, setCustomColors,
    gatewayUrl, setGatewayUrl, apiKey, setApiKey,
    modelList, loadingModels, refreshModels,
    worldBookEntries, setWorldBookEntries,
    mcpServers, setMcpServers,
  };

  const chatInputProps = {
    theme, input, setInput, streaming, send,
    onKey, onCompositionStart, onCompositionEnd,
    pendingImages, removePendingImage,
    fileInputRef, onFileSelect, taRef, currentModelLabel,
    isMobile: true,
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100dvh', width: '100%',
      background: bgImage ? `url(${bgImage}) center/cover no-repeat fixed` : theme.bg,
      fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {bgImage && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `${theme.bg}CC`,
          backdropFilter: 'blur(3px)',
          zIndex: 0,
        }} />
      )}

      {/* === 左滑抽屉遮罩 === */}
      {showSessionList && (
        <div
          onClick={() => setShowSessionList(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 20,
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      {/* === 左滑抽屉面板 === */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        width: '78%',
        maxWidth: 320,
        background: theme.inputBg || theme.bg,
        borderRight: `1px solid ${theme.border}`,
        zIndex: 30,
        transform: showSessionList ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* 抽屉头部 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 16px 12px',
          borderBottom: `1px solid ${theme.border}`,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: theme.aiText, letterSpacing: '0.02em' }}>
            会话记录
          </span>
          <button onClick={handleNewChat} style={{
            fontSize: 13, color: theme.accent, background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            新对话
          </button>
        </div>

        {/* 搜索框 */}
        <div style={{
          padding: '10px 14px',
          borderBottom: `1px solid ${theme.border}`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索聊天记录..."
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 10,
                border: `1px solid ${theme.border}`, background: theme.bg,
                color: theme.aiText, fontSize: 13, outline: 'none',
              }}
            />
            <button onClick={handleSearch} style={{
              padding: '8px 14px', borderRadius: 10, border: 'none',
              background: theme.accent, color: theme.userText, cursor: 'pointer', fontSize: 13,
            }}>搜</button>
          </div>
          {searchResults.length > 0 && (
            <div style={{ marginTop: 8, maxHeight: '24vh', overflowY: 'auto' }}>
              {searchResults.map(r => (
                <div
                  key={r.id}
                  onClick={() => jumpToMessage(r.session_id, r.ts)}
                  style={{
                    padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                    background: `${theme.accent}08`, marginBottom: 4,
                    fontSize: 12, color: theme.aiText,
                  }}
                >
                  <div style={{ fontSize: 10, color: theme.timestamp, marginBottom: 2 }}>
                    {r.chat_sessions?.title || '未知会话'} · {r.role === 'user' ? 'Réa' : 'Sael'}
                  </div>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.content.slice(0, 80)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 会话列表 */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '8px 10px',
        }}>
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => { switchToSession(s.id); setShowSessionList(false); }}
              style={{
                padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                background: sessionId === s.id ? `${theme.accent}15` : 'transparent',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 2,
                transition: 'background 0.12s',
              }}
            >
              <span style={{ fontSize: 14, color: sessionId === s.id ? theme.accent : theme.aiText, fontWeight: sessionId === s.id ? 500 : 400 }}>
                {s.title}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteSession(s.id, e); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.timestamp, fontSize: 16, padding: '0 4px', lineHeight: 1 }}
              >×</button>
            </div>
          ))}
          {sessions.length === 0 && (
            <div style={{ fontSize: 13, color: theme.timestamp, textAlign: 'center', padding: '20px 0' }}>
              暂无会话
            </div>
          )}
        </div>
      </div>

      {/* === 主内容区 === */}
      {bgImage && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `${theme.bg}CC`,
          backdropFilter: 'blur(3px)',
          zIndex: 0,
        }} />
      )}

      {/* 顶栏 */}
      <div style={{
        position: 'relative', zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px',
        borderBottom: `1px solid ${theme.border}`,
        background: bgImage ? `${theme.bg}F0` : theme.bg,
        backdropFilter: bgImage ? 'blur(12px)' : 'none',
        flexShrink: 0,
      }}>
        <button onClick={() => setShowSessionList(!showSessionList)} style={{
          background: showSessionList ? `${theme.accent}20` : 'none',
          border: 'none', cursor: 'pointer',
          padding: 8, color: showSessionList ? theme.accent : '#999',
          display: 'flex', alignItems: 'center', borderRadius: 10,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

        <div style={{
          fontSize: 13, color: theme.aiText, fontWeight: 500,
          fontFamily: "'DM Mono', monospace",
          letterSpacing: '0.02em', opacity: 0.8,
        }}>
          {messages.length > 0 ? `${messages.filter(m => m.role === 'user').length} 轮对话` : 'Sael'}
        </div>

        <SettingsMenu {...settingsMenuProps} />
      </div>

      {/* 消息区 */}
      <div ref={scrollRef} className="msg-scroll" style={{
        position: 'relative', zIndex: 1,
        flex: 1, overflowY: 'auto',
        padding: '12px 14px 8px',
      }}>
        {messages.length === 0 && (
          <div style={{
            height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center',
            color: theme.timestamp, fontSize: 13,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: '0.04em',
          }}>
            — 开始对话 —
          </div>
        )}

        {messages.map((msg, i) => (
          <Bubble
            key={i}
            msg={msg}
            theme={theme}
            bubbleStyle={bubbleStyle}
            isStreaming={streaming && i === messages.length - 1 && msg.role === 'assistant'}
            isMobile={true}
            showAvatar={showAvatar}
            showNickname={showNickname}
            fontSize={fontSize}
            avatarUrls={avatarUrls}
            onEdit={handleEditMessage}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* 输入区 */}
      <div style={{
        position: 'relative', zIndex: 10,
        flexShrink: 0,
        padding: '8px 12px 12px',
        background: bgImage ? `${theme.bg}F0` : theme.bg,
        backdropFilter: bgImage ? 'blur(12px)' : 'none',
        borderTop: `1px solid ${theme.border}`,
      }}>
        <ChatInput {...chatInputProps} />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.txt,.js,.jsx,.tsx,.ts,.json,.md,.css,.html,.pdf,.doc,.docx"
        multiple
        onChange={onFileSelect}
        style={{ display: 'none' }}
      />

      {/* fadeIn 动画定义 */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}