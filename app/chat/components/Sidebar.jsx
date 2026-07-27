// Sidebar 侧边栏组件 — 从 ChatClient.jsx 抽离 (原819-874行)
export default function Sidebar({ theme, onNewChat, currentModelLabel }) {
  return (
    <div style={{
      width: 56,
      height: '100vh',
      background: theme.sidebarBg,
      borderRight: `1px solid ${theme.border}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '16px 0',
      flexShrink: 0,
    }}>
      <button
        onClick={onNewChat}
        style={{
          width: 36, height: 36, borderRadius: 10,
          border: `1px solid ${theme.border}`,
          background: theme.surface,
          color: theme.sidebarText,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          marginBottom: 20,
          transition: 'all 0.15s',
        }}
        title="新对话"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      <div style={{ flex: 1 }} />

      <div style={{
        writingMode: 'vertical-rl',
        fontSize: 11, color: theme.timestamp,
        fontFamily: "'DM Mono', monospace",
        letterSpacing: '0.1em',
        marginBottom: 16,
      }}>
        {currentModelLabel}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{
        width: 24, height: 24, borderRadius: '50%',
        background: `linear-gradient(135deg, ${theme.accent}, ${theme.userBubble})`,
        opacity: 0.6,
      }} />
    </div>
  );
}
