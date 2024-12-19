export {
    User,
    NativeAuth,
    login,
    logout,
    register,
    onAuthStateChanged,
    getCurrentUser
} from './services/auth.service';
export { analytics, logEvent } from './services/analytics.service';
export {
    firestore,
    collection,
    query,
    where,
    getDocs,
    getDoc,
    doc,
    addDoc,
    deleteDoc,
    orderBy,
    limit,
    startAfter,
    endBefore,
    onSnapshot,
    splittableBatch,
    SplittableBatch,
    BatchType,
    WriteBatch,
    writeBatch
} from './services/firestore.service';
export { storage, ref, uploadBytes, getDownloadURL, uploadBytesResumable, StorageTaskSnapshot, getBytes, getBlob } from './services/storage.service';
