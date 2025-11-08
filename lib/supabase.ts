import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!url || !anon) {
  // It's okay if envs are missing; callers should handle fallback
  // Do not throw to avoid breaking the app in non-configured environments
}

export const supabase = createClient(url || 'http://localhost', anon || 'public-anon-key')
