"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

type User = {
  phone: string;
  isAdmin: boolean;
};

type AuthContextType = {
  isOpen: boolean;
  user: User | null;
  openAuth: () => void;
  closeAuth: () => void;
  login: (phone: string) => Promise<void>;
  logout: () => void;
};

const AUTH_STORAGE_KEY = "empire_auth_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Rehydrate user from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as User;
        if (parsed.phone) {
          setUser(parsed);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  const openAuth = () => setIsOpen(true);
  const closeAuth = () => setIsOpen(false);
  
  const login = useCallback(async (phone: string) => {
    let isAdmin = false;

    try {
      const res = await fetch("/api/auth/check-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      if (res.ok) {
        const data = await res.json();
        isAdmin = data.isAdmin === true;
      }
    } catch {
      // If the check fails, default to non-admin
    }

    const newUser: User = { phone, isAdmin };
    setUser(newUser);

    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch {
      // Ignore storage errors
    }
  }, []);
  
  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isOpen, user, openAuth, closeAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
