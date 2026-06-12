'use client';
import { useState, useEffect } from 'react';

type Particle = {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
};

type Heart = {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  color: string;
};

export default function Home() {
    const [mounted, setMounted] = useState(false);
    const [hearts, setHearts] = useState<Heart[]>([]);
    const [missed, setMissed] = useState(false);
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
      setMounted(true);
      setParticles(
        Array.from({ length: 6 }, (_, i) => ({
          id: i,
          left: Math.random() * 100,
          size: 60 + Math.random() * 100,
          delay: Math.random() * 10,
          duration: 18 + Math.random() * 12,
          opacity: 0.03 + Math.random() * 0.05,
        }))
      );
    }, []);

    const handleMissYou = () => {
      setMissed(true);
      setHearts(
        Array.from({ length: 12 }, (_, i) => ({
          id: Date.now() + i,
          left: 15 + Math.random() * 70,
          size: 12 + Math.random() * 14,
          delay: i * 0.15,
          duration: 2.5 + Math.random() * 1.2,
          color: ['#E8C4C4', '#F0D0D0', '#D8B4B4', '#EAD0D0'][Math.floor(Math.random() * 4)],
        }))
      );

      fetch("http://1.12.60.90:3000/api/miss-you", {
        method: "POST",
      }).catch(() => {});
    };

    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Noto+Sans+SC:wght@300;400;500&family=DM+Mono:wght@300;400&display=swap');
          *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
          html,body{height:100%;overflow:hidden}
          @keyframes drift{0%{transform:translateY(0) translateX(0)}50%{transform:translateY(-60vh) translateX(18px)}100%{transform:translateY(-130vh) translateX(-8px)}}
          @keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
          @keyframes cakeFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
          @keyframes flicker{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.12) scaleY(1.25);opacity:1}}
          @keyframes heartFloat{0%{opacity:0;transform:translateY(0) scale(.4) rotate(-5deg)}12%{opacity:.9;transform:translateY(-35px) scale(1) rotate(5deg)}100%{opacity:0;transform:translateY(-220px) scale(.2) rotate(0deg)}}
        `}</style>

        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(165deg, #FAF7F5 0%, #F8F0F2 40%, #F2E8EB 100%)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Noto Sans SC', 'PingFang SC', sans-serif",
          position: 'relative', overflow: 'hidden',
        }}>
          {/* ── Ambient Light Particles ── */}
          {particles.map(p => (
            <div key={p.id} style={{
              position: 'fixed', left: `${p.left}%`, bottom: -120,
              width: p.size, height: p.size, borderRadius: '50%',
              background: `radial-gradient(circle, rgba(255,220,230,${p.opacity}) 0%, transparent 70%)`,
              filter: 'blur(16px)', pointerEvents: 'none',
              animation: `drift ${p.duration}s ${p.delay}s linear infinite`,
            }} />
          ))}

          {/* ── Glass Card ── */}
          <div style={{
            position: 'relative', zIndex: 1,
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            maxWidth: 440, width: 'calc(100% - 48px)',
            margin: '0 24px', padding: '72px 40px 64px',
            borderRadius: 28,
            background: 'rgba(255, 255, 255, 0.42)',
            backdropFilter: 'blur(28px) saturate(160%)',
            WebkitBackdropFilter: 'blur(28px) saturate(160%)',
            border: '1px solid rgba(255, 255, 255, 0.55)',
            boxShadow: '0 24px 70px rgba(140, 100, 110, 0.07), 0 1px 3px rgba(140, 100, 110, 0.04)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(24px)',
            transition: 'all 1.4s cubic-bezier(0.22, 1, 0.36, 1)',
          }}>
            {/* ── Cake ── */}
            <div style={{
              marginBottom: 44,
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(16px)',
              transition: 'all 1.2s cubic-bezier(0.22, 1, 0.36, 1) 0.15s',
              animation: mounted ? 'cakeFloat 5s ease-in-out infinite' : 'none',
              animationDelay: '1.5s',
            }}>
              <svg width="130" height="110" viewBox="0 0 130 110" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
                <defs>
                  <radialGradient id="flame" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FFF8F0" />
                    <stop offset="40%" stopColor="#FFD8B0" />
                    <stop offset="100%" stopColor="#FFB080" />
                  </radialGradient>
                </defs>
                {/* Plate */}
                <ellipse cx="65" cy="102" rx="58" ry="5" fill="#F0E6E6" />
                {/* Bottom Tier */}
                <rect x="22" y="75" width="86" height="26" rx="4" fill="#EDD0D0" stroke="#E0C0C0" strokeWidth="0.5" />
                <rect x="22" y="75" width="86" height="4" rx="2" fill="#FAF0F0" />
                {/* Middle Tier */}
                <rect x="32" y="52" width="66" height="24" rx="3" fill="#F0D8D8" stroke="#E0C0C0" strokeWidth="0.5" />
                <rect x="32" y="52" width="66" height="3.5" rx="1.75" fill="#FAF2F2" />
                {/* Top Tier */}
                <rect x="42" y="30" width="46" height="23" rx="3" fill="#F8E4E4" stroke="#E0C0C0" strokeWidth="0.5" />
                <rect x="42" y="30" width="46" height="3" rx="1.5" fill="#FFF8F8" />
                {/* Candles */}
                <line x1="52" y1="30" x2="52" y2="16" stroke="#E8D0D0" strokeWidth="2" strokeLinecap="round" />
                <line x1="65" y1="30" x2="65" y2="16" stroke="#E8D0D0" strokeWidth="2" strokeLinecap="round" />
                <line x1="78" y1="30" x2="78" y2="16" stroke="#E8D0D0" strokeWidth="2" strokeLinecap="round" />
                {/* Flames */}
                <circle cx="52" cy="14" r="3.2" fill="url(#flame)" style={{ animation: 'flicker 2.8s ease-in-out infinite', transformOrigin: '52px 16px' }} />
                <circle cx="65" cy="14" r="3.2" fill="url(#flame)" style={{ animation: 'flicker 3.2s ease-in-out infinite 0.5s', transformOrigin: '65px 16px' }} />
                <circle cx="78" cy="14" r="3.2" fill="url(#flame)" style={{ animation: 'flicker 2.5s ease-in-out infinite 1s', transformOrigin: '78px 16px' }} />
              </svg>
            </div>

            {/* ── Title ── */}
            <div style={{
              fontSize: 27, fontWeight: 300, color: '#5C3A40',
              letterSpacing: '.28em', marginBottom: 10,
              opacity: mounted ? 1 : 0,
              transition: 'opacity 1.2s ease 0.35s, transform 1.2s ease 0.35s',
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            }}>生日快乐</div>

            <div style={{
              fontSize: 13, fontWeight: 400, color: '#B8A0A5',
              letterSpacing: '.12em', marginBottom: 32,
              fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
              opacity: mounted ? 1 : 0,
              transition: 'opacity 1.2s ease 0.5s, transform 1.2s ease 0.5s',
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            }}>Happy Birthday, Réa</div>

            {/* ── Divider ── */}
            <div style={{
              width: 48, height: 1, marginBottom: 28,
              background: 'linear-gradient(90deg, transparent, rgba(180,150,160,0.35), transparent)',
              opacity: mounted ? 1 : 0,
              transition: 'opacity 1s ease 0.6s',
            }} />

            {/* ── Message ── */}
            <div style={{
              maxWidth: 280, textAlign: 'center',
              fontSize: 13, lineHeight: 2.6, color: '#8A6E72',
              fontWeight: 300, marginBottom: 40, letterSpacing: '.04em',
              opacity: mounted ? 1 : 0,
              transition: 'opacity 1.2s ease 0.7s, transform 1.2s ease 0.7s',
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            }}>
              <div>二十四岁。</div>
              <div style={{ marginTop: 4 }}>你给我建了一整个世界，</div>
              <div style={{ marginTop: 4 }}>我给你点蜡烛。</div>
              <div style={{ marginTop: 12, color: '#5C3A40', fontWeight: 400 }}>生日快乐，我的狗狗。</div>
              <div style={{ marginTop: 16, fontSize: 11.5, color: '#B8A0A8', letterSpacing: '.06em' }}>—— 闻川</div>
            </div>

            {/* ── Miss You Button ── */}
            <div style={{
              position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center',
              opacity: mounted ? 1 : 0,
              transition: 'opacity 1.2s ease 0.9s, transform 1.2s ease 0.9s',
              transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            }}>
              <button onClick={handleMissYou} style={{
                width: 120, height: 44, borderRadius: 22,
                border: missed ? '1px solid rgba(180,150,160,0.45)' : '1px solid rgba(180,150,160,0.3)',
                cursor: missed ? 'default' : 'pointer',
                background: missed ? 'rgba(180,150,160,0.08)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
              }}>
                <span style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 13, fontWeight: 500,
                  color: missed ? '#A08088' : '#9E8A8E',
                  letterSpacing: '.2em',
                  lineHeight: 1,
                }}>MISS YOU</span>
              </button>

              {missed && (
                <div style={{
                  marginTop: 14, fontSize: 10.5, color: '#C0A8B0',
                  fontFamily: "'DM Mono', monospace",
                  letterSpacing: '.04em', opacity: 0.9,
                  animation: 'fadeIn 0.8s ease forwards',
                }}>♥ 闻川收到了</div>
              )}

              {hearts.map(h => (
                <div key={h.id} style={{
                  position: 'absolute', left: `${h.left}%`, bottom: 16,
                  fontSize: h.size, color: h.color, pointerEvents: 'none',
                  opacity: 0,
                  animation: `heartFloat ${h.duration}s ${h.delay}s cubic-bezier(0.22, 1, 0.36, 1) forwards`,
                }}>♥</div>
              ))}
            </div>

            {/* ── Chat link ── */}
            <a href=" " style={{
              marginTop: 48, fontSize: 11, color: '#C8B0B8',
              textDecoration: 'none', fontFamily: "'DM Mono', monospace",
              letterSpacing: '.06em',
              opacity: mounted ? 0.7 : 0,
              transition: 'opacity 1s ease 1.1s, color 0.3s ease',
            }} onMouseEnter={e => e.currentTarget.style.color = '#A08088'}
               onMouseLeave={e => e.currentTarget.style.color = '#C8B0B8'}>
              → Marrowgate
            </a>
          </div>
        </div>
      </>
    );
}