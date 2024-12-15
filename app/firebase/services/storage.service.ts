import { Platform } from 'react-native';
import type { SettableMetadata, UploadMetadata, UploadTask, UploadTaskSnapshot, FirebaseStorage as WebStorage, StorageReference as WebStorageReference } from 'firebase/storage';
import type storage from '@react-native-firebase/storage';
import type { FirebaseStorageTypes } from '@react-native-firebase/storage';

export type NativeStorage = ReturnType<typeof storage>;
export type StorageReference = WebStorageReference | FirebaseStorageTypes.Reference;
export type StorageTaskSnapshot = UploadTaskSnapshot | FirebaseStorageTypes.TaskSnapshot;
let storageInstance: WebStorage | NativeStorage;

const initializeStorage = async () => {
    if (Platform.OS === 'web') {
        const { getStorage } = await import('firebase/storage');
        const { app } = await import('../config/firebase.web');
        storageInstance = getStorage(app);
    } else {
        const storage = await import('@react-native-firebase/storage');
        storageInstance = storage.default();
    }
    return storageInstance;
};

export const ref = (storage: WebStorage | NativeStorage, path: string): StorageReference => {
    if (Platform.OS === 'web') {
        const { ref } = require('firebase/storage');
        return ref(storage || storageInstance as WebStorage, path);
    }
    return (storageInstance as NativeStorage).ref(path);
};


export const uploadBytesResumable = (
    reference: StorageReference,
    data: Uint8Array | Blob | ArrayBuffer,
    metadata?: UploadMetadata | SettableMetadata
): UploadTask | FirebaseStorageTypes.Task => {
    if (Platform.OS === 'web') {
        const { uploadBytesResumable } = require('firebase/storage');
        return uploadBytesResumable(reference as WebStorageReference, data, metadata);
        // const task = uploadBytesResumable(reference as WebStorageReference, data, metadata);
        // task.on('state_changed', (snapshot: StorageTaskSnapshot) => {
        //     console.log('Web upload progress:', snapshot);
        // });
        // task.then((snapshot: StorageTaskSnapshot) => {
        //     console.log('Web upload progress:', snapshot);
        // });
        // return task;
    } else {
        // For mobile, ensure we're using the raw blob
        return (reference as FirebaseStorageTypes.Reference).put(data); // Metadata is not supported
        // const task = (reference as FirebaseStorageTypes.Reference).put(data); // Metadata is not supported
        // task.on('state_changed', snapshot => {
        //     console.log('Mobile upload progress:', snapshot);
        // });
        // task.then((snapshot: StorageTaskSnapshot) => {
        //     console.log('Mobile upload progress then:', snapshot);
        // });
        // return task;
    }
};

export const uploadBytes = async (reference: StorageReference, data: Uint8Array, metadata?: UploadMetadata | SettableMetadata): Promise<void> => {
    if (Platform.OS === 'web') {
        const { uploadBytes } = await import('firebase/storage');
        await uploadBytes(reference as WebStorageReference, data, metadata);
    } else {
        const blob = new Blob([data]);
        await (reference as FirebaseStorageTypes.Reference).put(blob);
    }
};

export const getDownloadURL = async (reference: StorageReference): Promise<string> => {
    if (Platform.OS === 'web') {
        const { getDownloadURL } = await import('firebase/storage');
        return getDownloadURL(reference as WebStorageReference);
    }
    return (reference as FirebaseStorageTypes.Reference).getDownloadURL();
};

export const deleteObject = async (reference: StorageReference): Promise<void> => {
    if (Platform.OS === 'web') {
        const { deleteObject } = await import('firebase/storage');
        await deleteObject(reference as WebStorageReference);
    } else {
        await (reference as FirebaseStorageTypes.Reference).delete();
    }
};

export const listAll = async (reference: StorageReference) => {
    if (Platform.OS === 'web') {
        const { listAll } = await import('firebase/storage');
        return listAll(reference as WebStorageReference);
    }
    return (reference as FirebaseStorageTypes.Reference).listAll();
};

export const getBytes = async (reference: StorageReference): Promise<ArrayBuffer> => {
    if (Platform.OS === 'web') {
        const { getBytes } = require('firebase/storage');
        return getBytes(reference as WebStorageReference);
    } else {
        try {
            // Get download URL and fetch the data
            const url = await (reference as FirebaseStorageTypes.Reference).getDownloadURL();
            const response = await fetch(url);
            return response.arrayBuffer();
        } catch (error) {
            console.error('getBytes error', error);
            return Promise.reject(error);
        }
    }
};

export const getBlob = async (reference: StorageReference): Promise<Blob> => {
    if (Platform.OS === 'web') {
        const { getBlob } = require('firebase/storage');
        return getBlob(reference as WebStorageReference);
    } else {
        try {
            // Get download URL and fetch the data
            const url = await (reference as FirebaseStorageTypes.Reference).getDownloadURL();
            const response = await fetch(url);
            return response.blob();
        } catch (error) {
            console.log('getBytes error', error);
            return Promise.reject(error);
        }
    }
};

// Initialize storage on import
initializeStorage();

export { storageInstance as storage };
