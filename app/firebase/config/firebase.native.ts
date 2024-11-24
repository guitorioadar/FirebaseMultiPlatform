import firebase from '@react-native-firebase/app';
import '@react-native-firebase/firestore';
import { firebaseConfig } from './firebase.config';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
