import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/store";
import { useEffect } from "react";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user } = useAuth();
  const setUser = useAppStore((state) => state.setUser);

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  // You could add loading state here if needed
  return <>{children}</>;
}
