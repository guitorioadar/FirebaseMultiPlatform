import { Platform } from 'react-native';
import { DocumentData, DocumentSnapshot, Firestore as WebFirestore } from 'firebase/firestore';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

type WebFunctions = {
    collection: Function;
    query: Function;
    where: Function;
    getDocs: Function;
    addDoc: Function;
    doc: Function;
    getDoc: Function;
    setDoc: Function;
    deleteDoc: Function;
    orderBy: Function;
    limit: Function;
    startAt: Function;
    startAfter: Function;
    endAt: Function;
    endBefore: Function;
};

const createFirestoreService = () => {
    let db: WebFirestore | FirebaseFirestoreTypes.Module;
    
    let webFunctions: WebFunctions = {
        collection: () => { throw new Error('Firestore not initialized') },
        query: () => { throw new Error('Firestore not initialized') },
        where: () => { throw new Error('Firestore not initialized') },
        getDocs: () => { throw new Error('Firestore not initialized') },
        addDoc: () => { throw new Error('Firestore not initialized') },
        doc: () => { throw new Error('Firestore not initialized') },
        getDoc: () => { throw new Error('Firestore not initialized') },
        setDoc: () => { throw new Error('Firestore not initialized') },
        deleteDoc: () => { throw new Error('Firestore not initialized') },
        orderBy: () => { throw new Error('Firestore not initialized') },
        limit: () => { throw new Error('Firestore not initialized') },
        startAt: () => { throw new Error('Firestore not initialized') },
        startAfter: () => { throw new Error('Firestore not initialized') },
        endAt: () => { throw new Error('Firestore not initialized') },
        endBefore: () => { throw new Error('Firestore not initialized') }
    };

    const initializeWeb = async () => {
        const {
            collection, query, where, getDocs,
            addDoc, doc, deleteDoc, orderBy,
            limit, startAt, startAfter, endAt, endBefore
        } = await import('firebase/firestore');
        const { db: webDb } = await import('../config/firebase.web');

        db = webDb;
        webFunctions = {
            collection, query, where, getDocs,
            addDoc, doc, deleteDoc, orderBy,
            limit, startAt, startAfter, endAt, endBefore,
            getDoc: () => { throw new Error('Not implemented') },
            setDoc: () => { throw new Error('Not implemented') }
        };
    };

    const initializeNative = async () => {
        const { db: nativeDb } = await import('../config/firebase.native');
        db = nativeDb;
    };

    const getNativeDB = (): FirebaseFirestoreTypes.Module => {
        if (Platform.OS === 'web') {
            throw new Error('getNativeDB called on web platform');
        }
        return db as FirebaseFirestoreTypes.Module;
    };

    const initialize = async () => {
        if (Platform.OS === 'web') {
            await initializeWeb();
        } else {
            await initializeNative();
        }
    };

    initialize();

    return {
        getNativeDB,
        collection: (collectionName: string) => {
            if (Platform.OS === 'web') {
                return webFunctions.collection(db, collectionName);
            }
            return getNativeDB().collection(collectionName);
        },
        orderBy: (field: string, direction: 'asc' | 'desc' = 'asc') => {
            if (Platform.OS === 'web') {
                return webFunctions.orderBy(field, direction);
            }
            return ['orderBy', field, direction];
        },
        limit: (limitCount: number) => {
            if (Platform.OS === 'web') {
                return webFunctions.limit(limitCount);
            }
            return ['limit', limitCount];
        },
        startAt: (...args: any[]) => {
            if (Platform.OS === 'web') {
                return webFunctions.startAt(...args);
            }
            return ['startAt', ...args];
        },
        startAfter: (snapshot: any) => {
            if (Platform.OS === 'web') {
                return webFunctions.startAfter(snapshot);
            }
            return ['startAfter', snapshot];
        },
        endAt: (...args: any[]) => {
            if (Platform.OS === 'web') {
                return webFunctions.endAt(...args);
            }
            return ['endAt', ...args];
        },
        endBefore: (snapshot: any) => {
            if (Platform.OS === 'web') {
                return webFunctions.endBefore(snapshot);
            }
            return ['endBefore', snapshot];
        },
        query: (collectionRef: any, ...queryConstraints: any[]) => {
            if (Platform.OS === 'web') {
                return webFunctions.query(collectionRef, ...queryConstraints);
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
        },
        where: (field: string, operator: string, value: any) => {
            if (Platform.OS === 'web') {
                return webFunctions.where(field, operator, value);
            }
            return [field, operator, value];
        },
        getDocs: async (query: any) => {
            try {
                let snapshot;
                if (Platform.OS === 'web') {
                    snapshot = await webFunctions.getDocs(query);
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
        },
        doc: (collectionName: string, docId: string) => {
            if (Platform.OS === 'web') {
                return webFunctions.doc(db, collectionName, docId);
            }
            return getNativeDB().collection(collectionName).doc(docId);
        },
        addDoc: async (collectionName: string, data: DocumentData | FirebaseFirestoreTypes.DocumentData) => {
            if (Platform.OS === 'web') {
                const collectionRef = webFunctions.collection(db, collectionName);
                return webFunctions.addDoc(collectionRef, data);
            }
            return getNativeDB().collection(collectionName).add(data);
        },
        deleteDoc: async (collectionName: string, docId: string) => {
            if (Platform.OS === 'web') {
                const docRef = webFunctions.doc(db, collectionName, docId);
                return webFunctions.deleteDoc(docRef);
            }
            return getNativeDB().collection(collectionName).doc(docId).delete();
        }
    };
};

export const {
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
} = createFirestoreService();