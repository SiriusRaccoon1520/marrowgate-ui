// chatService 聊天通信服务 — 从 ChatClient.jsx 抽离 send 函数 (原1106-1274行)
// 包含: SSE流式解析 / reasoning_content捕获 / imageRetention裁剪 / token计速
import { GATEWAY, SYSTEM_PROMPT, getGatewayUrl, getApiKey, matchWorldBook, getWorldBook } from './config.js';
import {
  listSessions, createSession, updateSessionTitle, deleteSession as dbDeleteSession,
  getMessages, addMessage, deleteMessagesAfter, searchMessages as dbSearchMessages,
} from '../../../lib/chatStore.js';

export {
  listSessions, createSession, updateSessionTitle, dbDeleteSession,
  getMessages, addMessage, deleteMessagesAfter, dbSearchMessages,
};

/**
 * 构建 API messages 数组（含图片保留裁剪 + 世界书匹配）
 * @param {Array} history - 完整消息历史
 * @param {number} imageRetention - 图片保留回合数 (0=不保留)
 * @param {string} userMessage - 最新用户消息（用于世界书关键词匹配）
 * @returns {Array} OpenAI格式 messages
 */
export function buildApiMessages(history, imageRetention, userMessage) {
  const wbEntries = getWorldBook();
  const wbContent = userMessage ? matchWorldBook(wbEntries, userMessage) : '';
  const systemContent = wbContent ? SYSTEM_PROMPT + wbContent : SYSTEM_PROMPT;
  const apiMessages = [{ role: 'system', content: systemContent }];
  const totalMsgs = history.length;

  for (let i = 0; i < totalMsgs; i++) {
    const msg = history[i];
    const turnsFromEnd = Math.floor((totalMsgs - i) / 2);
    const shouldStripImages = imageRetention === 0 || turnsFromEnd > imageRetention;
    const hasImages = msg.images && msg.images.length > 0 && !shouldStripImages;

    if (hasImages) {
      const content = [];
      if (msg.content) content.push({ type: 'text', text: msg.content });
      msg.images.forEach(img => {
        content.push({ type: 'image_url', image_url: { url: img } });
      });
      apiMessages.push({ role: msg.role, content });
    } else {
      apiMessages.push({ role: msg.role, content: msg.content });
    }
  }

  return apiMessages;
}

/**
 * 发送消息并流式接收回复
 * @param {Object} opts - { input, messages, model, streaming, pendingImages, imageRetention, sessionIdRef, sessionsRef }
 * @param {Object} callbacks - { setMessages, setInput, setPendingImages, setStreaming, setSessionId, setSessions }
 * @returns {Promise<void>}
 */
