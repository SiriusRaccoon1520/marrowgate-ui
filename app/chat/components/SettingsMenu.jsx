// SettingsMenu 设置菜单组件 — 从 ChatClient.jsx 抽离 (原476-817行)
import { useState, useRef, useEffect } from 'react';
import { THEMES, BUBBLE_STYLES, MODELS, AVATAR_CONFIG } from '../lib/config.js';

export default function SettingsMenu({
  model, setModel, themeId, setThemeId, bubbleStyle, setBubbleStyle,
  themes, bgImage, setBgImage,
  showAvatar, setShowAvatar, showNickname, setShowNickname,
  fontSize, setFontSize, imageRetention, setImageRetention,
  avatarUrls, onAvatarUpload, scrollToTop, scrollToBottom,
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('model');
  const ref = useRef(null);
  const theme = THEMES[themeId];

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setBgImage(dataUrl);
      localStorage.setItem('mg_bg', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleBgUrl = () => {
    const url = prompt('输入图片 URL：');
    if (url) {
      setBgImage(url);
      localStorage.setItem('mg_bg', url);
    }
  };

  const clearBg = () => {
    setBgImage(null);
    localStorage.removeItem('mg_bg');
  };

  if (!open) return (
    <button
      onClick={() => setOpen(true)}
      style={{
        background: "none", border: "none", cursor: "pointer",
        padding: 6, color: "#bbb", display: "flex", alignItems: "center",
        borderRadius: 8,
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    </button>
  );

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(false)}
        style={{
          background: `${theme.accent}20`, border: "none", cursor: "pointer",
          padding: 6, color: theme.accent, display: "flex", alignItems: "center",
          borderRadius: 8,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>

      <div style={{
        position: "absolute", top: "calc(100% + 8px)", right: 0,
        width: 260,
        background: theme.inputBg,
        border: `1px solid ${theme.border}`,
        borderRadius: 14,
        boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
        padding: 0,
        zIndex: 999,
        animation: "ddInRight 0.15s ease both",
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', borderBottom: `1px solid ${theme.border}`,
        }}>
          {[
            { id: 'model', label: '模型' },
            { id: 'theme', label: '外观' },
            { id: 'background', label: '背景' },
            { id: 'display', label: '显示' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '10px 0', border: 'none', cursor: 'pointer',
                background: tab === t.id ? `${theme.accent}15` : 'transparent',
                color: tab === t.id ? theme.accent : theme.timestamp,
                fontSize: 12, fontWeight: tab === t.id ? 600 : 400,
                fontFamily: "'Noto Sans SC', sans-serif",
                borderBottom: tab === t.id ? `2px solid ${theme.accent}` : '2px solid transparent',
                marginBottom: -1,
              }}
            >{t.label}</button>
          ))}
        </div>

        <div style={{ padding: '14px 16px', maxHeight: 320, overflowY: 'auto' }}>
          {tab === 'model' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {MODELS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setModel(m.id)}
                  style={{
                    width: '100%', padding: '10px 12px', borderRadius: 10,
                    border: `1.5px solid ${model === m.id ? theme.accent : theme.border}`,
                    cursor: 'pointer', background: model === m.id ? `${theme.accent}10` : 'transparent',
                    color: model === m.id ? theme.accent : theme.aiText,
                    fontSize: 13, textAlign: 'left',
                    fontFamily: "'DM Mono', 'Noto Sans SC', sans-serif",
                    fontWeight: model === m.id ? 600 : 400,
                    transition: 'all 0.15s',
                  }}
                >
                  {model === m.id ? '● ' : '○ '}{m.label}
                </button>
              ))}
            </div>
          )}

          {tab === 'theme' && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: theme.aiText, marginBottom: 10, letterSpacing: '0.05em' }}>
                主题
              </div>
              {Object.values(themes).map(t => (
                <button
                  key={t.id}
                  onClick={() => setThemeId(t.id)}
                  style={{
                    width: '100%', padding: '8px 10px', marginBottom: 6,
                    borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: themeId === t.id ? `${t.accent}15` : 'transparent',
                    color: themeId === t.id ? t.accent : t.aiText,
                    fontSize: 12, textAlign: 'left',
                    fontFamily: "'Noto Sans SC', sans-serif",
                    fontWeight: themeId === t.id ? 500 : 400,
                  }}
                >
                  {themeId === t.id ? '● ' : '○ '}{t.name}
                </button>
              ))}

              <div style={{ height: 1, background: theme.border, margin: '12px 0' }} />

              <div style={{ fontSize: 11, fontWeight: 600, color: theme.aiText, marginBottom: 10, letterSpacing: '0.05em' }}>
                气泡风格
              </div>
              {Object.values(BUBBLE_STYLES).map(b => (
                <button
                  key={b.id}
                  onClick={() => setBubbleStyle(b.id)}
                  style={{
                    width: '100%', padding: '8px 10px', marginBottom: 6,
                    borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: bubbleStyle === b.id ? `${theme.accent}15` : 'transparent',
                    color: bubbleStyle === b.id ? theme.accent : theme.aiText,
                    fontSize: 12, textAlign: 'left',
                    fontFamily: "'Noto Sans SC', sans-serif",
                    fontWeight: bubbleStyle === b.id ? 500 : 400,
                  }}
                >
                  {bubbleStyle === b.id ? '● ' : '○ '}{b.name}
                </button>
              ))}
            </div>
          )}

          {tab === 'background' && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: theme.aiText, marginBottom: 10, letterSpacing: '0.05em' }}>
                聊天背景
              </div>

              {bgImage && (
                <div style={{ marginBottom: 12, position: 'relative' }}>
                  <img src={bgImage} alt="bg" style={{
                    width: '100%', height: 100, objectFit: 'cover', borderRadius: 10,
                    border: `1px solid ${theme.border}`,
                  }} />
                  <button
                    onClick={clearBg}
                    style={{
                      position: 'absolute', top: 6, right: 6,
                      background: 'rgba(0,0,0,0.6)', color: '#fff',
                      border: 'none', borderRadius: 6, padding: '4px 8px',
                      fontSize: 11, cursor: 'pointer',
                    }}
                  >清除</button>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <label style={{
                  flex: 1, padding: '10px 0', textAlign: 'center',
                  border: `1.5px dashed ${theme.border}`, borderRadius: 10,
                  cursor: 'pointer', fontSize: 12, color: theme.aiText,
                  background: `${theme.accent}08`,
                }}>
                  <input type="file" accept="image/*" onChange={handleBgUpload} style={{ display: 'none' }} />
                  📁 上传图片
                </label>
                <button
                  onClick={handleBgUrl}
                  style={{
                    flex: 1, padding: '10px 0', textAlign: 'center',
                    border: `1.5px dashed ${theme.border}`, borderRadius: 10,
                    cursor: 'pointer', fontSize: 12, color: theme.aiText,
                    background: `${theme.accent}08`, backgroundColor: 'transparent',
                  }}
                >🔗 URL</button>
              </div>
            </div>
          )}

          {tab === 'display' && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: theme.aiText, marginBottom: 10, letterSpacing: '0.05em' }}>
                头像与昵称
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button
                  onClick={() => { const v = !showAvatar; setShowAvatar(v); localStorage.setItem('mg_show_avatar', v); }}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: showAvatar ? `${theme.accent}15` : 'transparent',
                    color: showAvatar ? theme.accent : theme.aiText, fontSize: 12, textAlign: 'left',
                    fontFamily: "'Noto Sans SC', sans-serif",
                  }}
                >{showAvatar ? '● ' : '○ '}显示头像</button>
                <button
                  onClick={() => { const v = !showNickname; setShowNickname(v); localStorage.setItem('mg_show_nickname', v); }}
                  style={{
                    width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: showNickname ? `${theme.accent}15` : 'transparent',
                    color: showNickname ? theme.accent : theme.aiText, fontSize: 12, textAlign: 'left',
                    fontFamily: "'Noto Sans SC', sans-serif",
                  }}
                >{showNickname ? '● ' : '○ '}显示昵称</button>
              </div>

              {/* 【功能6】头像上传 */}
              <div style={{ marginTop: 10, display: 'flex', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, background: theme.aiBubbleSolid,
                    border: `1px solid ${theme.border}`, overflow: 'hidden',
                  }}>
                    {avatarUrls?.sael
                      ? <img src={avatarUrls.sael} alt="Sael" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : AVATAR_CONFIG.sael.emoji}
                  </div>
                  <label style={{ fontSize: 10, color: theme.accent, cursor: 'pointer', textDecoration: 'underline' }}>
                    Sael
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={(e) => { if (e.target.files[0]) onAvatarUpload('sael', e.target.files[0]); e.target.value = ''; }} />
                  </label>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, background: `${theme.userBubble}30`,
                    border: `1px solid ${theme.border}`, overflow: 'hidden',
                  }}>
                    {avatarUrls?.rea
                      ? <img src={avatarUrls.rea} alt="Réa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : AVATAR_CONFIG.rea.emoji}
                  </div>
                  <label style={{ fontSize: 10, color: theme.accent, cursor: 'pointer', textDecoration: 'underline' }}>
                    Réa
                    <input type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={(e) => { if (e.target.files[0]) onAvatarUpload('rea', e.target.files[0]); e.target.value = ''; }} />
                  </label>
                </div>
              </div>

              <div style={{ height: 1, background: theme.border, margin: '12px 0' }} />

              {/* 【功能5】字体大小调节 */}
              <div style={{ fontSize: 11, fontWeight: 600, color: theme.aiText, marginBottom: 10, letterSpacing: '0.05em' }}>
                字体大小
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <button onClick={() => { const v = Math.max(12, fontSize - 1); setFontSize(v); localStorage.setItem('marrowgate_chat_fontsize', v); }}
                  style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', fontSize: 14, color: theme.aiText }}>A-</button>
                <input type="number" min={12} max={22} value={fontSize}
                  onChange={(e) => { const v = Math.min(22, Math.max(12, parseInt(e.target.value) || 15)); setFontSize(v); localStorage.setItem('marrowgate_chat_fontsize', v); }}
                  style={{ width: 48, textAlign: 'center', border: `1px solid ${theme.border}`, borderRadius: 8, padding: '6px 0', fontSize: 12, color: theme.aiText, background: 'transparent', fontFamily: "'DM Mono', monospace" }} />
                <button onClick={() => { const v = Math.min(22, fontSize + 1); setFontSize(v); localStorage.setItem('marrowgate_chat_fontsize', v); }}
                  style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${theme.border}`, background: 'transparent', cursor: 'pointer', fontSize: 14, color: theme.aiText }}>A+</button>
                <input type="range" min={12} max={22} value={fontSize}
                  onChange={(e) => { const v = parseInt(e.target.value); setFontSize(v); localStorage.setItem('marrowgate_chat_fontsize', v); }}
                  style={{ flex: 1, accentColor: theme.accent }} />
              </div>

              {/* 【功能7】图片保留回合数 */}
              <div style={{ fontSize: 11, fontWeight: 600, color: theme.aiText, marginBottom: 10, marginTop: 6, letterSpacing: '0.05em' }}>
                图片保留 (回合)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="number" min={0} max={50} value={imageRetention}
                  onChange={(e) => { const v = Math.min(50, Math.max(0, parseInt(e.target.value) || 0)); setImageRetention(v); localStorage.setItem('marrowgate_image_retention', v); }}
                  style={{ width: 60, textAlign: 'center', border: `1px solid ${theme.border}`, borderRadius: 8, padding: '6px 0', fontSize: 12, color: theme.aiText, background: 'transparent', fontFamily: "'DM Mono', monospace" }} />
                <span style={{ fontSize: 11, color: theme.timestamp }}>0 = 不保留历史图片</span>
              </div>

              <div style={{ height: 1, background: theme.border, margin: '12px 0' }} />

              <div style={{ fontSize: 11, fontWeight: 600, color: theme.aiText, marginBottom: 10, letterSpacing: '0.05em' }}>
                导航
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={scrollToTop} style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, border: `1px solid ${theme.border}`,
                  cursor: 'pointer', fontSize: 12, color: theme.aiText, background: 'transparent',
                }}>↑ 置顶</button>
                <button onClick={scrollToBottom} style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, border: `1px solid ${theme.border}`,
                  cursor: 'pointer', fontSize: 12, color: theme.aiText, background: 'transparent',
                }}>↓ 置底</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
