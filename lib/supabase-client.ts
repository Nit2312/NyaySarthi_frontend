import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase configuration is missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file.\n' +
    'You can find these values in your Supabase project settings under Project Settings > API.\n' +
    'Make sure to copy .env.example to .env and fill in the values.'
  )
}

// configure auth options to avoid automatic refresh attempts when a refresh token
// is not available (this prevents `Invalid Refresh Token: Refresh Token Not Found` errors
// originating from the library in environments where localStorage isn't populated yet)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // don't try to automatically refresh tokens without an explicit session
    autoRefreshToken: false,
    // still persist session to storage when present
    persistSession: true,
    // avoid detecting session params in URL (we handle sign-in flows explicitly)
    detectSessionInUrl: false,
  },
})
