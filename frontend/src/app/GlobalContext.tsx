'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { UserServices } from '../services/UserServices';

interface GlobalContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  username: string;
  setUsername: (val: string) => void;
  role: string;
  setRole: (val: string) => void;
  restaurantId: number;
  setRestaurantId: (val: number) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  isAuthChecking: boolean;
  logout: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [restaurantId, setRestaurantId] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  // True while we verify the persisted session on first load; the app must not
  // redirect to /login before this resolves.
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // On mount, restore the session from the AuthorizationCookies cookie via /me.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const session = await UserServices.getMe();
        if (!active) return;
        setUsername(session.userName);
        setRole(session.role);
        setRestaurantId(session.restaurantId ?? 0);
        setIsAuthenticated(true);
      } catch {
        // No valid session — stay logged out.
      } finally {
        if (active) setIsAuthChecking(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Logs out on the backend (clears the auth cookie) and resets local state.
  const logout = useCallback(async () => {
    try {
      await UserServices.logOut();
    } catch {
      // Ignore network errors during logout; still reset local state.
    }
    setIsAuthenticated(false);
    setUsername("");
    setRole("");
    setRestaurantId(0);
  }, []);

  const value = useMemo(() => ({
    isAuthenticated,
    setIsAuthenticated,
    username,
    setUsername,
    role,
    setRole,
    restaurantId,
    setRestaurantId,
    isLoading,
    setIsLoading,
    isAuthChecking,
    logout,
  }), [isAuthenticated, username, role, restaurantId, isLoading, isAuthChecking, logout]);

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
}
