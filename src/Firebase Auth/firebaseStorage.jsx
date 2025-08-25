// First, create a Firebase Storage utility file
// utils/firebaseStorage.js

import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject 
} from 'firebase/storage';

export const uploadImageToStorage = async (file, folder = 'properties') => {
    try {
        const storage = getStorage();
        
        // Create unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2);
        const filename = `${timestamp}_${randomString}_${file.name}`;
        
        // Create storage reference
        const storageRef = ref(storage, `${folder}/${filename}`);
        
        // Upload file
        const snapshot = await uploadBytes(storageRef, file);
        
        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        return {
            url: downloadURL,
            path: snapshot.ref.fullPath,
            filename: filename
        };
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
};

export const deleteImageFromStorage = async (imagePath) => {
    try {
        const storage = getStorage();
        const imageRef = ref(storage, imagePath);
        await deleteObject(imageRef);
        return true;
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
};