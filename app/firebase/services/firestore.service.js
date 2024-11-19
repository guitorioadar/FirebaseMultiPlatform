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
            deleteDoc
        } = await import('firebase/firestore');
        const { db } = await import('../config/firebase.web');

        this.db = db;
        this.collection = collection;
        this.query = query;
        this.where = where;
        this.getDocs = getDocs;
        this.addDoc = addDoc;
        this.doc = doc;
        this.getDoc = getDoc;
        this.setDoc = setDoc;
        this.deleteDoc = deleteDoc;
    }

    async initializeNative() {
        const { db } = await import('../config/firebase.native');
        this.db = db;
    }

    // Unified API methods
    async getDocuments(collectionName, field, value) {
        if (Platform.OS === 'web') {
            const q = this.query(
                this.collection(this.db, collectionName),
                this.where(field, '==', value)
            );
            const querySnapshot = await this.getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else {
            const querySnapshot = await this.db
                .collection(collectionName)
                .where(field, '==', value)
                .get();
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
    }
    async addDocument(collectionName, data) {
        if (Platform.OS === 'web') {
            const collectionRef = this.collection(this.db, collectionName);
            const docRef = await this.addDoc(collectionRef, data);
            return docRef.id;
        } else {
            const docRef = await this.db.collection(collectionName).add(data);
            return docRef.id;
        }
    }

    async deleteDocument(collectionName, id) {
        if (Platform.OS === 'web') {
            await this.deleteDoc(this.doc(this.db, collectionName, id));
        } else {
            await this.db.collection(collectionName).doc(id).delete();
        }
    }

    // Add more methods as needed
}

export const firestoreService = new FirestoreService();