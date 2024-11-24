export interface FirebaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
}

export const firebaseConfig: FirebaseConfig = {
    apiKey: "AIzaSyC9cQ3IaIRer6U0MFATGH_cYL-tV5By3Ww",
    authDomain: "fir-multplatform.firebaseapp.com",
    projectId: "fir-multplatform",
    storageBucket: "fir-multplatform.firebasestorage.app",
    messagingSenderId: "87568968381",
    appId: "1:87568968381:web:f729a5971bc29f8da7e5d4",
    measurementId: "G-RX2T84KVLV"
};

export default firebaseConfig;
