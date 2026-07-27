// ReasoningBlock — 从 ChatClient.jsx 抽离
import { useState } from 'react';

export default function ReasoningBlock({ reasoning, theme, isStreaming }) {
  const [expanded, setExpanded] = useState(false);
  if (!reasoning) return null;
  const preview = reasoning.slice(0, 80);
  const isLong = reasoning.length > 80;
  return (
    <div style={{
      marginBottom: 6, borderRadius: 10, overflow: 'hidden',
      border: `1px solid ${theme.border}`,
      background: `${theme.accent}08`,
      fontSize: 12.5, lineHeight: 1.6,
    }}>
      <button
        onClick={() => isLong && setExpanded(!expanded)}
        style={{
          width: '100%', padding: '6px 10px', border: 'none', cursor: isLong ? 'pointer' : 'default',
          background: 'transparent', color: theme.timestamp,
          fontSize: 11, textAlign: 'left',
          fontFamily: "'DM Mono', monospace",
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      >
        <span style={{ opacity: 0.6 }}>💭</span>
        <span>思考链</span>
        {isLong && <span style={{ marginLeft: 'auto', fontSize: 10 }}>{expanded ? '▾' : '▸'}</span>}
      </button>
      {(expanded || !isLong) && (
        <div style={{
          padding: '6px 10px 8px',
          color: theme.aiText, opacity: 0.75,
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          fontFamily: "'Noto Sans SC', sans-serif",
          maxHeight: expanded ? 'none' : '200px',
          overflowY: 'auto',
        }}>
          {reasoning}
        </div>
      )}
      {!expanded && isLong && (
        <div style={{ padding: '0 10px 6px', color: theme.timestamp, fontSize: 11, opacity: 0.5 }}>
          {preview}…
        </div>
      )}
    </div>
  );
}