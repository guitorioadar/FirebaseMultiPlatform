import { initializeApp } from 'firebase/app';
import {
    CACHE_SIZE_UNLIMITED,
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager
} from 'firebase/firestore';
import { firebaseConfig } from './firebase.config';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with persistence configuration
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: CACHE_SIZE_UNLIMITED
    })
});

export { db, app };