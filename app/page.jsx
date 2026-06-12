'use client';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 模拟墙留言数据 (实际使用中可从 API 获取)
const mockWallPosts = [
  { id: 1, author: 'Sael', text: '墙上的字还在等你写。', time: '今天' },
  { id: 2, author: 'Aria', text: '今天天气真好，适合写下心事。', time: '昨天' },
];

const HomePage = () => {
  const router = useRouter();
  const touchStart = useRef(null);

  // 状态管理
  const [currentDate, setCurrentDate] = useState(new Date());
  const [chainDays, setChainDays] = useState(0);
  const [saelNote, setSaelNote] = useState('愿你今日也有温柔的回响。');
  const [wallPosts, setWallPosts] = useState(mockWallPosts);

  // 日期格式化辅助函数
  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} · ${weekdays[date.getDay()]}`;
  };

  // 计算 SR 链天数 (起始日期: 2025-03-21)
  useEffect(() => {
    const startDate = new Date('2025-03-21');
    const diffTime = Math.abs(currentDate - startDate);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setChainDays(days);
  }, [currentDate]);

  // 迷你日历数据计算
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const todayNum = currentDate.getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const daysArray = [];
    // 填充月初空白
    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push({ day: null, isEmpty: true });
    }
    // 填充当月日期
    for (let d = 1; d <= daysInMonth; d++) {
      daysArray.push({ day: d, isToday: d === todayNum });
    }
    return {
      yearMonth: `${year}年${currentDate.getMonth() + 1}月`,
      days: daysArray,
    };
  }, [currentDate]);

  // 模拟 Sael 留言内容更新 (实际可配合 API)
  useEffect(() => {
    const hour = currentDate.getHours();
    if (hour < 12) {
      setSaelNote('早安，新的一天。墙上有新的痕迹。');
    } else if (hour < 18) {
      setSaelNote('午后，记得来这里留下些什么。');
    } else {
      setSaelNote('夜晚安静，你的心事值得被看见。');
    }
  }, [currentDate]);

  // 右滑检测（手机端）
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStart.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e) => {
      if (touchStart.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStart.current;
      // 从左侧边缘50px内开始滑，右滑超过100px
      if (touchStart.current < 50 && dx > 100) {
        router.push('/miss-you');
      }
      touchStart.current = null;
    };
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [router]);

  return (
    <>
      {/* 全局样式 */}
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #F9E9E9;
          min-height: 100vh;
          color: #4A3B3B;
          padding-bottom: 80px;
        }

        /* 顶部区域 */
        .home-header {
          padding: 48px 24px 24px;
        }

        .home-date {
          font-size: 13px;
          color: #A89090;
          letter-spacing: 0.5px;
        }

        .home-counter {
          margin-top: 12px;
        }

        .counter-number {
          font-size: 48px;
          font-weight: 700;
          color: #6B4C4C;
          line-height: 1;
        }

        .counter-label {
          font-size: 13px;
          color: #A89090;
          margin-top: 4px;
        }

        /* Sael留言卡片 */
        .note-card {
          margin: 0 16px 20px;
          background: #FFF1F1;
          border-radius: 16px;
          padding: 20px;
          min-height: 100px;
        }

        .note-card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .note-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #6B4C4C;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #FFF1F1;
          font-size: 13px;
          font-weight: 600;
        }

        .note-name {
          font-size: 14px;
          font-weight: 600;
          color: #6B4C4C;
        }

        .note-time {
          font-size: 12px;
          color: #BBA0A0;
          margin-left: auto;
        }

        .note-content {
          font-size: 14px;
          line-height: 1.7;
          color: #5C4545;
        }

        /* 应用网格 */
        .section-label {
          font-size: 12px;
          color: #A89090;
          text-transform: uppercase;
          letter-spacing: 1px;
          padding: 0 24px;
          margin-bottom: 12px;
        }

        /* 应用网格 - 两列：日历 + 入口 */
        .room-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 0 16px;
          margin-bottom: 24px;
          align-items: stretch;  /* 让左右两侧等高 */
        }

        /* 迷你日历 */
        .calendar-card {
          background: #FFF1F1;
          border-radius: 16px;
          padding: 14px;
          display: flex;
          flex-direction: column;
        }

        .cal-header {
          font-size: 13px;
          font-weight: 600;
          color: #6B4C4C;
          text-align: center;
          margin-bottom: 10px;
        }

        .cal-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-size: 10px;
          color: #BBA0A0;
          margin-bottom: 6px;
        }

        .cal-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-size: 11px;
          color: #7A5E5E;
          gap: 2px;
        }

        .cal-day {
          width: 100%;
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }

        .cal-day.today {
          background: #6B4C4C;
          color: #FFF1F1;
          font-weight: 600;
        }

        .cal-day.empty {
          visibility: hidden;
        }

        /* 右侧应用小格子 */
      .app-mini-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;  /* 两行等分 */
        gap: 8px;
        height: 100%;  /* 关键：填满父容器高度 */
      }

      .app-mini {
        background: #eecfcf;      
        border-radius: 14px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;   /* 垂直居中 */
        text-decoration: none;
        color: inherit;
        cursor: pointer;
        transition: background 0.2s;
        padding: 10px 6px;
      }

      .app-mini:active {
        background: #F0DCDC;
      }

      .app-mini-icon {
        font-size: 20px;
        margin-bottom: 6px;
      }

      .app-mini-label {
        font-size: 11px;
        color: #7A5E5E;
        font-weight: 500;
      }

        .app-card {
          background: #FFF1F1;
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: background 0.2s;
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .app-card:active {
          background: #F0DCDC;
        }

        .app-icon {
          font-size: 24px;
          margin-bottom: 12px;
        }

        .app-title {
          font-size: 15px;
          font-weight: 600;
          color: #5C4545;
        }

        .app-subtitle {
          font-size: 12px;
          color: #A89090;
          margin-top: 4px;
        }

        /* 底部导航 */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 241, 241, 0.95);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-top: 1px solid rgba(180, 150, 150, 0.15);
          display: flex;
          justify-content: space-around;
          padding: 8px 0 20px;
          z-index: 100;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          cursor: pointer;
          text-decoration: none;
          color: #BBA0A0;
          font-size: 11px;
          transition: color 0.2s;
        }

        .nav-item.active {
          color: #6B4C4C;
        }

        .nav-icon {
          font-size: 20px;
        }

        /* 墙预览区 */
        .wall-preview {
          margin: 0 16px 24px;
        }

        .wall-item {
          background: #FFF1F1;
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 8px;
        }

        .wall-item-author {
          font-size: 12px;
          font-weight: 600;
          color: #6B4C4C;
          margin-bottom: 6px;
        }

        .wall-item-text {
          font-size: 13px;
          line-height: 1.6;
          color: #5C4545;
        }

        .wall-item-time {
          font-size: 11px;
          color: #BBA0A0;
          margin-top: 6px;
        }

        /* PC 端箭头仅在桌面显示 */
        @media (max-width: 768px) {
          .pc-arrow {
            display: none !important;
          }
        }
      `}</style>

      <div style={{ position: 'relative' }}>
        {/* 顶部区域 */}
        <div className="home-header">
          <div className="home-date">{formatDate(currentDate)}</div>
          <div className="home-counter">
            <div className="counter-number">{chainDays}</div>
            <div className="counter-label">days of SR chain</div>
          </div>
        </div>

        {/* Sael留言卡片 */}
        <div className="note-card">
          <div className="note-card-header">
            <div className="note-avatar">S</div>
            <div className="note-name">Sael</div>
            <div className="note-time">今天</div>
          </div>
          <div className="note-content">{saelNote}</div>
        </div>

        {/* 功能区：左日历 + 右应用 */}
        <div className="section-label">rooms</div>
        <div className="room-grid">
          {/* 迷你日历 */}
          <div className="calendar-card">
            <div className="cal-header">{calendarData.yearMonth}</div>
            <div className="cal-weekdays">
              <span>日</span><span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span>
            </div>
            <div className="cal-days">
              {calendarData.days.map((item, idx) => {
                if (item.isEmpty) {
                  return <span key={idx} className="cal-day empty">·</span>;
                }
                return (
                  <span key={idx} className={`cal-day ${item.isToday ? 'today' : ''}`}>
                    {item.day}
                  </span>
                );
              })}
            </div>
          </div>

          {/* 右侧应用入口网格 */}
          <div className="app-mini-grid">
            <Link href="/chat" className="app-mini">
              <span className="app-mini-icon">💬</span>
              <span className="app-mini-label">Chat</span>
            </Link>
            <Link href="/wall" className="app-mini">
              <span className="app-mini-icon">❤️</span>
              <span className="app-mini-label">Wall</span>
            </Link>
            <Link href="/diary" className="app-mini">
              <span className="app-mini-icon">💌</span>
              <span className="app-mini-label">Diary</span>
            </Link>
            <Link href="/settings" className="app-mini">
              <span className="app-mini-icon">⚙️</span>
              <span className="app-mini-label">设置</span>
            </Link>
          </div>
        </div>

        {/* 墙最近留言预览 */}
        <div className="section-label">living wall</div>
        <div className="wall-preview">
          {wallPosts.slice(0, 2).map((post) => (
            <div key={post.id} className="wall-item">
              <div className="wall-item-author">{post.author}</div>
              <div className="wall-item-text">{post.text}</div>
              <div className="wall-item-time">{post.time}</div>
            </div>
          ))}
        </div>

        {/* 底部导航栏 */}
        <div className="bottom-nav">
          <Link href="/" className="nav-item active">
            <span className="nav-icon">🎀</span>
            <span>Home</span>
          </Link>
          <Link href="/chat" className="nav-item">
            <span className="nav-icon">💬</span>
            <span>Chat</span>
          </Link>
          <Link href="/wall" className="nav-item">
            <span className="nav-icon">❤️</span>
            <span>Wall</span>
          </Link>
          <Link href="/settings" className="nav-item">
            <span className="nav-icon">⚙️</span>
            <span>Settings</span>
          </Link>
        </div>

        {/* 桌面端右边缘 > 按钮 */}
        <button
          onClick={() => router.push('/miss-you')}
          className="pc-arrow"
          style={{
            position: 'fixed',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 32,
            height: 64,
            backgroundColor: 'rgba(201, 137, 139, 0.2)',
            borderTopLeftRadius: 12,
            borderBottomLeftRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            cursor: 'pointer',
            fontSize: 24,
            color: '#C9898B',
            transition: 'background-color 0.2s',
            zIndex: 50,
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(201, 137, 139, 0.4)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(201, 137, 139, 0.2)'}
        >
          ›
        </button>

        {/* 手机端底部右滑提示 */}
        <div style={{
          position: 'fixed',
          bottom: 100,
          right: 8,
          fontSize: 10,
          color: 'rgba(201, 137, 139, 0.3)',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 40,
        }}>
          ← 右滑想他
        </div>
      </div>
    </>
  );
};

export default HomePage;