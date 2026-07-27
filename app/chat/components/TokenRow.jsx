// TokenRow — 从 ChatClient.jsx 抽离
import { useState } from 'react';
import { fmtN } from '../lib/config';

export default function TokenRow({ meta, theme }) {
  const [show, setShow] = useState(false);
  if (!meta) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
      <button
        onClick={() => setShow((s) => !s)}
        title={show ? "隐藏统计" : "显示统计"}
        style={{
          background: "none", border: "none", cursor: "pointer",
          padding: 0, lineHeight: 1, opacity: show ? 0.7 : 0.3,
          fontSize: 12, transition: "opacity 0.15s",
          color: theme.accent,
        }}
      >✰</button>
      {show && (
        <span style={{
          fontSize: 11, color: theme.timestamp, fontFamily: "'DM Mono', monospace",
          letterSpacing: "0.02em",
        }}>
          ↑ {fmtN(meta.promptTokens)} · ↓ {fmtN(meta.completionTokens)}
          {meta.speed ? ` · ⚡ ${meta.speed} tok/s` : ""}
          {meta.elapsed ? ` · ${meta.elapsed}s` : ""}
        </span>
      )}
    </div>
  );
}

// 消息菜单按钮样式
export const menuBtnStyle = (theme) => ({
  display: 'block', width: '100%', padding: '8px 14px',
  border: 'none', background: 'transparent', cursor: 'pointer',
  fontSize: 13, color: theme.aiText, textAlign: 'left',
  fontFamily: "'Noto Sans SC', sans-serif",
  transition: 'background 0.1s',
});