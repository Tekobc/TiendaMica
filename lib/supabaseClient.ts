// lib/supabaseClient.ts
import { createBrowserSupabaseClient, createServerSupabaseClient } from '@supabase/ssr';
import type { Database } from '@/lib/database.types'; // optional: define your DB schema

// Browser (client‑side) Supabase instance – uses NEXT_PUBLIC_ variables automatically
export const supabase = createBrowserSupabaseClient<Database>();

// Helper for Server‑Side Rendering / API routes
export const getServerSupabase = (request: Request) =>
  createServerSupabaseClient<Database>({ request });
