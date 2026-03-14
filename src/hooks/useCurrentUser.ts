"use client";

import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

type CurrentUserState = {
  id: string;
  email: string | null;
} | null;

export function useCurrentUser() {
  const [user, setUser] = useState<CurrentUserState>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ id: data.user.id, email: data.user.email ?? null });
      }
      setIsLoading(false);
    });
  }, []);

  return { user, isLoading };
}