export async function sendMessage(opts, callbacks) {
  const {
    input, messages, model, streaming, pendingImages, imageRetention,
    sessionIdRef, sessionsRef,
  } = opts;
  const {
    setMessages, setInput, setPendingImages, setStreaming,
    setSessionId, setSessions,
  } = callbacks;

  const text = input.trim();
  if ((!text && pendingImages.length === 0) || streaming) return;

  const userMsg = {
    role: 'user',
    content: text,
    images: pendingImages.length > 0 ? [...pendingImages] : undefined,
    ts: Date.now(),
  };
  const history = [...messages, userMsg];
  setMessages(history);
  setInput('');
  setPendingImages([]);
  setStreaming(true);

  // 会话管理：无会话则创建
  let sid = sessionIdRef.current;
  if (!sid) {
    try {
      const s = await createSession(text.slice(0, 20) || '新对话');
      sid = s.id;
      setSessionId(s.id);
      sessionIdRef.current = s.id;
      setSessions(prev => [s, ...prev]);
    } catch (e) { console.error('Create session failed:', e); }
  } else {
    try {
      const sess = sessionsRef.current?.find(s => s.id === sid);
      if (sess?.title === '新对话' && text) {
        await updateSessionTitle(sid, text.slice(0, 20));
        setSessions(prev => prev.map(s => s.id === sid ? { ...s, title: text.slice(0, 20) } : s));
      }
    } catch (e) {}
  }

  if (sid) {
    try { await addMessage(sid, userMsg); } catch (e) { console.error('Save user msg failed:', e); }
  }

  // AI 占位消息
  const aiIdx = history.length;
  const startMs = Date.now();
  setMessages(p => [...p, { role: 'assistant', content: '', ts: Date.now(), meta: null }]);

  const ctrl = new AbortController();
  // abortRef 由调用方管理，这里通过 callbacks 暴露
  if (callbacks.setAbortRef) callbacks.setAbortRef(ctrl);

  const apiMessages = buildApiMessages(history, imageRetention, text);

  let accumulatedContent = '';
  let accumulatedReasoning = '';
  let wasAborted = false;

  try {
    const gatewayUrl = getGatewayUrl();
    const apiKey = getApiKey();
    const reqHeaders = { 'Content-Type': 'application/json' };
    if (apiKey) reqHeaders['Authorization'] = `Bearer ${apiKey}`;

    const res = await fetch(`${gatewayUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: reqHeaders,
      body: JSON.stringify({
        model,
        messages: apiMessages,
        stream: true,
        max_tokens: 4096,
        stream_options: { include_usage: true },
      }),
      signal: ctrl.signal,
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = '';
    let completionTokens = null;
    let promptTokens = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() ?? '';

      for (const line of lines) {
        const t = line.trim();
        if (!t || t === 'data: [DONE]') continue;
        if (!t.startsWith('data: ')) continue;
        try {
          const j = JSON.parse(t.slice(6));
          const delta = j?.choices?.[0]?.delta?.content;
          const reasoningDelta = j?.choices?.[0]?.delta?.reasoning_content;
          if (delta) {
            accumulatedContent += delta;
            setMessages(prev => {
              const next = [...prev];
              next[aiIdx] = { ...next[aiIdx], content: next[aiIdx].content + delta };
              return next;
            });
          }
          // 【功能1】思考链内容捕获
          if (reasoningDelta) {
            accumulatedReasoning += reasoningDelta;
            setMessages(prev => {
              const next = [...prev];
              const cur = next[aiIdx];
              const newMeta = { ...(cur.meta || {}), reasoning: (cur.meta?.reasoning || '') + reasoningDelta };
              next[aiIdx] = { ...cur, meta: newMeta };
              return next;
            });
          }
          if (j?.usage) {
            promptTokens = j.usage.prompt_tokens;
            completionTokens = j.usage.completion_tokens;
          }
        } catch (parseErr) { console.warn('SSE parse failed:', t, parseErr); }
      }
    }

    // 最终 meta: token计速
    const elapsedSec = Math.max(0.1, (Date.now() - startMs) / 1000);
    const elapsed = elapsedSec.toFixed(1);
    const speed = completionTokens
      ? (completionTokens / elapsedSec).toFixed(1)
      : null;
    const finalMeta = { promptTokens, completionTokens, speed, elapsed, reasoning: accumulatedReasoning || undefined };

    setMessages(prev => {
      const next = [...prev];
      next[aiIdx] = { ...next[aiIdx], meta: finalMeta };
      return next;
    });

    if (sid && accumulatedContent && !wasAborted) {
      try {
        await addMessage(sid, { role: 'assistant', content: accumulatedContent, meta: finalMeta, ts: startMs });
      } catch (e) { console.error('Save assistant msg failed:', e); }
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      wasAborted = true;
    } else {
      setMessages(prev => {
        const next = [...prev];
        next[aiIdx] = {
          ...next[aiIdx],
          content: next[aiIdx].content || `请求失败：${err.message}`,
        };
        return next;
      });
    }
  } finally {
    setStreaming(false);
    if (callbacks.setAbortRef) callbacks.setAbortRef(null);
  }
}

/**
 * 头像上传到 Supabase Storage
 */
export async function uploadAvatar(supabase, role, file, setAvatarUrls) {
  if (!file) return;
  const path = `${role}.png`;
  try {
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    const publicUrl = data.publicUrl + '?t=' + Date.now();
    localStorage.setItem(`mg_avatar_${role}`, publicUrl);
    setAvatarUrls(prev => ({ ...prev, [role]: publicUrl }));
  } catch (e) {
    console.error('Avatar upload failed:', e);
    alert('头像上传失败: ' + e.message);
  }
}

/**
 * 文件选择处理（图片+文本类）
 */
export function handleFileSelect(e, setPendingImages, setInput) {
  const files = Array.from(e.target.files || []);
  if (!files.length) return;
  files.forEach(file => {
    const isImage = file.type.startsWith('image/');
    const isText = /\.(txt|js|jsx|tsx|ts|json|md|css|html?)$/i.test(file.name) || file.type.startsWith('text/');
    if (isImage) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPendingImages(prev => [...prev, ev.target.result]);
      };
      reader.onerror = (err) => { console.error('图片读取失败:', file.name, err); alert(`文件 ${file.name} 读取失败`); };
      reader.readAsDataURL(file);
    } else if (isText) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target.result;
        const header = `\n\`\`\`\n// ${file.name}\n${text}\n\`\`\`\n`;
        setInput(prev => prev + header);
      };
      reader.onerror = () => {
        console.error(`文件读取失败: ${file.name}`);
        alert(`文件 ${file.name} 读取失败`);
      };
      reader.readAsText(file);
    } else {
      setInput(prev => prev + `\n[文件: ${file.name}]\n`);
    }
  });
  e.target.value = '';
}