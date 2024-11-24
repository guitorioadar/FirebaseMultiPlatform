import { Platform } from 'react-native';

// Web types
import type {
  Auth as WebAuth,
  UserCredential as WebUserCredential,
  User as WebUser
} from 'firebase/auth';

// Native types
import type auth from '@react-native-firebase/auth';
import type { FirebaseAuthTypes } from '@react-native-firebase/auth';

type NativeAuth = ReturnType<typeof auth>;
type NativeUserCredential = FirebaseAuthTypes.UserCredential;
type User = WebUser | FirebaseAuthTypes.User;

class AuthService {
  auth!: WebAuth | NativeAuth;
  signInWithEmailAndPassword!:
    | ((auth: WebAuth, email: string, password: string) => Promise<WebUserCredential>)
    | ((email: string, password: string) => Promise<NativeUserCredential>);
  createUserWithEmailAndPassword!:
    | ((auth: WebAuth, email: string, password: string) => Promise<WebUserCredential>)
    | ((email: string, password: string) => Promise<NativeUserCredential>);
  signOut!: ((auth: WebAuth) => Promise<void>) | (() => Promise<void>);
  getIdToken!: () => Promise<string>;

  constructor() {
    if (Platform.OS === 'web') {
      this.initializeWeb();
    } else {
      this.initializeNative();
    }
  }

  async initializeWeb(): Promise<void> {
    const {
      getAuth,
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      signOut,
    } = await import('firebase/auth');
    const { app } = await import('../config/firebase.web');

    this.auth = getAuth(app);
    this.signInWithEmailAndPassword = signInWithEmailAndPassword;
    this.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
    this.signOut = signOut;
    this.getIdToken = () => this.auth.currentUser?.getIdToken() ?? Promise.reject(new Error('No user logged in'));
  }

  async initializeNative(): Promise<void> {
    const auth = await import('@react-native-firebase/auth');
    const authInstance = auth.default();
    this.auth = authInstance;
    this.signInWithEmailAndPassword = (email: string, password: string) => authInstance.signInWithEmailAndPassword(email, password);
    this.createUserWithEmailAndPassword = (email: string, password: string) => authInstance.createUserWithEmailAndPassword(email, password);
    this.signOut = () => authInstance.signOut();
    this.getIdToken = () => this.auth.currentUser?.getIdToken() ?? Promise.reject(new Error('No user logged in'));
  }

  async login(email: string, password: string): Promise<User> {
    try {
      let result;
      if (Platform.OS === 'web') {
        result = await (this.signInWithEmailAndPassword as any)(this.auth, email, password);
      } else {
        result = await (this.signInWithEmailAndPassword as any)(email, password);
      }
      return result.user;
    } catch (error) {
      const typedError = error as { code?: string; message: string };
      const errorMessage = typedError.message
        .replace(/\[.*?\]\s*/, '')
        .replace(/\.$/, '');
      throw new Error(errorMessage);
    }
  }

  async register(email: string, password: string): Promise<User> {
    try {
      let result;
      if (Platform.OS === 'web') {
        result = await (this.createUserWithEmailAndPassword as any)(this.auth, email, password);
      } else {
        result = await (this.createUserWithEmailAndPassword as any)(email, password);
      }
      return result.user;
    } catch (error) {
      const typedError = error as { code?: string; message: string };
      const errorMessage = typedError.message
        .replace(/\[.*?\]\s*/, '')
        .replace(/\.$/, '');
      throw new Error(errorMessage);
    }
  }

  async logout(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await (this.signOut as any)(this.auth);
      } else {
        await (this.signOut as any)();
      }
    } catch (error) {
      const typedError = error as Error;
      throw new Error(typedError.message);
    }
  }

  async getIdTokenOfCurrentUser(): Promise<string> {
    try {
      return await this.getIdToken();
    } catch (error) {
      const typedError = error as Error;
      throw new Error(typedError.message);
    }
  }

  get currentUser(): User | null {
    return this.auth.currentUser;
  }
}

export const authService = new AuthService();