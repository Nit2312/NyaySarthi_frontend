import { supabase } from './supabase'

export type ChatRole = 'user' | 'ai'

export async function upsertConversation(title: string, id?: string): Promise<string> {
  if (id) {
    const { error } = await supabase
      .from('conversations')
      .update({ title, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    return id
  }
  const { data, error } = await supabase
    .from('conversations')
    .insert({ title })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}

export async function listConversations(limit = 50) {
  const { data, error } = await supabase
    .from('conversations')
    .select('id,title,updated_at')
    .order('updated_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function getMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('id,role,content,created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function appendMessage(conversationId: string, role: ChatRole, content: string) {
  const { error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, role, content })
  if (error) throw error

  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId)
}

export async function deleteConversation(conversationId: string) {
  // Delete messages first to ensure no orphans if FK constraints are missing
  const { error: msgErr } = await supabase
    .from('messages')
    .delete()
    .eq('conversation_id', conversationId)
  if (msgErr) throw msgErr

  const { error: convErr } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId)
  if (convErr) throw convErr
}
