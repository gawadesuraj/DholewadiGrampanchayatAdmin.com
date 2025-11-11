// src/admin/hooks/useAuth.js
import { useEffect, useState } from "react";
import { supabase } from "../services/supabaseClient";

export default function useAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load session once
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    // Subscribe to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("admin_token");
    window.location.href = "/"; // ✅ One clean redirect
  };

  return { session, loading, signOut };
}
