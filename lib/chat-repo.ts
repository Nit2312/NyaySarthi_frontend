import { supabase } from './supabase'

export type ChatRole = 'user' | 'ai'

export async function upsertConversation(title: string, id: string | undefined, userId: string | null | undefined): Promise<string> {
  if (!userId) throw new Error('Missing userId')
  if (id) {
    const { error } = await supabase
      .from('conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
    if (error) throw error
    return id
  }
  const { data, error } = await supabase
    .from('conversations')
    .insert({ title, user_id: userId })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function listConversations(userId: string, limit = 50) {
  const { data, error } = await supabase
    .from('conversations')
    .select('id,title,updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function listActiveConversations(userId: string, limit = 100) {
  // First, fetch conversations for this user
  const { data: convs, error: convErr } = await supabase
    .from('conversations')
    .select('id,title,updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit)
  if (convErr) throw convErr
  const ids = (convs || []).map((c: any) => c.id)
  if (ids.length === 0) return []
  // Then, find which of those have at least one message
  const { data: msgs, error: msgErr } = await supabase
    .from('messages')
    .select('conversation_id')
    .in('conversation_id', ids)
  if (msgErr) throw msgErr
  const active = new Set((msgs || []).map((m: any) => m.conversation_id))
  return (convs || []).filter((c: any) => active.has(c.id))
}

export async function getMessages(conversationId: string, userId: string) {
  // Ensure conversation belongs to user
  const { data: conv, error: convErr } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .maybeSingle()
  if (convErr) throw convErr
  if (!conv) return []
  const { data, error } = await supabase
    .from('messages')
    .select('id,role,content,created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function appendMessage(conversationId: string, role: ChatRole, content: string, userId: string) {
  // ensure ownership by touching the conversation row with user guard
  const { error: touchErr } = await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)
    .eq('user_id', userId)
  if (touchErr) throw touchErr
  const { error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, role, content })
  if (error) throw error
}

export async function deleteConversation(conversationId: string, userId: string) {
  // Guard: ensure the conversation belongs to user
  const { data: conv, error: convErr1 } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .maybeSingle()
  if (convErr1) throw convErr1
  if (!conv) return
  // Delete messages first (if no ON DELETE CASCADE)
  const { error: msgErr } = await supabase
    .from('messages')
    .delete()
    .eq('conversation_id', conversationId)
  if (msgErr) throw msgErr
  // Delete conversation row
  const { error: convErr } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)
    .eq('user_id', userId)
  if (convErr) throw convErr
}
