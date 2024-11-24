import { Platform } from 'react-native';

import { DocumentData, DocumentSnapshot, Firestore as WebFirestore } from 'firebase/firestore';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';


class FirestoreService {
    db!: WebFirestore | FirebaseFirestoreTypes.Module;
    _collection!: Function;
    _query!: Function;
    _where!: Function;
    _getDocs!: Function;
    _addDoc!: Function;
    _doc!: Function;
    _getDoc!: Function;
    _setDoc!: Function;
    _deleteDoc!: Function;
    _orderBy!: Function;
    _limit!: Function;
    _startAt!: Function;
    _startAfter!: Function;
    _endAt!: Function;
    _endBefore!: Function;

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

    getNativeDB(): FirebaseFirestoreTypes.Module {
        return this.db as FirebaseFirestoreTypes.Module;
    }
}

const firestoreService = new FirestoreService();


export const collection = (collectionName: string) => {
    if (Platform.OS === 'web') {
        return firestoreService._collection(firestoreService.db, collectionName);
    }
    return firestoreService.getNativeDB().collection(collectionName);
};

export const orderBy = (field: string, direction: 'asc' | 'desc' = 'asc') => {
    if (Platform.OS === 'web') {
        return firestoreService._orderBy(field, direction);
    }
    return ['orderBy', field, direction];
};

export const limit = (limitCount: number) => {
    if (Platform.OS === 'web') {
        return firestoreService._limit(limitCount);
    }
    return ['limit', limitCount];
};

export const startAt = (...args: any[]) => {
    if (Platform.OS === 'web') {
        return firestoreService._startAt(...args);
    }
    return ['startAt', ...args];
};

export const startAfter = (...args: any[]) => {
    if (Platform.OS === 'web') {
        return firestoreService._startAfter(...args);
    }
    return ['startAfter', ...args];
};

export const endAt = (...args: any[]) => {
    if (Platform.OS === 'web') {
        return firestoreService._endAt(...args);
    }
    return ['endAt', ...args];
};

export const endBefore = (...args: any[]) => {
    if (Platform.OS === 'web') {
        return firestoreService._endBefore(...args);
    }
    return ['endBefore', ...args];
};

export const query = (collectionRef: any, ...queryConstraints: any[]) => {
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
                    ref = ref.where(...constraint);
            }
        } else {
            ref = ref.where(...Object.values(constraint));
        }
    });
    return ref;
};

export const where = (field: string, operator: string, value: any) => {
    if (Platform.OS === 'web') {
        return firestoreService._where(field, operator, value);
    }
    return [field, operator, value];
};

export const getDocs = async (query: any) => {
    try {
        let snapshot;
        if (Platform.OS === 'web') {
            snapshot = await firestoreService._getDocs(query);
        } else {
            snapshot = await query.get();
        }
        return {
            empty: snapshot.empty,
            size: snapshot.size,
            docs: snapshot.docs.map((doc: DocumentSnapshot | FirebaseFirestoreTypes.DocumentSnapshot) => ({
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

export const doc = (collectionName: string, docId: string) => {
    if (Platform.OS === 'web') {
        return firestoreService._doc(firestoreService.db, collectionName, docId);
    }
    return firestoreService.getNativeDB().collection(collectionName).doc(docId);
};

export const addDoc = async (collectionName: string, data: DocumentData | FirebaseFirestoreTypes.DocumentData) => {
    if (Platform.OS === 'web') {
        return firestoreService._addDoc(collection(collectionName), data);
    }
    return firestoreService.getNativeDB().collection(collectionName).add(data);
};

export const deleteDoc = async (collectionName: string, docId: string) => {
    if (Platform.OS === 'web') {
        return firestoreService._deleteDoc(doc(collectionName, docId));
    }
    return firestoreService.getNativeDB().collection(collectionName).doc(docId).delete();
};

export { firestoreService };
