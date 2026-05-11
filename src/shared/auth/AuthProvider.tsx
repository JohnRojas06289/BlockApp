import * as SecureStore from 'expo-secure-store';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { Platform } from 'react-native';

const USERS_STORAGE_KEY = 'blockapp.demo.users';
const SESSION_STORAGE_KEY = 'blockapp.demo.session';

export interface DemoUser {
  id: string;
  firstName: string;
  email: string;
  emailAddresses: Array<{ emailAddress: string }>;
}

interface StoredDemoUser {
  id: string;
  firstName: string;
  email: string;
  password: string;
  createdAt: string;
}

interface StoredDemoSession {
  userId: string;
  createdAt: string;
}

interface AuthContextValue {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: DemoUser | null;
  signIn: (params: { email: string; password: string }) => Promise<void>;
  signUp: (params: { firstName: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function createId() {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `demo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function toPublicUser(user: StoredDemoUser): DemoUser {
  return {
    id: user.id,
    firstName: user.firstName,
    email: user.email,
    emailAddresses: [{ emailAddress: user.email }],
  };
}

async function getStorageItem(key: string) {
  if (Platform.OS === 'web') {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  return SecureStore.getItemAsync(key);
}

async function setStorageItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function removeStorageItem(key: string) {
  if (Platform.OS === 'web') {
    globalThis.localStorage?.removeItem(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

async function readUsers(): Promise<StoredDemoUser[]> {
  const raw = await getStorageItem(USERS_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as StoredDemoUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: StoredDemoUser[]) {
  await setStorageItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

async function readSession(): Promise<StoredDemoSession | null> {
  const raw = await getStorageItem(SESSION_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as StoredDemoSession;
  } catch {
    return null;
  }
}

async function writeSession(session: StoredDemoSession) {
  await setStorageItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<DemoUser | null>(null);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      try {
        const [users, session] = await Promise.all([readUsers(), readSession()]);
        const currentUser = session
          ? users.find((candidate) => candidate.id === session.userId) ?? null
          : null;

        if (!mounted) return;
        setUser(currentUser ? toPublicUser(currentUser) : null);
      } finally {
        if (mounted) setIsLoaded(true);
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const signIn = useCallback(async ({ email, password }: { email: string; password: string }) => {
    const normalizedEmail = normalizeEmail(email);
    const users = await readUsers();
    const existingUser = users.find((candidate) => candidate.email === normalizedEmail);

    if (!existingUser || existingUser.password !== password) {
      throw new Error('Incorrect email or password.');
    }

    await writeSession({ userId: existingUser.id, createdAt: new Date().toISOString() });
    setUser(toPublicUser(existingUser));
  }, []);

  const signUp = useCallback(async ({ firstName, email, password }: { firstName: string; email: string; password: string }) => {
    const normalizedEmail = normalizeEmail(email);
    const cleanedFirstName = firstName.trim();

    if (!cleanedFirstName) {
      throw new Error('First name is required.');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters.');
    }

    const users = await readUsers();

    if (users.some((candidate) => candidate.email === normalizedEmail)) {
      throw new Error('This email is already registered.');
    }

    const nextUser: StoredDemoUser = {
      id: createId(),
      firstName: cleanedFirstName,
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
    };

    const nextUsers = [...users, nextUser];
    await writeUsers(nextUsers);
    await writeSession({ userId: nextUser.id, createdAt: new Date().toISOString() });
    setUser(toPublicUser(nextUser));
  }, []);

  const signOut = useCallback(async () => {
    await removeStorageItem(SESSION_STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    isLoaded,
    isSignedIn: Boolean(user),
    user,
    signIn,
    signUp,
    signOut,
  }), [isLoaded, signIn, signOut, signUp, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}

export function useAuth() {
  const { isLoaded, isSignedIn, signOut, signIn, signUp } = useAuthContext();
  return { isLoaded, isSignedIn, signOut, signIn, signUp };
}

export function useUser() {
  const { user, isLoaded, isSignedIn } = useAuthContext();
  return { user, isLoaded, isSignedIn };
}
