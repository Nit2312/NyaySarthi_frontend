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

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
