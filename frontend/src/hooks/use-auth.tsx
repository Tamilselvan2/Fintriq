'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { User, Role } from '@/types/models';
import { authApi } from '@/lib/auth-api';
import { setAccessToken } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { LoginInput } from '@/lib/validations/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginInput) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isAccountant: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  // Inactivity tracking refs
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef(Date.now());

  const TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentUser = await authApi.getMe();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const handleUnauthorized = () => {
      setAccessToken(null);
      setUser(null);
      router.push('/login');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener(
        'auth:unauthorized',
        handleUnauthorized
      );
    };
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const checkInactivity = async () => {
      const now = Date.now();

      if (now - lastActivityRef.current > TIMEOUT_MS) {
        try {
          await authApi.logout();
        } catch (error) {
          console.error('Logout failed:', error);
        } finally {
          setAccessToken(null);
          setUser(null);

          if (inactivityTimerRef.current) {
            clearInterval(inactivityTimerRef.current);
          }

          router.push('/login');
        }
      }
    };

    const events = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart',
    ];

    // Register activity listeners
    events.forEach((event) => {
      window.addEventListener(event, updateActivity, {
        passive: true,
      });
    });

    // Initialize activity timestamp
    updateActivity();

    // Check inactivity every 5 seconds
    inactivityTimerRef.current = setInterval(() => {
      checkInactivity();
    }, 5000);

    return () => {
      // Cleanup interval
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }

      // Cleanup listeners
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [user, router]);

  const login = async (data: LoginInput) => {
    const { accessToken, user } = await authApi.login(data);

    setAccessToken(accessToken);
    setUser(user);

    // Reset activity timestamp on login
    lastActivityRef.current = Date.now();

    router.push('/dashboard');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed on server:', error);
    } finally {
      setAccessToken(null);
      setUser(null);

      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }

      router.push('/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        isAdmin: user?.role === Role.ADMIN,
        isAccountant: user?.role === Role.ACCOUNTANT,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};