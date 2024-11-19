import { Platform } from 'react-native';

class AuthService {
  constructor() {
    if (Platform.OS === 'web') {
      this.initializeWeb();
    } else {
      this.initializeNative();
    }
  }

  async initializeWeb() {
    const { 
      getAuth,
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      signOut,
      getIdToken
    } = await import('firebase/auth');
    const { app } = await import('../config/firebase.web');
    
    this.auth = getAuth(app);
    this.signInWithEmailAndPassword = signInWithEmailAndPassword;
    this.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
    this.signOut = signOut;
    this.getIdToken = getIdToken;
  }

  async initializeNative() {
    const auth = await import('@react-native-firebase/auth');
    this.auth = auth.default();
    this.getIdToken = this.auth.currentUser.getIdToken;
  }

  async login(email, password) {
    try {
      if (Platform.OS === 'web') {
        const result = await this.signInWithEmailAndPassword(this.auth, email, password);
        return result.user;
      } else {
        const result = await this.auth.signInWithEmailAndPassword(email, password);
        return result.user;
      }
    } catch (error) {
      throw error;
    }
  }

  async register(email, password) {
    try {
      if (Platform.OS === 'web') {
        const result = await this.createUserWithEmailAndPassword(this.auth, email, password);
        return result.user;
      } else {
        const result = await this.auth.createUserWithEmailAndPassword(email, password);
        return result.user;
      }
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      if (Platform.OS === 'web') {
        await this.signOut(this.auth);
      } else {
        await this.auth.signOut();
      }
    } catch (error) {
      throw error;
    }
  }

  async getIdTokenOfCurrentUser() {
    try {
      return this.getIdToken();
    } catch (error) {
      throw error;
    }
  }
}

export const authService = new AuthService();