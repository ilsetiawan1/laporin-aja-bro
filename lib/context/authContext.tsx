"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { AuthUser } from "@/lib/hooks/useAuth";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      // Step 1: Baca session dari cookie yang di-set server
      const { data: { session } } = await supabase.auth.getSession();
      if (mounted) {
        const u = session?.user;
        setUser(u ? { id: u.id, email: u.email ?? "" } : null);
        setLoading(false);
      }
    }

    initAuth();

    // Step 2: Listen perubahan (login/logout via client)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) {
          const u = session?.user;
          setUser(u ? { id: u.id, email: u.email ?? "" } : null);
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}