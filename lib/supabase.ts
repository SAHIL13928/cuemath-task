import { createClient } from "@supabase/supabase-js";
import {
  createBrowserClient as _createBrowserClient,
  createServerClient as _createServerClient,
} from "@supabase/auth-helpers-nextjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser client for use in client components.
 */
export function createBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return _createBrowserClient(url, key);
}

/**
 * Server client for use in API routes / server components.
 * Requires cookie store from next/headers.
 */
export function createServerComponentClient(cookieStore: any) {
  return _createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: any[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Ignored in Server Components (read-only cookie store)
          }
        });
      },
    },
  });
}

/**
 * Basic client (no auth context) — for simple server-side operations.
 * Lazy-initialized to avoid crashing at build time when env vars are missing.
 */
let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    return (getSupabase() as any)[prop];
  },
});
