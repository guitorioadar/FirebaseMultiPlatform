import { Platform } from 'react-native';
import type { Auth as WebAuth, User as WebUser } from 'firebase/auth';
import type auth from '@react-native-firebase/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

export type NativeAuth = ReturnType<typeof auth>;
export type User = WebUser | FirebaseAuthTypes.User;

let authInstance: WebAuth | NativeAuth;

const initializeAuth = async () => {
  if (Platform.OS === 'web') {
    const { getAuth } = await import('firebase/auth');
    const { app } = await import('../config/firebase.web');
    authInstance = getAuth(app);
  } else {
    const auth = await import('@react-native-firebase/auth');
    authInstance = auth.default();
  }
  return authInstance;
};

export const login = async (email: string, password: string): Promise<User> => {
  console.log('login', email, password);
  try {
    if (Platform.OS === 'web') {
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const result = await signInWithEmailAndPassword(authInstance as WebAuth, email, password);
      return result.user;
    } else {
      const result = await (authInstance as NativeAuth).signInWithEmailAndPassword(email, password);
      return result.user;
    }
  } catch (error: any) {
    throw new Error(error.message.replace(/\[.*?\]\s*/, '').replace(/\.$/, ''));
  }
};

export const register = async (email: string, password: string): Promise<User> => {
  try {
    if (Platform.OS === 'web') {
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const result = await createUserWithEmailAndPassword(authInstance as WebAuth, email, password);
      return result.user;
    } else {
      const result = await (authInstance as NativeAuth).createUserWithEmailAndPassword(email, password);
      return result.user;
    }
  } catch (error: any) {
    throw new Error(error.message.replace(/\[.*?\]\s*/, '').replace(/\.$/, ''));
  }
};

export const logout = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      const { signOut } = await import('firebase/auth');
      await signOut(authInstance as WebAuth);
    } else {
      await (authInstance as NativeAuth).signOut();
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const onAuthStateChanged = (callback: (user: User | null) => void) => {
  return authInstance.onAuthStateChanged(callback);
};

export const getCurrentUser = (): User | null => {
  return authInstance.currentUser;
};

export const getIdToken = async (): Promise<string> => {
  const token = await authInstance.currentUser?.getIdToken();
  if (!token) throw new Error('No user logged in');
  return token;
};

// Initialize auth on import
initializeAuth();
