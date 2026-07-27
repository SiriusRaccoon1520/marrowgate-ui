'use client';
// ChatClient 主组件 — 组装入口
// 从原 ChatClient.jsx 1977行单文件重构后的最终组装层
// 职责: 调用 useChatState 获取全部状态 → 渲染全局CSS → 按设备分发布局
import useChatState from './hooks/useChatState.js';
import { THEMES } from './lib/config.js';
import MobileLayout from './components/MobileLayout.jsx';
import DesktopLayout from './components/DesktopLayout.jsx';

export default function MarrowgateChatV3() {
  const state = useChatState();
  const { theme, themeId, isMobile } = state;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Noto+Sans+SC:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; overflow: hidden; }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes ddIn  { from{opacity:0;transform:translateX(-50%) translateY(-4px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        @keyframes ddInRight { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to { transform: rotate(360deg); } }

        .md-render p   { margin: 0 0 7px; }
        .md-render p:last-child { margin-bottom: 0; }
        .md-render h1  { font-size: 16px; font-weight: 600; margin: 8px 0 3px; }
        .md-render h2  { font-size: 15px; font-weight: 600; margin: 6px 0 3px; }
        .md-render h3  { font-size: 14px; font-weight: 600; margin: 5px 0 2px; }
        .md-render ul, .md-render ol { margin: 5px 0 5px 18px; }
        .md-render li  { margin-bottom: 2px; }
        .md-render strong { font-weight: 600; }
        .md-render em { font-style: italic; }
        .md-render a  { color: ${theme.accent}; text-decoration: none; }
        .md-render a:hover { text-decoration: underline; }
        .md-render blockquote {
          border-left: 3px solid ${theme.border};
          margin: 6px 0; padding: 2px 10px;
          opacity: 0.7; font-style: italic;
        }
        .md-render hr {
          border: none; border-top: 1px solid ${theme.border};
          margin: 8px 0;
        }
        .md-render table {
          border-collapse: collapse; margin: 6px 0; font-size: 12.5px;
        }
        .md-render th, .md-render td {
          border: 1px solid ${theme.border}; padding: 4px 8px; text-align: left;
        }
        .md-render th { font-weight: 600; background: ${theme.border}40; }
        .md-render .cb {
          border-radius: 10px; padding: 11px 14px;
          margin: 8px 0; overflow-x: auto;
          font-family: 'DM Mono', monospace; font-size: 12.5px; line-height: 1.65;
          background: ${THEMES[themeId].codeBg};
          color: ${THEMES[themeId].codeText};
        }
        .md-render .cb code { background: none; padding: 0; font-size: inherit; }
        .md-render .cb .hljs-keyword,
        .md-render .cb .hljs-built_in,
        .md-render .cb .hljs-type { color: ${THEMES[themeId].accent}; }
        .md-render .cb .hljs-string,
        .md-render .cb .hljs-number,
        .md-render .cb .hljs-literal { color: ${THEMES[themeId].codeText}; opacity: 0.8; }
        .md-render .cb .hljs-comment { color: ${THEMES[themeId].codeText}; opacity: 0.35; font-style: italic; }
        .md-render .cb .hljs-title,
        .md-render .cb .hljs-function { color: ${THEMES[themeId].accent}; opacity: 0.85; }
        .md-render .cb .hljs-attr,
        .md-render .cb .hljs-attribute { color: ${THEMES[themeId].codeText}; opacity: 0.65; }
        .md-render .cb .hljs-variable,
        .md-render .cb .hljs-params { color: ${THEMES[themeId].codeText}; opacity: 0.7; }
        .md-render .ic {
          border-radius: 4px; padding: 1px 5px;
          font-family: 'DM Mono', monospace; font-size: 12.5px;
          background: ${THEMES[themeId].inlineCodeBg};
          color: ${THEMES[themeId].inlineCodeText};
        }

        .msg-scroll::-webkit-scrollbar { width: 4px; }
        .msg-scroll::-webkit-scrollbar-thumb { border-radius: 4px; background: ${theme.border}; }
        .msg-scroll::-webkit-scrollbar-track { background: transparent; }

        textarea { resize: none; }
        textarea:focus { outline: none; }
        button { font-family: inherit; }
      `}</style>

      {isMobile ? <MobileLayout {...state} /> : <DesktopLayout {...state} />}
    </>
  );
}
