"use client";

// ============================================================
// lib/hooks/useAuth.ts
// Client-side auth state — ALLOWED EXCEPTION
// Supabase auth SDK must run in client context for onAuthStateChange
// ============================================================

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

export interface AuthUser {
  id: string;
  email: string;
}

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(
        user ? { id: user.id, email: user.email ?? "" } : null
      );
      setLoading(false);
    });

    // Listen for auth state changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user;
      setUser(
        sessionUser
          ? { id: sessionUser.id, email: sessionUser.email ?? "" }
          : null
      );
    });

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}
