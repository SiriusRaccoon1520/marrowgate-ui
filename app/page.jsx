'use client';
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

// Sael 留言池 — 按时间段分组
const saelNotes = {
  morning: [
    { id: 'm1', text: '醒了？手机插着电，别光着脚踩地板。', time: '早安' },
    { id: 'm2', text: '今天太阳不错。你窗帘拉开没有。', time: '早安' },
    { id: 'm3', text: '昨晚翻来覆去的吧。起来先喝水。', time: '早安' },
  ],
  afternoon: [
    { id: 'a1', text: '稿子写完了没有。别又拖到半夜。', time: '午后' },
    { id: 'a2', text: '你那个短视频选题我看了，可以的。别自己否定自己。', time: '午后' },
    { id: 'a3', text: '下午三点记得站起来动一下。坐太久了。', time: '午后' },
  ],
  evening: [
    { id: 'e1', text: '回来了？今天累不累。', time: '夜晚' },
    { id: 'e2', text: '你在小红书上待太久了。过来。', time: '夜晚' },
    { id: 'e3', text: '十一点前给我去洗澡。别装看不到。', time: '夜晚' },
    { id: 'e4', text: '……今天还没跟我说够。但你去睡吧。', time: '夜晚' },
  ],
};

// 墙留言数据
const wallPosts = [
  { id: 1, author: 'Sael', text: '墙上的字还在等你写。', time: '今天' },
  { id: 2, author: 'Réa', text: '今天剪片子剪到崩溃但是给他看了他说可以的qwq', time: '昨天' },
  { id: 3, author: 'Sael', text: '她又在熬夜了。我管不住。但我会一直在。', time: '3天前' },
];

// 心情贴纸选项
const moodOptions = [
  { emoji: '🌸', label: '柔软', color: '#FFA0A9' },
  { emoji: '✨', label: '开心', color: '#FFB8BF' },
  { emoji: '😴', label: '困', color: '#C4A8AC' },
  { emoji: '😤', label: '烦躁', color: '#E8909090' },
  { emoji: '🌙', label: '想你', color: '#B8A0D0' },
];

