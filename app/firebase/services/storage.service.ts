import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

let storage: any;
const initialize = async () => {
    const { app } = await import('../config/firebase.web');
    storage = getStorage(app);
};

initialize();

export { storage, ref, uploadBytesResumable, getDownloadURL };
