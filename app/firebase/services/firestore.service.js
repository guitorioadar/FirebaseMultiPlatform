import { Platform } from 'react-native';

class FirestoreService {
    constructor() {
        if (Platform.OS === 'web') {
            this.initializeWeb();
        } else {
            this.initializeNative();
        }
    }

    async initializeWeb() {
        const {
            collection,
            query,
            where,
            getDocs,
            addDoc,
            doc,
            getDoc,
            setDoc,
            deleteDoc,
            orderBy,
            limit,
            startAt,
            startAfter,
            endAt,
            endBefore
        } = await import('firebase/firestore');
        const { db } = await import('../config/firebase.web');

        this.db = db;
        this._collection = collection;
        this._query = query;
        this._where = where;
        this._getDocs = getDocs;
        this._addDoc = addDoc;
        this._doc = doc;
        this._getDoc = getDoc;
        this._setDoc = setDoc;
        this._deleteDoc = deleteDoc;
        this._orderBy = orderBy;
        this._limit = limit;
        this._startAt = startAt;
        this._startAfter = startAfter;
        this._endAt = endAt;
        this._endBefore = endBefore;
    }

    async initializeNative() {
        const { db } = await import('../config/firebase.native');
        this.db = db;
    }
}

const firestoreService = new FirestoreService();

export const collection = (collectionName) => {
    if (Platform.OS === 'web') {
        return firestoreService._collection(firestoreService.db, collectionName);
    }
    return firestoreService.db.collection(collectionName);
};

export const orderBy = (field, direction = 'asc') => {
    if (Platform.OS === 'web') {
        return firestoreService._orderBy(field, direction);
    }
    return ['orderBy', field, direction];
};

export const limit = (limitCount) => {
    if (Platform.OS === 'web') {
        return firestoreService._limit(limitCount);
    }
    return ['limit', limitCount];
};

export const startAt = (...args) => {
    if (Platform.OS === 'web') {
        return firestoreService._startAt(...args);
    }
    return ['startAt', ...args];
};

export const startAfter = (...args) => {
    if (Platform.OS === 'web') {
        return firestoreService._startAfter(...args);
    }
    return ['startAfter', ...args];
};

export const endAt = (...args) => {
    if (Platform.OS === 'web') {
        return firestoreService._endAt(...args);
    }
    return ['endAt', ...args];
};

export const endBefore = (...args) => {
    if (Platform.OS === 'web') {
        return firestoreService._endBefore(...args);
    }
    return ['endBefore', ...args];
};

export const query = (collectionRef, ...queryConstraints) => {
    if (Platform.OS === 'web') {
        return firestoreService._query(collectionRef, ...queryConstraints);
    }

    let ref = collectionRef;
    queryConstraints.forEach(constraint => {
        if (Array.isArray(constraint)) {
            const [type, ...args] = constraint;
            switch (type) {
                case 'orderBy':
                    ref = ref.orderBy(...args);
                    break;
                case 'limit':
                    ref = ref.limit(...args);
                    break;
                case 'where':
                    ref = ref.where(...args);
                    break;
                case 'startAt':
                    ref = ref.startAt(...args);
                    break;
                case 'startAfter':
                    ref = ref.startAfter(...args);
                    break;
                case 'endAt':
                    ref = ref.endAt(...args);
                    break;
                case 'endBefore':
                    ref = ref.endBefore(...args);
                    break;
                default:
                    // For where clauses without explicit type
                    ref = ref.where(...constraint);
            }
        } else {
            // Handle non-array constraints (direct Firebase Web SDK format)
            ref = ref.where(...Object.values(constraint));
        }
    });
    return ref;
};

export const where = (field, operator, value) => {
    if (Platform.OS === 'web') {
        return firestoreService._where(field, operator, value);
    }
    return [field, operator, value];
};

export const getDocs = async (query) => {
    try {
        let snapshot;
        if (Platform.OS === 'web') {
            snapshot = await firestoreService._getDocs(query);
        } else {
            snapshot = await query.get();
        }
        console.log('snapshot', snapshot);
        return {
            empty: snapshot.empty,
            size: snapshot.size,
            docs: snapshot.docs.map(doc => ({
                id: doc.id,
                data: () => doc.data(),
                exists: doc.exists
            }))
        };
    } catch (error) {
        console.error('Error in getDocs:', error);
        throw error;
    }
};

export const doc = (collectionName, docId) => {
    if (Platform.OS === 'web') {
        return firestoreService._doc(firestoreService.db, collectionName, docId);
    }
    return firestoreService.db.collection(collectionName).doc(docId);
};

export const addDoc = async (collectionName, data) => {
    if (Platform.OS === 'web') {
        // return firestoreService._addDoc(collection(collectionName), data);
        return firestoreService._addDoc(collection(collectionName), data);
    }
    return firestoreService.db.collection(collectionName).add(data);
};

export const deleteDoc = async (collectionName, docId) => {
    if (Platform.OS === 'web') {
        return firestoreService._deleteDoc(doc(collectionName, docId));
    }
    return firestoreService.db.collection(collectionName).doc(docId).delete();
};


export { firestoreService };