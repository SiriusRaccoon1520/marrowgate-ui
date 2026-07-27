// useChatState — 从 ChatClient.jsx 抽离全部状态+逻辑 (原876-1282行)
import { useState, useRef, useEffect, useCallback } from 'react';
import supabase from '../../../lib/supabase.js';
import { THEMES, MODELS } from '../lib/config.js';
import { useIsMobile } from './useIsMobile.js';
import {
  sendMessage, uploadAvatar, handleFileSelect,
  listSessions, createSession, getMessages, addMessage,
  deleteMessagesAfter, updateSessionTitle,
  dbDeleteSession,
  dbSearchMessages,
} from '../lib/chatService.js';

export function useChatState() {
  // === 状态 ===
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState('GLM-5.1');
  const [streaming, setStreaming] = useState(false);
  const [themeId, setThemeId] = useState('sakura');
  const [bubbleStyle, setBubbleStyle] = useState('liquidGlass');
  const [bgImage, setBgImage] = useState(null);
  const [pendingImages, setPendingImages] = useState([]);

  const [sessionId, setSessionId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showAvatar, setShowAvatar] = useState(false);
  const [showNickname, setShowNickname] = useState(false);
  const [showSessionList, setShowSessionList] = useState(false);

  // 【功能5】字体大小调节 (12-22px, 默认15)
  const [fontSize, setFontSize] = useState(() => {
    if (typeof window === 'undefined') return 15;
    const saved = localStorage.getItem('marrowgate_chat_fontsize');
    const n = saved ? parseInt(saved) : 15;
    return Math.min(22, Math.max(12, n));
  });

  // 【功能7】历史图片保留回合数 (0-50, 默认10)
  const [imageRetention, setImageRetention] = useState(() => {
    if (typeof window === 'undefined') return 10;
    const saved = localStorage.getItem('marrowgate_image_retention');
    const n = saved ? parseInt(saved) : 10;
    return Math.min(50, Math.max(0, n));
  });

  // 【功能6】自定义头像URL
  const [avatarUrls, setAvatarUrls] = useState(() => {
    if (typeof window === 'undefined') return { sael: '', rea: '' };
    const sael = localStorage.getItem('mg_avatar_sael') || '';
    const rea = localStorage.getItem('mg_avatar_rea') || '';
    return { sael, rea };
  });

  // === Refs ===
  const isMobile = useIsMobile();
  const bottomRef = useRef(null);
  const taRef = useRef(null);
  const abortRef = useRef(null);
  const fileInputRef = useRef(null);
  const scrollRef = useRef(null);
  const sessionIdRef = useRef(null);
  const sessionsRef = useRef([]);
  const isComposingRef = useRef(false); // 【功能3】中文输入法防抖

  const theme = THEMES[themeId];
  const currentModelLabel = MODELS.find(m => m.id === model)?.label ?? model;

  // === Ref 同步 ===
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);
  useEffect(() => { sessionsRef.current = sessions; }, [sessions]);

  const scrollToTop = () => { scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); };
  const scrollToBottom = () => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  // === 初始化 ===
  useEffect(() => {
    const savedTheme = localStorage.getItem('mg_theme');
    const savedBubble = localStorage.getItem('mg_bubble');
    const savedBg = localStorage.getItem('mg_bg');
    if (savedTheme && THEMES[savedTheme]) setThemeId(savedTheme);
    if (savedBubble && THEMES[savedBubble]) setBubbleStyle(savedBubble);
    if (savedBg) setBgImage(savedBg);

    const sa = localStorage.getItem('mg_show_avatar');
    const sn = localStorage.getItem('mg_show_nickname');
    if (sa !== null) setShowAvatar(sa === 'true');
    if (sn !== null) setShowNickname(sn === 'true');

    listSessions().then(s => {
      setSessions(s);
      if (s.length > 0) switchToSession(s[0].id);
    }).catch(e => console.error('Load sessions failed:', e));
  }, []);

  const switchToSession = async (id) => {
    setSessionId(id);
    sessionIdRef.current = id;
    setShowSessionList(false);
    try {
      const msgs = await getMessages(id);
      setMessages(msgs);
    } catch (e) { console.error('Load messages failed:', e); }
  };

  const handleDeleteSession = async (id, e) => {
    e.stopPropagation();
    try {
      await dbDeleteSession(id);
      const remaining = sessionsRef.current.filter(s => s.id !== id);
      setSessions(remaining);
      if (sessionIdRef.current === id) {
        if (remaining.length > 0) {
          switchToSession(remaining[0].id);
        } else {
          setSessionId(null);
          setMessages([]);
        }
      }
    } catch (e2) { console.error('Delete failed:', e2); }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const results = await dbSearchMessages(searchQuery);
      setSearchResults(results);
    } catch (e) { console.error('Search failed:', e); }
  };

  const jumpToMessage = async (sid, msgTs) => {
    await switchToSession(sid);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    setTimeout(() => {
      const el = document.querySelector(`[data-ts="${msgTs}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (el?.style) {
        el.style.background = `${theme.accent}30`;
        setTimeout(() => { if (el?.style) el.style.background = ''; }, 2000);
      }
    }, 300);
  };

  // 持久化主题/气泡
  useEffect(() => {
    localStorage.setItem('mg_theme', themeId);
    localStorage.setItem('mg_bubble', bubbleStyle);
  }, [themeId, bubbleStyle]);

  // 自动滚到底
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingImages]);

  // textarea 自动高度
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
  }, [input]);

  // === 文件处理 ===
  const onFileSelect = (e) => handleFileSelect(e, setPendingImages, setInput);
  const removePendingImage = (idx) => setPendingImages(prev => prev.filter((_, i) => i !== idx));

  // 【功能2】编辑消息
  const handleEditMessage = async (msg) => {
    setInput(msg.content || '');
    setMessages(prev => prev.filter(m => m.ts < msg.ts));
    if (sessionIdRef.current) {
      try { await deleteMessagesAfter(sessionIdRef.current, msg.ts); } catch (e) { console.error('Delete after failed:', e); }
    }
    setPendingImages(msg.images || []);
    taRef.current?.focus();
  };

  // 【功能6】头像上传
  const handleAvatarUpload = async (role, file) => {
    await uploadAvatar(supabase, role, file, setAvatarUrls);
  };

  const handleNewChat = async () => {
    try {
      const s = await createSession();
      setSessions(prev => [s, ...prev]);
      setSessionId(s.id);
      sessionIdRef.current = s.id;
    } catch (e) {
      console.error('Create session failed:', e);
    }
    setMessages([]);
    setPendingImages([]);
    setInput('');
    setShowSessionList(false);
  };

  const goHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  // === send ===
  const send = useCallback(() => {
    sendMessage(
      {
        input, messages, model, streaming, pendingImages, imageRetention,
        sessionIdRef, sessionsRef,
      },
      {
        setMessages, setInput, setPendingImages, setStreaming,
        setSessionId, setSessions,
        setAbortRef: (ctrl) => { abortRef.current = ctrl; },
      }
    );
  }, [input, messages, model, streaming, pendingImages, imageRetention]);

  // 【功能3】输入法修复
  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposingRef.current) { e.preventDefault(); send(); }
  };
  const onCompositionStart = () => { isComposingRef.current = true; };
  const onCompositionEnd = () => { isComposingRef.current = false; };

  return {
    // state
    messages, input, setInput, model, setModel, streaming,
    themeId, setThemeId, bubbleStyle, setBubbleStyle,
    bgImage, setBgImage, pendingImages, setPendingImages,
    sessionId, sessions, showSearch, setShowSearch,
    searchQuery, setSearchQuery, searchResults,
    showAvatar, setShowAvatar, showNickname, setShowNickname,
    showSessionList, setShowSessionList,
    fontSize, setFontSize, imageRetention, setImageRetention,
    avatarUrls,
    // derived
    theme, currentModelLabel, isMobile,
    // refs
    bottomRef, taRef, abortRef, fileInputRef, scrollRef,
    // handlers
    send, onKey, onCompositionStart, onCompositionEnd,
    switchToSession, handleDeleteSession, handleSearch, jumpToMessage,
    onFileSelect, removePendingImage, handleEditMessage,
    handleAvatarUpload, handleNewChat, goHome,
    scrollToTop, scrollToBottom,
  };
}

export default useChatState;