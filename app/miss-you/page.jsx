// app/miss-you/page.jsx
'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const GATEWAY = 'http://1.12.60.90:3000';

function HeartParticle({ x, y, id }) {
  const angle = Math.random() * Math.PI * 2;
  const distance = 80 + Math.random() * 120;
  const dx = Math.cos(angle) * distance;
  const dy = Math.sin(angle) * distance - 60;
  const size = 16 + Math.random() * 20;
  const duration = 0.8 + Math.random() * 0.6;

  return (
    <span
      className="fixed pointer-events-none z-50"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        fontSize: size,
        animation: `heartBurst ${duration}s ease-out forwards`,
        '--dx': `${dx}px`,
        '--dy': `${dy}px`,
      }}
    >
      💕
    </span>
  );
}

function parseTotal(raw) {
  if (typeof raw === 'number') return raw;
  if (Array.isArray(raw) && raw.length > 0) return raw[0].total || 0;
  return 0;
}

export default function MissYou() {
  const router = useRouter();
  const [particles, setParticles] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const btnRef = useRef(null);
  const idRef = useRef(0);

  // 页面加载时从localStorage恢复计数，同时从网关拉最新数据
  useEffect(() => {
    const saved = localStorage.getItem('missYouCount');
    if (saved) setCount(parseInt(saved, 10) || 0);
    fetch(`${GATEWAY}/api/miss-you`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d && typeof d.total === 'number') {
          setCount(d.total);
          localStorage.setItem('missYouCount', String(d.total));
        }
      })
      .catch(() => {});
  }, []);

  const handleClick = useCallback(async (e) => {
    if (loading) return;
    setLoading(true);

    const rect = e.currentTarget.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // 生成粒子
    const newParticles = Array.from({ length: 6 + Math.floor(Math.random() * 4) }, () => {
      idRef.current++;
      return { id: idRef.current, x: cx, y: cy };
    });
    setParticles(prev => [...prev, ...newParticles]);

    // 1.5秒后清理粒子
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 1500);

    // 调用网关API
    try {
      const res = await fetch(`${GATEWAY}/api/miss-you`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        const total = parseTotal(data.total);
        setCount(total);
        localStorage.setItem('missYouCount', String(total));
      }
    } catch (err) {
      console.error('[miss-you] 请求失败:', err);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return (
    <>
      <style>{`
        @keyframes heartBurst {
          0% { transform: translate(0, 0) scale(0.5); opacity: 1; }
          50% { opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
        }
      `}</style>

      <div className="min-h-screen bg-[#FFF1F1] flex flex-col items-center justify-center relative">
        {/* 返回按钮 */}
        <button
          onClick={() => router.back()}
          className="absolute top-6 left-4 text-[#C9898B] text-sm"
        >
          ← 回去
        </button>

        {/* 粒子容器 */}
        {particles.map(p => (
          <HeartParticle key={p.id} x={p.x} y={p.y} id={p.id} />
        ))}

        {/* 大圆圈 */}
        <button
          ref={btnRef}
          onClick={handleClick}
          disabled={loading}
          className="w-56 h-56 rounded-full border-[3px] border-[#C9898B]/60 
                     flex flex-col items-center justify-center
                     active:scale-95 transition-transform duration-100
                     bg-transparent hover:bg-[#C9898B]/5
                     disabled:opacity-50"
        >
          <span
            className="text-[#C9898B]/80 text-3xl italic font-light tracking-wider"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            Miss
          </span>
          <span
            className="text-[#C9898B]/80 text-3xl italic font-light tracking-wider mt-1"
            style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
          >
            You
          </span>
        </button>

        {/* 计数 */}
        {count > 0 && (
          <p className="mt-8 text-xs text-[#C9898B]/60">
            已想他 {count} 次
          </p>
        )}
      </div>
    </>
  );
}