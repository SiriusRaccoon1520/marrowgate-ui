// MobileLayout 移动端布局 — 从 ChatClient.jsx 抽离 (原1376-1623行)
import Bubble from './Bubble.jsx';
import SettingsMenu from './SettingsMenu.jsx';
import SessionPanel from './SessionPanel.jsx';
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
    }}>
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
        <button onClick={goHome} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: 6, color: '#999', display: 'flex', alignItems: 'center',
          borderRadius: 8,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => setShowSessionList(!showSessionList)}
            style={{
              background: showSessionList ? `${theme.accent}20` : 'none',
              border: 'none', cursor: 'pointer',
              padding: 6, color: showSessionList ? theme.accent : '#999',
              display: 'flex', alignItems: 'center', borderRadius: 8,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            style={{
              background: showSearch ? `${theme.accent}20` : 'none',
              border: 'none', cursor: 'pointer',
              padding: 6, color: showSearch ? theme.accent : '#999',
              display: 'flex', alignItems: 'center', borderRadius: 8,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </button>
        </div>

        <button onClick={() => {}} style={{
          background: 'none', border: 'none', cursor: 'default',
          fontSize: 13, color: theme.aiText, fontWeight: 500,
          fontFamily: "'DM Mono', monospace",
          letterSpacing: '0.02em', opacity: 0.8,
        }}>
          {currentModelLabel}
        </button>

        <SettingsMenu {...settingsMenuProps} />
      </div>

      <SessionPanel {...sessionPanelProps} />

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
    </div>
  );
}