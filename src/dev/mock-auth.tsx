/**
 * Local stand-in for src/integrations/firebase/auth.tsx, used only by `npm run dev:demo`
 * (see vite.demo.config.ts). Any email and password signs in; nothing leaves the browser.
 */
import { createContext, useContext, useState, ReactNode } from "react";

interface DemoUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthContextType {
  user: DemoUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const makeUser = (email: string, displayName: string | null = null): DemoUser => ({
  uid: "demo-user",
  email,
  displayName,
  photoURL: null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // `?signedin` skips the login screen so a screenshot can go straight to the dashboard.
  const [user, setUser] = useState<DemoUser | null>(() =>
    new URLSearchParams(window.location.search).has("signedin") ? makeUser("demo@subtrackr.app", "Demo User") : null
  );

  const value: AuthContextType = {
    user,
    loading: false,
    signIn: async (email) => setUser(makeUser(email)),
    signUp: async (email) => setUser(makeUser(email)),
    signInWithGoogle: async () => setUser(makeUser("demo@subtrackr.app", "Demo User")),
    signOut: async () => setUser(null),
    resetPassword: async () => {},
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
