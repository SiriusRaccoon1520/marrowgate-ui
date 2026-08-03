// DesktopLayout 桌面端布局 — 从 ChatClient.jsx 抽离 (原1625-1896行)
import Bubble from './Bubble.jsx';
import Sidebar from './Sidebar.jsx';
import SettingsMenu from './SettingsMenu.jsx';
import SessionPanel from './SessionPanel.jsx';
import ChatInput from './ChatInput.jsx';
import { THEMES } from '../lib/config.js';

export default function DesktopLayout(state) {
  const {
    theme, bgImage, goHome,
    showSessionList, setShowSessionList,
    showSearch, setShowSearch,
    currentModelLabel, handleNewChat,
    model, setModel, themeId, setThemeId, bubbleStyle, setBubbleStyle,
    setBgImage,
    showAvatar, setShowAvatar, showNickname, setShowNickname,
    fontSize, setFontSize, imageRetention, setImageRetention,
    avatarUrls, handleAvatarUpload, scrollToTop, scrollToBottom,
    customColors, setCustomColors, gatewayUrl, setGatewayUrl, apiKey, setApiKey,
    modelList, loadingModels, refreshModels,
    worldBookEntries, setWorldBookEntries,
    mcpServers, setMcpServers,
    sessions, sessionId, switchToSession, handleDeleteSession,
    searchQuery, setSearchQuery, handleSearch, searchResults, jumpToMessage,
    messages, streaming, scrollRef, bottomRef,
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
    customColors, setCustomColors, gatewayUrl, setGatewayUrl, apiKey, setApiKey,
    modelList, loadingModels, refreshModels,
    worldBookEntries, setWorldBookEntries,
    mcpServers, setMcpServers,
  };

  const chatInputProps = {
    theme, input, setInput, streaming, send,
    onKey, onCompositionStart, onCompositionEnd,
    pendingImages, removePendingImage,
    fileInputRef, onFileSelect, taRef, currentModelLabel,
    isMobile: false,
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh', width: '100vw',
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

      <Sidebar theme={theme} onNewChat={handleNewChat} currentModelLabel={currentModelLabel} />

      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1,
        maxWidth: 900,
        margin: '0 auto',
        width: '100%',
      }}>
        {/* 顶栏 */}
        <div style={{
       
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 24px',
          borderBottom: `1px solid ${theme.border}`,
          background: bgImage ? `${theme.bg}F0` : theme.bg,
          backdropFilter: bgImage ? 'blur(12px)' : 'none',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={goHome} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 6, color: theme.timestamp, display: 'flex', alignItems: 'center',
              borderRadius: 8,
            }} title="返回首页"
            >
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
                  padding: 6, color: showSessionList ? theme.accent : theme.timestamp,
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
                  padding: 6, color: showSearch ? theme.accent : theme.timestamp,
                  display: 'flex', alignItems: 'center', borderRadius: 8,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </button>
            </div>

            <span style={{
              fontSize: 13, color: theme.timestamp,
              fontFamily: "'DM Mono', monospace",
            }}>
              {messages.length > 0 ? `${messages.filter(m => m.role === 'user').length} 轮对话` : '新对话'}
            </span>
          </div>

          <SettingsMenu {...settingsMenuProps} />
        </div>

        <SessionPanel {...sessionPanelProps} />

        {/* 消息区 */}
        <div ref={scrollRef} className="msg-scroll" style={{
          flex: 1, overflowY: 'auto',
          padding: '24px 32px 16px',
        }}>
          {messages.length === 0 && (
            <div style={{
              height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 16,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: `linear-gradient(135deg, ${theme.accent}, ${theme.userBubble})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: 0.8,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div style={{
                color: theme.timestamp, fontSize: 14,
                fontFamily: "'Noto Sans SC', sans-serif",
              }}>
                有什么可以帮你的吗？
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <Bubble
              key={i}
              msg={msg}
              theme={theme}
              bubbleStyle={bubbleStyle}
              isStreaming={streaming && i === messages.length - 1 && msg.role === 'assistant'}
              isMobile={false}
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
          flexShrink: 0,
          padding: '16px 32px 24px',
          background: bgImage ? `${theme.bg}F0` : theme.bg,
          backdropFilter: bgImage ? 'blur(12px)' : 'none',
          borderTop: `1px solid ${theme.border}`,
        }}>
          <ChatInput {...chatInputProps} />
        </div>
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