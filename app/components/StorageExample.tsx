import { useState } from 'react';
import { Button, Platform, Text, View } from 'react-native';
import { storage, ref, uploadBytesResumable } from '../firebase';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export default function StorageExample() {
    const [fileData, setFileData] = useState<string | Uint8Array | ArrayBuffer | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [downloadURL, setDownloadURL] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<any | null>(null);


    const selectFile = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'image/*',
            copyToCacheDirectory: true,
        });
        console.log(result);
        if (!result.canceled) {
            // setFileData(result.uri);
            const file = result.assets[0];
            console.log('file file', file);

            if (Platform.OS === 'web') {
                // For web - convert base64 to Uint8Array
                // const base64 = file.uri.split(',')[1]; // Remove the data:image/png;base64, prefix
                // const binaryString = atob(base64);
                // const bytes = new Uint8Array(binaryString.length);
                // for (let i = 0; i < binaryString.length; i++) {
                //     bytes[i] = binaryString.charCodeAt(i);
                // }
                // setFileData(bytes);

                setFileData(file.uri);
            } else {
                // For mobile - convert file URI to Uint8Array
                const fileUri = file.uri;
                const fileData = await FileSystem.readAsStringAsync(fileUri, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                // const bytes = new Uint8Array(fileData.length);
                // for (let i = 0; i < fileData.length; i++) {
                //     bytes[i] = fileData.charCodeAt(i);
                // }
                // setFileData(bytes);
                setFileData(fileData);
            }

            // const response = await fetch(data.uri);
            // console.log('file data to response', response);
            // const arrayBuffer = await response.arrayBuffer();
            // console.log('file data to arrayBuffer', arrayBuffer);
            // const uint8Array = new Uint8Array(arrayBuffer);
            // console.log('file data to uint8Array', uint8Array);
            // setFileData(uint8Array);

            setFileName(file.name);

            const metadata = {
                contentType: file.mimeType,
                size: file.size,
            };
            setMetadata(metadata);

        }
    }

    const uploadFile = async () => {
        if (!fileName || !fileData) {
            console.log('No file name or file data fileData', fileData);
            console.log('No file name or file data fileName', fileName);
            return;
        }
        const storageRef = ref(storage, 'images/' + new Date().getTime() + fileName);
        console.log('storageRef', storageRef);
        const uploadTask = uploadBytesResumable(
            storageRef,
            // fileData as Uint8Array,
            decode(fileData as string),
            metadata);
        uploadTask.on('state_changed', (snapshot) => {
            console.log('Uploading file: on state changed', snapshot);
        });
        uploadTask.then((snapshot) => {
            console.log('Uploaded file: then', snapshot?.state);
        });
    }

    return (
        <View>
            <Button title="Set File Data" onPress={() => selectFile()} />
            <Button title="Upload File" onPress={uploadFile} />
        </View>
    )
}
