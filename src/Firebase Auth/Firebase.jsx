// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  onAuthStateChanged, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBgJGytsQvvYIEwNgbIbogkjcHZAwHzb8",
  authDomain: "properties-a2d2b.firebaseapp.com",
  projectId: "properties-a2d2b",
  storageBucket: "properties-a2d2b.firebasestorage.app",
  messagingSenderId: "546687848025",
  appId: "1:546687848025:web:783fefc052108b80206b48",
  measurementId: "G-J5VRQ6NBK3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);
const db = getFirestore(app); // Initialize Firestore

// Configure Google provider (optional)
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// ==================== USER MANAGEMENT ====================

// Create user profile in Firestore after successful authentication
export const createUserProfile = async (user, additionalData = {}) => {
  if (!user) return null;
  
  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        firstName: additionalData.firstName || '',
        lastName: additionalData.lastName || '',
        primaryPhone: additionalData.primaryPhone || '',
        whatsappPhone: additionalData.whatsappPhone || '',
        alternateEmail: additionalData.alternateEmail || '',
        profileImage: additionalData.profileImage || '',
        isRealEstateProfessional: additionalData.isRealEstateProfessional || false,
        // Company information
        companyName: additionalData.companyName || '',
        companyPhone: additionalData.companyPhone || '',
        category: additionalData.category || '',
        website: additionalData.website || '',
        country: additionalData.country || 'Nigeria',
        state: additionalData.state || '',
        city: additionalData.city || '',
        address: additionalData.address || '',
        aboutUs: additionalData.aboutUs || '',
        // Metadata
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
        productCount: 0
      };
      
      await setDoc(userDocRef, userData);
      console.log('User profile created successfully');
      return userData;
    } else {
      console.log('User profile already exists');
      return userDoc.data();
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Get user profile from Firestore
export const getUserProfile = async (userId) => {
  if (!userId) return null;
  
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      console.log('User profile not found');
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile in Firestore
export const updateUserProfile = async (userId, profileData) => {
  if (!userId) return null;
  
  try {
    const userDocRef = doc(db, 'users', userId);
    const updateData = {
      ...profileData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(userDocRef, updateData);
    console.log('User profile updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// ==================== PRODUCT MANAGEMENT ====================

// Add a new product
export const addProduct = async (productData) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  
  try {
    const product = {
      ...productData,
      userId: user.uid,
      userEmail: user.email,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
      views: 0,
      likes: 0,
      inquiries: 0
    };
    
    const docRef = await addDoc(collection(db, 'products'), product);
    
    // Update user's product count
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      productCount: increment(1),
      updatedAt: serverTimestamp()
    });
    
    console.log('Product added with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

// Get all products for a specific user
export const getUserProducts = async (userId) => {
  if (!userId) return [];
  
  try {
    const q = query(
      collection(db, 'products'),
      where('userId', '==', userId),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const products = [];
    
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return products;
  } catch (error) {
    console.error('Error getting user products:', error);
    throw error;
  }
};

// Get all products (public view)
export const getAllProducts = async (limitCount = 20) => {
  try {
    const q = query(
      collection(db, 'products'),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const products = [];
    
    querySnapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return products;
  } catch (error) {
    console.error('Error getting all products:', error);
    throw error;
  }
};

// Update a product
export const updateProduct = async (productId, productData) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  
  try {
    const productDocRef = doc(db, 'products', productId);
    
    // First, verify the product belongs to the current user
    const productDoc = await getDoc(productDocRef);
    if (!productDoc.exists()) {
      throw new Error('Product not found');
    }
    
    const productInfo = productDoc.data();
    if (productInfo.userId !== user.uid) {
      throw new Error('Unauthorized to update this product');
    }
    
    const updateData = {
      ...productData,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(productDocRef, updateData);
    console.log('Product updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete a product (soft delete)
export const deleteProduct = async (productId) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  
  try {
    const productDocRef = doc(db, 'products', productId);
    
    // First, verify the product belongs to the current user
    const productDoc = await getDoc(productDocRef);
    if (!productDoc.exists()) {
      throw new Error('Product not found');
    }
    
    const productInfo = productDoc.data();
    if (productInfo.userId !== user.uid) {
      throw new Error('Unauthorized to delete this product');
    }
    
    // Soft delete - mark as inactive
    await updateDoc(productDocRef, {
      isActive: false,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Update user's product count
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      productCount: increment(-1),
      updatedAt: serverTimestamp()
    });
    
    console.log('Product deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Permanently delete a product
export const permanentlyDeleteProduct = async (productId) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  
  try {
    const productDocRef = doc(db, 'products', productId);
    
    // First, verify the product belongs to the current user
    const productDoc = await getDoc(productDocRef);
    if (!productDoc.exists()) {
      throw new Error('Product not found');
    }
    
    const productInfo = productDoc.data();
    if (productInfo.userId !== user.uid) {
      throw new Error('Unauthorized to delete this product');
    }
    
    // Delete all associated images from storage
    if (productInfo.images && productInfo.images.length > 0) {
      const deletePromises = productInfo.images.map(imageUrl => 
        deleteImageFromStorage(imageUrl)
      );
      await Promise.all(deletePromises);
    }
    
    // Permanently delete the document
    await deleteDoc(productDocRef);
    
    // Update user's product count
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      productCount: increment(-1),
      updatedAt: serverTimestamp()
    });
    
    console.log('Product permanently deleted');
    return true;
  } catch (error) {
    console.error('Error permanently deleting product:', error);
    throw error;
  }
};

// Get a single product by ID
export const getProduct = async (productId) => {
  try {
    const productDocRef = doc(db, 'products', productId);
    const productDoc = await getDoc(productDocRef);
    
    if (productDoc.exists()) {
      return {
        id: productDoc.id,
        ...productDoc.data()
      };
    } else {
      console.log('Product not found');
      return null;
    }
  } catch (error) {
    console.error('Error getting product:', error);
    throw error;
  }
};

// Increment product views
export const incrementProductViews = async (productId) => {
  try {
    const productDocRef = doc(db, 'products', productId);
    await updateDoc(productDocRef, {
      views: increment(1),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error incrementing product views:', error);
    throw error;
  }
};

// ==================== ENHANCED AUTHENTICATION ====================

// Enhanced sign up with email and password (creates Firestore profile)
export const signUpWithEmail = async (email, password, additionalData = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update display name if provided
    if (additionalData.displayName) {
      await updateProfile(user, { displayName: additionalData.displayName });
    }
    
    // Create user profile in Firestore
    await createUserProfile(user, additionalData);
    
    console.log("User signed up successfully:", user);
    return user;
  } catch (error) {
    console.error("Error signing up:", error);
    throw error;
  }
};

// Enhanced sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Ensure user profile exists in Firestore
    await createUserProfile(user);
    
    console.log("User signed in:", user);
    return user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

// Enhanced Google sign in
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Create user profile in Firestore if it doesn't exist
    await createUserProfile(user);
    
    console.log("User signed in:", user);
    return user;
  } catch (error) {
    console.error("Error signing in:", error);
    throw error;
  }
};

// ==================== EXISTING FUNCTIONS ====================

// Sign in with redirect
export const signInWithGoogleRedirect = () => {
  signInWithRedirect(auth, googleProvider);
};

// Handle redirect result
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      await createUserProfile(user);
      console.log("User signed in through redirect:", user);
      return user;
    }
  } catch (error) {
    console.error("Error handling redirect:", error);
    throw error;
  }
};

// Listen to auth state changes
export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("Auth state changed: User is signed in", user);
    } else {
      console.log("Auth state changed: User is signed out");
    }
    callback(user);
  });
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Enhanced uploadImage function with progress tracking and metadata
export const uploadImage = async (file, progressCallback = null) => {
  if (!file || !auth.currentUser) return null;
  
  const user = auth.currentUser;
  const storage = getStorage();
  const storageRef = ref(storage, `product-images/${user.uid}/${Date.now()}_${file.name}`);
  
  const metadata = {
    contentType: file.type,
    customMetadata: {
      'originalName': file.name,
      'uploadedBy': user.uid,
      'uploadedAt': new Date().toISOString()
    }
  };
  
  try {
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
    if (progressCallback && typeof progressCallback === 'function') {
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          progressCallback(progress);
        }
      );
    }
    
    const snapshot = await uploadTask;
    const downloadURL = await getDownloadURL(snapshot.ref);
    return {
      url: downloadURL,
      path: snapshot.ref.fullPath,
      name: file.name,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    
    if (error.code) {
      switch (error.code) {
        case 'storage/unauthorized':
          throw new Error('You do not have permission to upload files');
        case 'storage/canceled':
          throw new Error('Upload was canceled');
        case 'storage/quota-exceeded':
          throw new Error('Storage quota exceeded. Please contact support.');
        case 'storage/retry-limit-exceeded':
          throw new Error('Upload failed after multiple attempts. Please check your connection.');
        default:
          throw new Error(`Upload failed: ${error.message}`);
      }
    }
    
    throw error;
  }
};

// Enhanced function to upload multiple images
export const uploadMultipleImages = async (files, progressCallback = null) => {
  if (!files || !files.length || !auth.currentUser) return [];
  
  const results = [];
  const totalFiles = files.length;
  let overallProgress = 0;
  
  try {
    const uploadPromises = files.map((file, index) => {
      return uploadImage(
        file, 
        (fileProgress) => {
          const individualContribution = fileProgress / totalFiles;
          const previousFileContributions = (index / totalFiles) * 100;
          overallProgress = previousFileContributions + individualContribution;
          
          if (progressCallback) {
            progressCallback(Math.round(overallProgress));
          }
        }
      );
    });
    
    const uploadResults = await Promise.all(uploadPromises);
    results.push(...uploadResults.map(result => result.url));
    
    return results;
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw error;
  } finally {
    if (progressCallback) {
      progressCallback(100);
    }
  }
};

// Function to delete images from storage
export const deleteImageFromStorage = async (imageUrl) => {
  try {
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error("User not authenticated");
    }
    
    const storage = getStorage();
    const imageRef = ref(storage, imageUrl);
    await deleteObject(imageRef);
    
    console.log(`Deleted image: ${imageUrl}`);
    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

// Export all instances and functions
export { 
  auth, 
  storage,
  db,
  updateProfile,
  ref,
  deleteObject,
  createUserWithEmailAndPassword
};

// Add this new function to your Firebase file
export const uploadProfileImage = async (file, progressCallback = null) => {
  if (!file || !auth.currentUser) return null;
  
  const user = auth.currentUser;
  const storageRef = ref(storage, `profile-images/${user.uid}/${Date.now()}_${file.name}`);
  
  const metadata = {
    contentType: file.type,
    customMetadata: {
      'originalName': file.name,
      'uploadedBy': user.uid,
      'uploadedAt': new Date().toISOString()
    }
  };
  
  try {
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);
    
    return new Promise((resolve, reject) => {
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (progressCallback) progressCallback(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadURL,
              path: uploadTask.snapshot.ref.fullPath
            });
          } catch (error) {
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
};