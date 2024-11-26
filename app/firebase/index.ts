export {
    User,
    NativeAuth,
    login,
    logout,
    register,
    onAuthStateChanged,
    getCurrentUser
} from './services/auth.service';
export { analyticsService } from './services/analytics.service';
export {
    collection,
    query,
    where,
    getDocs,
    doc,
    addDoc,
    deleteDoc,
    orderBy,
    limit,
    startAfter,
    endBefore,
} from './services/firestore.service';