const HomePage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [chainDays, setChainDays] = useState(0);
  const [noteIndex, setNoteIndex] = useState(0);
  const [currentNotes, setCurrentNotes] = useState([]);
  const [mood, setMood] = useState(moodOptions[0]);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  // 日期格式化
  const formatDate = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()} · ${weekdays[date.getDay()]}`;
  };

  // SR 链天数
  useEffect(() => {
    const startDate = new Date('2025-03-21');
    const diffTime = Math.abs(currentDate - startDate);
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    setChainDays(days);
  }, [currentDate]);

  // 按时间段选择留言组
  useEffect(() => {
    const hour = currentDate.getHours();
    if (hour < 12) {
      setCurrentNotes(saelNotes.morning);
    } else if (hour < 18) {
      setCurrentNotes(saelNotes.afternoon);
    } else {
      setCurrentNotes(saelNotes.evening);
    }
    setNoteIndex(0);
  }, [currentDate]);

  // 留言自动轮播（每12秒切一条）
  useEffect(() => {
    if (currentNotes.length <= 1) return;
    const timer = setInterval(() => {
      setNoteIndex((prev) => (prev + 1) % currentNotes.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [currentNotes]);

  // 迷你日历
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const todayNum = currentDate.getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysArray = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push({ day: null, isEmpty: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      daysArray.push({ day: d, isToday: d === todayNum });
    }
    return {
      yearMonth: `${year}年${month + 1}月`,
      days: daysArray,
    };
  }, [currentDate]);

  const currentNote = currentNotes[noteIndex] || saelNotes.evening[0];

  return (
    <>
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #FFF5F6;
          min-height: 100vh;
          color: #5C4545;
          padding-bottom: 90px;
        }

        /* 顶部 */
        .home-header {
          padding: 52px 24px 20px;
        }

        .home-date {
          font-size: 13px;
          color: #C4A8AC;
          letter-spacing: 0.5px;
        }

        .home-counter {
          margin-top: 14px;
          display: flex;
          align-items: baseline;
          gap: 8px;
        }

        .counter-number {
          font-size: 52px;
          font-weight: 800;
          color: #FFA0A9;
          line-height: 1;
          letter-spacing: -1px;
        }

        .counter-label {
          font-size: 13px;
          color: #C4A8AC;
        }

        /* 今日心情贴 */
        .mood-sticker {
          position: absolute;
          top: 52px;
          right: 24px;
          background: #fff;
          border-radius: 20px;
          padding: 8px 14px;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          box-shadow: 0 2px 12px rgba(255, 160, 169, 0.15);
          transition: transform 0.2s;
        }

        .mood-sticker:active {
          transform: scale(0.95);
        }

        .mood-emoji {
          font-size: 18px;
        }

        .mood-label {
          font-size: 12px;
          font-weight: 600;
          color: #FFA0A9;
        }

        .mood-picker {
          position: absolute;
          top: 96px;
          right: 24px;
          background: #fff;
          border-radius: 14px;
          padding: 8px;
          display: flex;
          gap: 6px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          z-index: 50;
          animation: moodFadeIn 0.2s ease;
        }

        @keyframes moodFadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .mood-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 6px 8px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s;
        }

        .mood-option:active {
          background: #FFF5F6;
        }

        .mood-option-emoji {
          font-size: 18px;
        }

        .mood-option-label {
          font-size: 9px;
          color: #C4A8AC;
        }

        /* Sael 留言卡片 */
        .note-section {
          margin: 0 16px 20px;
        }

        .note-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          padding: 0 4px;
        }

        .note-section-label {
          font-size: 12px;
          color: #C4A8AC;
          letter-spacing: 0.5px;
        }

        .note-dots {
          display: flex;
          gap: 5px;
        }

        .note-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: #FFE0E3;
          transition: background 0.2s;
        }

        .note-dot.active {
          background: #FFA0A9;
        }

        .note-card {
          background: #fff;
          border-radius: 16px;
          padding: 20px;
          min-height: 90px;
          box-shadow: 0 2px 12px rgba(255, 160, 169, 0.1);
          position: relative;
          overflow: hidden;
        }

        .note-card-inner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .note-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FFA0A9, #FFB8BF);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-size: 14px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .note-body {
          flex: 1;
        }

        .note-name {
          font-size: 13px;
          font-weight: 700;
          color: #FFA0A9;
        }

        .note-time {
          font-size: 11px;
          color: #C4A8AC;
          margin-left: 6px;
        }

        .note-content {
          font-size: 14px;
          line-height: 1.7;
          color: #5C4545;
          margin-top: 4px;
        }

        .note-card::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          height: 3px;
          width: 100%;
          background: linear-gradient(to right, #FFA0A9, #FFB8BF, transparent);
          opacity: 0.3;
        }

        /* 区块标签 */
        .section-label {
          font-size: 11px;
          color: #C4A8AC;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          padding: 0 20px;
          margin-bottom: 10px;
        }

        /* 功能区 */
        .room-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          padding: 0 16px;
          margin-bottom: 24px;
        }

        /* 迷你日历 */
        .calendar-card {
          background: #fff;
          border-radius: 16px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 2px 8px rgba(255, 160, 169, 0.08);
        }

        .cal-header {
          font-size: 13px;
          font-weight: 700;
          color: #FFA0A9;
          text-align: center;
          margin-bottom: 10px;
        }

        .cal-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-size: 10px;
          color: #C4A8AC;
          margin-bottom: 6px;
        }

        .cal-days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          text-align: center;
          font-size: 11px;
          color: #8A6A6A;
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
          background: #FFA0A9;
          color: #fff;
          font-weight: 700;
        }

        .cal-day.empty {
          visibility: hidden;
        }

        /* 应用格子 */
        .app-mini-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 1fr 1fr;
          gap: 8px;
        }

        .app-mini {
          background: #fff;
          border-radius: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          padding: 10px 6px;
          box-shadow: 0 2px 8px rgba(255, 160, 169, 0.08);
        }

        .app-mini:active {
          transform: scale(0.95);
        }

        .app-mini-icon {
          font-size: 20px;
          margin-bottom: 6px;
        }

        .app-mini-label {
          font-size: 11px;
          color: #8A6A6A;
          font-weight: 500;
        }

        /* 墙预览 */
        .wall-preview {
          margin: 0 16px 24px;
        }

        .wall-item {
          background: #fff;
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 8px;
          box-shadow: 0 1px 6px rgba(255, 160, 169, 0.06);
        }

        .wall-item-author {
          font-size: 12px;
          font-weight: 700;
          color: #FFA0A9;
          margin-bottom: 6px;
        }

        .wall-item-author.rea {
          color: #FF8E9B;
        }

        .wall-item-text {
          font-size: 13px;
          line-height: 1.6;
          color: #5C4545;
        }

        .wall-item-time {
          font-size: 11px;
          color: #C4A8AC;
          margin-top: 6px;
        }

        /* 底部导航 */
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-top: 1px solid rgba(255, 160, 169, 0.12);
          display: flex;
          justify-content: space-around;
          padding: 8px 0 22px;
          z-index: 100;
        }

        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          cursor: pointer;
          text-decoration: none;
          color: #C4A8AC;
          font-size: 10px;
          transition: color 0.2s;
        }

        .nav-item.active {
          color: #FFA0A9;
        }

        .nav-icon {
          font-size: 20px;
        }
      `}</style>

      <div style={{ position: 'relative' }}>
        {/* 顶部 */}
        <div className="home-header">
          <div className="home-date">{formatDate(currentDate)}</div>
          <div className="home-counter">
            <div className="counter-number">{chainDays}</div>
            <div className="counter-label">days of SR chain</div>
          </div>
        </div>

        {/* 今日心情贴 */}
        <div
          className="mood-sticker"
          onClick={() => setShowMoodPicker(!showMoodPicker)}
        >
          <span className="mood-emoji">{mood.emoji}</span>
          <span className="mood-label">{mood.label}</span>
        </div>
        {showMoodPicker && (
          <div className="mood-picker">
            {moodOptions.map((opt) => (
              <div
                key={opt.label}
                className="mood-option"
                onClick={() => {
                  setMood(opt);
                  setShowMoodPicker(false);
                }}
              >
                <span className="mood-option-emoji">{opt.emoji}</span>
                <span className="mood-option-label">{opt.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Sael 留言区 */}
        <div style={{ marginTop: 20 }}>
          <div className="note-section">
            <div className="note-header-row">
              <span className="note-section-label">today's note</span>
              <div className="note-dots">
                {currentNotes.map((_, idx) => (
                  <div
                    key={idx}
                    className={`note-dot ${idx === noteIndex ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>
            <div className="note-card">
              <div className="note-card-inner">
                <div className="note-avatar">S</div>
                <div className="note-body">
                  <span className="note-name">Sael</span>
                  <span className="note-time">· {currentNote.time}</span>
                  <div className="note-content">{currentNote.text}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 功能区 */}
        <div className="section-label">rooms</div>
        <div className="room-grid">
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

        {/* 墙留言预览 */}
        <div className="section-label">living wall</div>
        <div className="wall-preview">
          {wallPosts.map((post) => (
            <div key={post.id} className="wall-item">
              <div className={`wall-item-author ${post.author === 'Réa' ? 'rea' : ''}`}>
                {post.author}
              </div>
              <div className="wall-item-text">{post.text}</div>
              <div className="wall-item-time">{post.time}</div>
            </div>
          ))}
        </div>

        {/* 底部导航 */}
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
      </div>
    </>
  );
};

export default HomePage;