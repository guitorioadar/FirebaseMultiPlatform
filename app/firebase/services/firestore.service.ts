import { Platform } from 'react-native';
import { CollectionReference, DocumentData, DocumentReference, DocumentSnapshot, FieldPath, Query, QueryConstraint, QueryConstraintType, QueryFieldFilterConstraint, QuerySnapshot, Firestore as WebFirestore, WhereFilterOp, WriteBatch as WebWriteBatch, writeBatch as webWriteBatch } from 'firebase/firestore';
import { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

type QuerySnapshotArg =
    DocumentSnapshot<DocumentData> |
    FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData> |
    unknown[];

type CollectionReferenceArg =
    CollectionReference<DocumentData> |
    FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData>

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
    onSnapshot: Function;
    writeBatch: Function;
};

type QueryConstraintMultiPlatformType = QueryConstraint | [string, string, unknown] | [string, unknown] | [string, string, string, unknown];

let firestoreInstance: WebFirestore | FirebaseFirestoreTypes.Module;

export type BatchType = WebWriteBatch | FirebaseFirestoreTypes.WriteBatch;

export interface WriteBatch {
    set: (
        documentRef: DocumentReference<DocumentData> | FirebaseFirestoreTypes.DocumentReference,
        data: DocumentData | FirebaseFirestoreTypes.DocumentData,
        options?: any
    ) => void;
    delete: (
        documentRef: DocumentReference<DocumentData> | FirebaseFirestoreTypes.DocumentReference
    ) => void;
    commit: () => Promise<any>;
}
export interface SplittableBatch {
    set: (
        documentRef: DocumentReference<DocumentData> | FirebaseFirestoreTypes.DocumentReference,
        data: DocumentData | FirebaseFirestoreTypes.DocumentData,
        options?: any
    ) => void;
    delete: (
        documentRef: DocumentReference<DocumentData> | FirebaseFirestoreTypes.DocumentReference
    ) => void;
    commit: () => Promise<any>;
    getBatches: () => BatchType[];
}


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
        endBefore: () => { throw new Error('Firestore not initialized') },
        onSnapshot: () => { throw new Error('Firestore not initialized') },
        writeBatch: () => { throw new Error('Firestore not initialized') }
    };

    const initializeWeb = async () => {
        const {
            collection, query, where, getDocs,
            addDoc, doc, deleteDoc, orderBy,
            limit, startAt, startAfter, endAt, endBefore, getDoc,
            onSnapshot, writeBatch, setDoc
        } = await import('firebase/firestore');
        const { db: webDb } = await import('../config/firebase.web');

        db = webDb;
        firestoreInstance = webDb;
        webFunctions = {
            collection, query, where, getDocs,
            addDoc, doc, deleteDoc, orderBy,
            limit, startAt, startAfter, endAt, endBefore,
            getDoc,
            onSnapshot,
            setDoc,
            writeBatch
        };
    };

    const initializeNative = async () => {
        const { db: nativeDb } = await import('../config/firebase.native');
        db = nativeDb;
        firestoreInstance = nativeDb;
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

    // Define the overloads as a type
    type DocFunction = {
        (firestore: WebFirestore | FirebaseFirestoreTypes.Module, path: string, ...pathSegments: string[]): DocumentReference<DocumentData> | FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>;
        (firestore: FirebaseFirestoreTypes.Module, path: string, ...pathSegments: string[]): DocumentReference<DocumentData> | FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>;
        (collection: CollectionReferenceArg, path?: string): DocumentReference<DocumentData> | FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>;
        (collection: FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData>, path: string): DocumentReference<DocumentData> | FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>;
    };

    // Implement the function broadly
    const docImplementation: DocFunction = (
        firestore: WebFirestore | FirebaseFirestoreTypes.Module | CollectionReference<DocumentData> | FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData>,
        collectionName?: string,
        docId?: string
        // ): DocumentReference<DocumentData> | FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData> => {
    ) => {
        if (Platform.OS === 'web') {
            if (firestore && typeof (firestore as any).path === 'string') {
                return webFunctions.doc(firestore as CollectionReference<DocumentData>, collectionName || '', docId || '');
            } else {
                return webFunctions.doc(firestore || db, collectionName, docId);
            }
            // return webFunctions.doc(firestore || db, collectionName, docId);
        } else {

            if (firestore && typeof (firestore as any).path === 'string') {
                return (firestore as FirebaseFirestoreTypes.CollectionReference).doc(collectionName || '');
            } else {
                return getNativeDB().collection(collectionName || '').doc(docId || '');
            }
            // return getNativeDB().collection(collectionName || '').doc(docId || '');
        }
    };

    type OnSnapshotFunction = {
        (
            reference: DocumentReference<DocumentData> | FirebaseFirestoreTypes.DocumentReference,
            callback: (snapshot: DocumentSnapshot<DocumentData> | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>) => void,
            onError?: (error: Error) => void
        ): () => void;

        (
            reference: Query<DocumentData> | FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData>,
            callback: (snapshot: QuerySnapshot<DocumentData> | FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>) => void,
            onError?: (error: Error) => void
        ): () => void;
    };

    const onSnapshotImplementation: OnSnapshotFunction = (
        reference: any,
        callback: any,
        onError?: (error: Error) => void
    ): (() => void) => {
        if (Platform.OS === 'web') {
            return webFunctions.onSnapshot(reference, callback, onError);
        }
        if ('where' in reference) {
            return (reference as FirebaseFirestoreTypes.Query).onSnapshot(callback, onError);
        }
        return (reference as FirebaseFirestoreTypes.DocumentReference).onSnapshot(callback, onError);
    };

    return {
        firestore: firestoreInstance,
        orderBy: (field: string, direction: 'asc' | 'desc' = 'asc'): QueryConstraint | [string, string, 'asc' | 'desc'] => {
            if (Platform.OS === 'web') {
                return webFunctions.orderBy(field, direction);
            }
            return ['orderBy', field, direction];
        },
        limit: (limitCount: number): QueryConstraint | [string, number] => {
            if (Platform.OS === 'web') {
                return webFunctions.limit(limitCount);
            }
            return ['limit', limitCount];
        },
        startAt: (snapshot: QuerySnapshotArg): QueryConstraint | [string, QuerySnapshotArg] => {
            if (Platform.OS === 'web') {
                return webFunctions.startAt(snapshot);
            }
            return ['startAt', snapshot];
        },
        startAfter: (snapshot: QuerySnapshotArg): QueryConstraint | [string, QuerySnapshotArg] => {
            if (Platform.OS === 'web') {
                return webFunctions.startAfter(snapshot);
            }
            return ['startAfter', snapshot];
        },
        endAt: (snapshot: QuerySnapshotArg): QueryConstraint | [string, QuerySnapshotArg] => {
            if (Platform.OS === 'web') {
                return webFunctions.endAt(snapshot);
            }
            return ['endAt', snapshot];
        },
        endBefore: (snapshot: QuerySnapshotArg): QueryConstraint | [string, QuerySnapshotArg] => {
            if (Platform.OS === 'web') {
                return webFunctions.endBefore(snapshot);
            }
            return ['endBefore', snapshot];
        },
        query: (
            collectionRef: CollectionReference<DocumentData> | FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData>,
            ...queryConstraints: QueryConstraintMultiPlatformType[]
        ): Query<DocumentData> | FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData> => {
            if (Platform.OS === 'web') {
                return webFunctions.query(collectionRef, ...queryConstraints);
            }
            let ref = collectionRef as FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData>;
            queryConstraints.forEach(constraint => {
                console.log('constraint', constraint);
                if (Array.isArray(constraint)) {
                    const [type, ...args] = constraint;
                    switch (type) {
                        case 'orderBy':
                            ref = ref.orderBy(args[0] as string | number | FieldPath, args[1] as 'asc' | 'desc');
                            break;
                        case 'limit':
                            ref = ref.limit(args[0] as number);
                            break;
                        case 'where':
                            ref = ref.where(args[0] as string, args[1] as WhereFilterOp, args[2] as unknown);
                            break;
                        case 'startAt':
                            ref = ref.startAt(args[0], args[1]);
                            break;
                        case 'startAfter':
                            ref = ref.startAfter(args[0] as QuerySnapshotArg);
                            break;
                        case 'endAt':
                            ref = ref.endAt(args[0], args[1]);
                            break;
                        case 'endBefore':
                            ref = ref.endBefore(args[0]);
                            break;
                        default:
                            ref = ref.where(constraint[0] as string, constraint[1] as WhereFilterOp, constraint[2] as unknown);
                    }
                } else {
                    console.warn('Implement custom constraint logic here', constraint);
                }
            });
            return ref;
        },
        where: (field: string, operator: string, value: unknown): QueryConstraint | [string, string, unknown] => {
            if (Platform.OS === 'web') {
                return webFunctions.where(field, operator, value);
            }
            return [field, operator, value];
        },
        collection: (firestore: WebFirestore | FirebaseFirestoreTypes.Module, collectionName: string): CollectionReferenceArg => {
            if (Platform.OS === 'web') {
                return webFunctions.collection(firestore || db, collectionName);
            }
            return getNativeDB().collection(collectionName);
        },
        getDocs: async (query: Query<DocumentData> | FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData>): Promise<QuerySnapshot<DocumentData> | FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>> => {
            try {
                let snapshot;
                if (Platform.OS === 'web') {
                    snapshot = await webFunctions.getDocs(query);
                } else {
                    snapshot = await (query as FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData>).get();
                }

                return {
                    empty: snapshot.empty,
                    size: snapshot.size,
                    docs: snapshot.docs.map((doc: DocumentSnapshot | FirebaseFirestoreTypes.DocumentSnapshot) => ({
                        id: doc.id,
                        data: () => doc.data(),
                        exists: doc.exists
                    }))
                } as QuerySnapshot<DocumentData> | FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>;
            } catch (error) {
                console.error('Error in getDocs:', error);
                throw error;
            }
        },
        getDoc: async (docRef: DocumentReference<DocumentData> | FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>): Promise<DocumentSnapshot<DocumentData> | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>> => {
            if (Platform.OS === 'web') {
                return webFunctions.getDoc(docRef);
            }
            return (docRef as FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>).get();
        },
        setDoc: async (docRef: DocumentReference<DocumentData> | FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>, data: DocumentData | FirebaseFirestoreTypes.DocumentData, options?: any): Promise<void> => {
            if (Platform.OS === 'web') {
                return webFunctions.setDoc(docRef, data, options);
            }
            return (docRef as FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>).set(data, options);
        },
        // doc: (
        //     firestore: WebFirestore | FirebaseFirestoreTypes.Module | CollectionReference<DocumentData> | FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData>,
        //     collectionName?: string,
        //     docId?: string
        // ): DocumentReference<DocumentData> | FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData> => {
        //     if (Platform.OS === 'web') {
        //         if (firestore && typeof (firestore as any).path === 'string') {
        //             return webFunctions.doc(firestore as CollectionReference<DocumentData>, collectionName || '', docId || '');
        //         } else {
        //             return webFunctions.doc(firestore || db, collectionName, docId);
        //         }
        //         // return webFunctions.doc(firestore || db, collectionName, docId);
        //     } else {

        //         if (firestore && typeof (firestore as any).path === 'string') {
        //             return (firestore as FirebaseFirestoreTypes.CollectionReference).doc(collectionName || '');
        //         } else {
        //             return getNativeDB().collection(collectionName || '').doc(docId || '');
        //         }
        //         // return getNativeDB().collection(collectionName || '').doc(docId || '');
        //     }
        // },
        doc: docImplementation,
        addDoc: async (collectionName: string | CollectionReference<DocumentData> | FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData>, data: DocumentData | FirebaseFirestoreTypes.DocumentData): Promise<DocumentReference<DocumentData> | FirebaseFirestoreTypes.DocumentReference<FirebaseFirestoreTypes.DocumentData>> => {
            if (Platform.OS === 'web') {
                const collectionRef = webFunctions.collection(db, collectionName);
                return webFunctions.addDoc(collectionRef, data);
            }
            if (typeof collectionName === 'string') {
                return getNativeDB().collection(collectionName).add(data);
            }
            return (collectionName as FirebaseFirestoreTypes.CollectionReference<FirebaseFirestoreTypes.DocumentData>).add(data);
        },
        deleteDoc: async (collectionName: string, docId: string): Promise<void> => {
            if (Platform.OS === 'web') {
                const docRef = webFunctions.doc(db, collectionName, docId);
                return webFunctions.deleteDoc(docRef);
            }
            return getNativeDB().collection(collectionName).doc(docId).delete();
        },
        // onSnapshot: (
        //     reference: DocumentReference<DocumentData> | FirebaseFirestoreTypes.DocumentReference
        //         | Query<DocumentData> | FirebaseFirestoreTypes.Query<FirebaseFirestoreTypes.DocumentData>
        //     ,
        //     callback: (
        //         snapshot: DocumentSnapshot<DocumentData> | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
        //             | QuerySnapshot<DocumentData> | FirebaseFirestoreTypes.QuerySnapshot<FirebaseFirestoreTypes.DocumentData>
        //     ) => void,
        //     onError?: (error: Error) => void
        // ): (() => void) => {
        //     if (Platform.OS === 'web') {
        //         return webFunctions.onSnapshot(reference, callback, onError);
        //     }
        //     if (reference as FirebaseFirestoreTypes.Query) {
        //         return (reference as FirebaseFirestoreTypes.Query).onSnapshot(callback, onError);
        //     }
        //     return (reference as FirebaseFirestoreTypes.DocumentReference).onSnapshot(callback, onError);
        // },
        onSnapshot: onSnapshotImplementation,
        splittableBatch: (
            firestore: WebFirestore | FirebaseFirestoreTypes.Module,
            maxQueriesPerBatch = 20
        ): SplittableBatch => {
            const createBatch = (): BatchType => {
                if (Platform.OS === 'web') {
                    // const { writeBatch } = require('firebase/firestore');
                    return webFunctions.writeBatch((firestore || db) as WebFirestore);
                }
                return getNativeDB().batch();
            };

            const batches: BatchType[] = [createBatch()];
            let count = 1;

            return {
                set: (documentRef, data, options?) => {
                    const batch = batches[batches.length - 1];
                    if (Platform.OS === 'web') {
                        (batch as WebWriteBatch).set(documentRef as DocumentReference<DocumentData>, data, options);
                    } else {
                        (batch as FirebaseFirestoreTypes.WriteBatch).set(documentRef as FirebaseFirestoreTypes.DocumentReference, data, options);
                    }
                    count++;
                    if (count > maxQueriesPerBatch) {
                        batches.push(createBatch());
                        count = 1;
                    }
                },
                delete: (documentRef) => {
                    const batch = batches[batches.length - 1];
                    if (Platform.OS === 'web') {
                        (batch as WebWriteBatch).delete(documentRef as DocumentReference<DocumentData>);
                    } else {
                        (batch as FirebaseFirestoreTypes.WriteBatch).delete(documentRef as FirebaseFirestoreTypes.DocumentReference);
                    }
                    count++;
                    if (count > maxQueriesPerBatch) {
                        batches.push(createBatch());
                        count = 1;
                    }
                },
                commit: async () => Promise.all(batches.map(batch => batch.commit())),
                getBatches: () => batches
            };
        },
        writeBatch: (firestore: WebFirestore | FirebaseFirestoreTypes.Module) => {
            if (Platform.OS === 'web') {
                return webFunctions.writeBatch((firestore || db) as WebFirestore);
            }
            return getNativeDB().batch();
        }
    };
};

export const {
    firestore,
    collection,
    query,
    where,
    getDocs,
    getDoc,
    setDoc,
    doc,
    addDoc,
    deleteDoc,
    orderBy,
    limit,
    startAfter,
    endBefore,
    onSnapshot,
    splittableBatch,
    writeBatch
} = createFirestoreService();