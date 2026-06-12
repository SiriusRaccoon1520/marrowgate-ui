import supabase from './supabase'

// ── 会话管理 ──

export async function listSessions() {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('id, title, created_at, updated_at')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createSession(title = '新对话') {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({ title })
    .select()
    .single()
  if (error) throw error
  return data
}

// 更新会话标题
export async function updateSessionTitle(sessionId, title) {
  const { error } = await supabase
    .from('chat_sessions')
    .update({ title })
    .eq('id', sessionId);

  if (error) throw error;
}

// 删除会话
export async function deleteSession(sessionId) {
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('id', sessionId);

  if (error) throw error;
}

// ── 消息管理 ──

export async function getMessages(sessionId) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('ts', { ascending: true })
  if (error) throw error
  return data.map(m => ({
    id: m.id,
    role: m.role,
    content: m.content,
    images: m.images || undefined,
    meta: m.meta || null,
    ts: m.ts,
  }))
}

export async function addMessage(sessionId, msg) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      role: msg.role,
      content: msg.content,
      images: msg.images || null,
      meta: msg.meta || null,
      ts: msg.ts,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateMessage(messageId, updates) {
  const { error } = await supabase
    .from('chat_messages')
    .update(updates)
    .eq('id', messageId)
  if (error) throw error
}

// ── 关键词搜索 ──

export async function searchMessages(keyword) {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, session_id, role, content, ts, chat_sessions(title)')
    .ilike('content', `%${keyword}%`)
    .order('ts', { ascending: false })
    .limit(50)
  if (error) throw error
  return data
}

// ── 导入（Rikkahub等旧数据） ──

export async function importMessages(messages) {
  // messages: [{ role, content, ts, ... }]
  // 自动创建session并把消息灌进去
  const session = await createSession('导入记录')
  const rows = messages.map(m => ({
    session_id: session.id,
    role: m.role,
    content: m.content || '',
    images: m.images || null,
    meta: m.meta || null,
    ts: m.ts || Date.now(),
  }))
  const { data, error } = await supabase
    .from('chat_messages')
    .insert(rows)
    .select()
  if (error) throw error
  return { session, count: data.length }
}