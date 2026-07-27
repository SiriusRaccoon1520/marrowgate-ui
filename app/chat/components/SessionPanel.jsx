// SessionPanel 会话列表+搜索面板 — 从 ChatClient.jsx 抽离 (原1283-1375行)
export default function SessionPanel({
  theme,
  showSessionList, sessions, sessionId,
  switchToSession, handleDeleteSession, handleNewChat,
  showSearch, searchQuery, setSearchQuery, handleSearch,
  searchResults, jumpToMessage,
}) {
  return (
    <>
      {showSessionList && (
        <div style={{
          position: 'relative', zIndex: 10,
          maxHeight: '40vh', overflowY: 'auto',
          background: theme.inputBg,
          borderBottom: `1px solid ${theme.border}`,
          padding: '8px 12px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: theme.aiText }}>会话记录</span>
            <button onClick={handleNewChat} style={{
              fontSize: 12, color: theme.accent, background: 'none', border: 'none', cursor: 'pointer',
            }}>+ 新对话</button>
          </div>
          {sessions.map(s => (
            <div
              key={s.id}
              onClick={() => switchToSession(s.id)}
              style={{
                padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                background: sessionId === s.id ? `${theme.accent}15` : 'transparent',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 2,
              }}
            >
              <span style={{ fontSize: 13, color: sessionId === s.id ? theme.accent : theme.aiText }}>
                {s.title}
              </span>
              <button
                onClick={(e) => handleDeleteSession(s.id, e)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.timestamp, fontSize: 14, padding: '0 4px' }}
              >×</button>
            </div>
          ))}
          {sessions.length === 0 && (
            <div style={{ fontSize: 12, color: theme.timestamp, textAlign: 'center', padding: '12px 0' }}>暂无会话</div>
          )}
        </div>
      )}

      {showSearch && (
        <div style={{
          position: 'relative', zIndex: 10,
          background: theme.inputBg,
          borderBottom: `1px solid ${theme.border}`,
          padding: '10px 12px',
        }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: searchResults.length > 0 ? 8 : 0 }}>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="搜索聊天记录..."
              style={{
                flex: 1, padding: '6px 12px', borderRadius: 8,
                border: `1px solid ${theme.border}`, background: theme.bg,
                color: theme.aiText, fontSize: 13, outline: 'none',
              }}
            />
            <button onClick={handleSearch} style={{
              padding: '6px 14px', borderRadius: 8, border: 'none',
              background: theme.accent, color: theme.userText, cursor: 'pointer', fontSize: 13,
            }}>搜</button>
          </div>
          {searchResults.length > 0 && (
            <div style={{ maxHeight: '30vh', overflowY: 'auto' }}>
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
      )}
    </>
  );
}
