import { useState } from 'react';
import { Button, Clipboard, Platform, Text, View } from 'react-native';
import {
    getBlob,
    getBytes,
    getDownloadURL, storage, ref as storageRef, StorageTaskSnapshot, uploadBytes, uploadBytesResumable
} from '../firebase';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker'
// import { getBytes, StorageReference } from 'firebase/storage';

import firebaseStorage, { FirebaseStorageTypes } from '@react-native-firebase/storage';
import { UploadTaskSnapshot } from 'firebase/storage';

// import storage from '@react-native-firebase/storage';

export default function StorageExample() {
    const [fileData, setFileData] = useState<any | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [downloadURL, setDownloadURL] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<any | null>(null);
    const [nativeFilePath, setNativeFilePath] = useState<string | null>(null);
    const [image, setImage] = useState<any | null>(null)

    const [downloading, setDownloading] = useState(false)
    const [downloadProgress, setDownloadProgress] = useState(0)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploading, setUploading] = useState(false)

    const [downloadingURL, setDownloadingURL] = useState<string | null>(null)

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        // const result = await DocumentPicker.getDocumentAsync({
        //     type: '*/*',
        //     copyToCacheDirectory: true,
        // });
        console.log('pickImage result', result)

        const file = result?.assets?.[0]
        const source = { uri: file?.uri }
        console.log(source)

        const fileName = file?.uri.split('/').pop()
        setImage(source as DocumentPicker.DocumentPickerAsset | ImagePicker.ImagePickerAsset)
        setFileName(fileName || null)
        setFileData(file || null)
    };


    const uploadFile = async () => {
        if (!image?.uri) {
            console.log('No image uri');
            return;
        }

        try {
            const response = await fetch(image?.uri as string)
            const arrayBuffer = await response.arrayBuffer()
            console.log('uploadImage arrayBuffer length', arrayBuffer.byteLength)

            console.log('uploadImage fileName', fileName)

            const metadata = {
                contentType: fileData?.mimeType,
                // cacheControl: 'no-cache',
            }

            console.log('uploadImage metadata', metadata)

            const ref = storageRef(storage, `files/${Date.now()}-${fileName}`);
            console.log('uploadImage ref', ref)
            const task = uploadBytesResumable(
                ref,
                arrayBuffer as ArrayBuffer,
                metadata
            );

            task.on('state_changed', (snapshot: StorageTaskSnapshot) => {
                console.log('Uploading file: on state changed', snapshot);
            });

            task.then((snapshot: StorageTaskSnapshot) => {
                console.log('Uploading file: then', snapshot);
                getDownloadURL(ref).then((url) => {
                    console.log('getDownloadURL url', url)
                    setDownloadingURL(url)
                })
            });
        } catch (error) {
            console.error('Error uploading file:', error);
        }
    }





    return (
        <View>
            <Button title="Set File Data" onPress={() => pickImage()} />
            <Button title="Upload File" onPress={() => uploadFile()} />
            <Text>Latest Download URL: {downloadingURL}</Text>
            <Button title="Copy to Clipboard" onPress={() => {
                Clipboard.setString(downloadingURL || '')
            }} />
            <Button title="Get Bytes" onPress={async () => {
                try {
                    const ref = storageRef(storage, `files/1734241889727-1d0cd6fa-998c-4306-9f3c-c973b2880b82.jpeg`);
                    console.log('ref', ref);
                    const bytes = await getBytes(ref);

                    // Convert ArrayBuffer to Uint8Array to see actual bytes
                    const uint8Array = new Uint8Array(bytes);
                    console.log('First 20 bytes:', Array.from(uint8Array.slice(0, 20)));
                    console.log('Total bytes length:', bytes.byteLength);

                    // If you need base64
                    const base64 = btoa(
                        Array.from(uint8Array)
                            .map(byte => String.fromCharCode(byte))
                            .join('')
                    );
                    console.log('Base64 preview:', base64.substring(0, 50) + '...');

                } catch (error) {
                    console.error('Error getting bytes:', error);
                }
            }} />
            <Button title="Get Blob" onPress={() => {
                const ref = storageRef(storage, `files/1734241889727-1d0cd6fa-998c-4306-9f3c-c973b2880b82.jpeg`);
                console.log('ref', ref)
                getBlob(ref).then((blob: Blob) => {
                    console.log('getBlob blob', blob)
                })
            }} />
        </View>
    )
}
