// Import Firestore functions
import { 
    getFirestore, 
    collection, 
    doc, 
    addDoc, 
    setDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    startAfter, 
    onSnapshot,
    serverTimestamp,
    arrayUnion,
    arrayRemove,
    increment,
    writeBatch,
    runTransaction, 
} from "firebase/firestore";

// Import Firebase Storage functions
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    uploadBytesResumable, 
    getDownloadURL, 
    deleteObject,
    listAll
} from "firebase/storage";

// Import auth from your existing firebase config
import { auth, getCurrentUser } from "./Firebase"; // Update path as needed

// Initialize Firestore and Storage
const db = getFirestore();
const storage = getStorage();

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// Generate unique filename
const generateUniqueFilename = (originalName) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${timestamp}_${randomString}.${extension}`;
};

// Get current user ID
const getCurrentUserId = () => {
    const user = getCurrentUser();
    if (!user) {
        throw new Error("User not authenticated. Please sign in first.");
    }
    return user.uid;
};

// Validate user authentication
const validateAuth = () => {
    const user = getCurrentUser();
    if (!user) {
        throw new Error("Authentication required. Please sign in to continue.");
    }
    return user;
};

// Validate file type
const validateFileType = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return allowedTypes.includes(file.type.toLowerCase());
};

// Validate file size (max 10MB)
const validateFileSize = (file, maxSizeMB = 10) => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
};

// ===========================================
// IMAGE UPLOAD FUNCTIONS
// ===========================================

// Upload single image
export const uploadSingleImage = async (file, folder = 'properties', onProgress = null) => {
    try {
        if (!file) {
            throw new Error('No file provided');
        }

        // Validate file
        if (!validateFileType(file)) {
            throw new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.');
        }

        if (!validateFileSize(file)) {
            throw new Error('File size too large. Maximum size is 10MB.');
        }

        const user = validateAuth();
        const uniqueFilename = generateUniqueFilename(file.name);
        const imagePath = `${folder}/${user.uid}/${uniqueFilename}`;
        const imageRef = ref(storage, imagePath);

        // Upload with progress tracking
        const uploadTask = uploadBytesResumable(imageRef, file);

        return new Promise((resolve, reject) => {
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    if (onProgress) {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        onProgress(progress);
                    }
                },
                (error) => {
                    console.error('Upload error:', error);
                    reject(new Error(`Upload failed: ${error.message}`));
                },
                async () => {
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve({
                            url: downloadURL,
                            path: imagePath,
                            name: file.name,
                            size: file.size,
                            type: file.type
                        });
                    } catch (error) {
                        reject(new Error(`Failed to get download URL: ${error.message}`));
                    }
                }
            );
        });
    } catch (error) {
        console.error('Error uploading single image:', error);
        throw error;
    }
};

// Upload multiple images
export const uploadMultipleImages = async (files, onProgress = null) => {
    try {
        if (!files || files.length === 0) {
            throw new Error('No files provided');
        }

        const user = validateAuth();
        const uploadPromises = [];
        let completedUploads = 0;
        const totalFiles = files.length;

        // Create upload promises for each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            const uploadPromise = uploadSingleImage(
                file, 
                'properties', 
                (fileProgress) => {
                    // Calculate overall progress
                    if (onProgress) {
                        const overallProgress = ((completedUploads * 100) + fileProgress) / totalFiles;
                        onProgress(Math.round(overallProgress));
                    }
                }
            ).then((result) => {
                completedUploads++;
                return result;
            });

            uploadPromises.push(uploadPromise);
        }

        // Wait for all uploads to complete
        const results = await Promise.all(uploadPromises);
        
        // Return just the URLs array for backward compatibility
        return results.map(result => result.url);
    } catch (error) {
        console.error('Error uploading multiple images:', error);
        throw error;
    }
};

// Delete image from storage
export const deleteImage = async (imagePath) => {
    try {
        const imageRef = ref(storage, imagePath);
        await deleteObject(imageRef);
        console.log('Image deleted successfully:', imagePath);
        return true;
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
};

// Delete multiple images
export const deleteMultipleImages = async (imagePaths) => {
    try {
        const deletePromises = imagePaths.map(path => deleteImage(path));
        await Promise.all(deletePromises);
        console.log('Multiple images deleted successfully');
        return true;
    } catch (error) {
        console.error('Error deleting multiple images:', error);
        throw error;
    }
};

// ===========================================
// USER PROFILE OPERATIONS
// ===========================================

// Create or update user profile
export const createUserProfile = async (profileData) => {
    try {
        const user = validateAuth();
        const userRef = doc(db, "users", user.uid);
        
        const userData = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || profileData.displayName || "",
            photoURL: user.photoURL || profileData.photoURL || "",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            favorites: [],
            ...profileData
        };
        
        await setDoc(userRef, userData, { merge: true });
        console.log("User profile created/updated successfully");
        return userData;
    } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
    }
};

// Get user profile
export const getUserProfile = async (userId = null) => {
    try {
        const targetUserId = userId || getCurrentUserId();
        const userRef = doc(db, "users", targetUserId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
            return { id: userSnap.id, ...userSnap.data() };
        } else {
            throw new Error("User profile not found");
        }
    } catch (error) {
        console.error("Error getting user profile:", error);
        throw error;
    }
};

// Update user profile
export const updateUserProfile = async (updateData) => {
    try {
        const userId = getCurrentUserId();
        const userRef = doc(db, "users", userId);
        
        const updatedData = {
            ...updateData,
            updatedAt: serverTimestamp()
        };
        
        await updateDoc(userRef, updatedData);
        console.log("User profile updated successfully");
        return updatedData;
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
};

// ===========================================
// PROPERTIES/LISTINGS OPERATIONS
// ===========================================

// Create a new property/listing
export const createProperty = async (propertyData) => {
    try {
        const user = validateAuth();
        const propertiesRef = collection(db, "properties");
        
        const property = {
            ...propertyData,
            ownerId: user.uid,
            ownerEmail: user.email,
            ownerName: user.displayName || "Anonymous",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: propertyData.status || "active",
            views: 0,
            favorites: 0,
            // Ensure images is always an array
            images: Array.isArray(propertyData.images) ? propertyData.images : []
        };
        
        const docRef = await addDoc(propertiesRef, property);
        console.log("Property created with ID:", docRef.id);
        return { id: docRef.id, ...property };
    } catch (error) {
        console.error("Error creating property:", error);
        throw error;
    }
};

// Get all properties with optional filtering
export const getProperties = async (filters = {}) => {
    try {
        let propertiesQuery = collection(db, "properties");
        
        // Build query based on filters
        const queryConstraints = [];
        
        if (filters.ownerId) {
            queryConstraints.push(where("ownerId", "==", filters.ownerId));
        }
        
        if (filters.status) {
            queryConstraints.push(where("status", "==", filters.status));
        }
        
        if (filters.propertyType) {
            queryConstraints.push(where("propertyType", "==", filters.propertyType));
        }
        
        if (filters.minPrice) {
            queryConstraints.push(where("price", ">=", filters.minPrice));
        }
        
        if (filters.maxPrice) {
            queryConstraints.push(where("price", "<=", filters.maxPrice));
        }
        
        if (filters.city) {
            queryConstraints.push(where("city", "==", filters.city));
        }
        
        if (filters.state) {
            queryConstraints.push(where("state", "==", filters.state));
        }
        
        if (filters.country) {
            queryConstraints.push(where("country", "==", filters.country));
        }
        
        // Add ordering
        if (filters.orderBy) {
            queryConstraints.push(orderBy(filters.orderBy, filters.orderDirection || "desc"));
        } else {
            queryConstraints.push(orderBy("createdAt", "desc"));
        }
        
        // Add limit
        if (filters.limit) {
            queryConstraints.push(limit(filters.limit));
        }
        
        // Add pagination
        if (filters.startAfter) {
            queryConstraints.push(startAfter(filters.startAfter));
        }
        
        propertiesQuery = query(propertiesQuery, ...queryConstraints);
        
        const querySnapshot = await getDocs(propertiesQuery);
        const properties = [];
        
        querySnapshot.forEach((doc) => {
            properties.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`Retrieved ${properties.length} properties`);
        return properties;
    } catch (error) {
        console.error("Error getting properties:", error);
        throw error;
    }
};

export const getUserPropertyCount = async (includeStats = false) => {
    try {
        const user = getCurrentUser();
        if (!user?.uid) {
            throw new Error('User not authenticated');
        }

        const db = getFirestore();
        const userPropertiesCollection = collection(db, 'users', user.uid, 'properties');
        
        if (!includeStats) {
            // Simple count
            const querySnapshot = await getDocs(userPropertiesCollection);
            return querySnapshot.size;
        }
        
        // Get detailed stats
        const querySnapshot = await getDocs(userPropertiesCollection);
        let total = 0;
        let active = 0;
        let inactive = 0;
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            total++;
            
            if (data.status === 'active') {
                active++;
            } else {
                inactive++;
            }
        });
        
        return { total, active, inactive };
    } catch (error) {
        console.error('Error fetching property count:', error);
        throw error;
    }
};

// Get current user's properties
export const getUserProperties = async (includeInactive = false, sortBy = 'createdAt', sortOrder = 'desc') => {
    try {
        const user = getCurrentUser();
        if (!user?.uid) {
            throw new Error('User not authenticated');
        }

        const db = getFirestore();
        
        // Query the user's properties subcollection (simple query to avoid index issues)
        const userPropertiesCollection = collection(db, 'users', user.uid, 'properties');
        
        // Use simple query with just sorting to avoid composite index requirement
        const q = query(userPropertiesCollection, orderBy(sortBy, sortOrder));
        const querySnapshot = await getDocs(q);
        
        const properties = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Client-side filtering for status if needed
            if (!includeInactive && data.status !== 'active') {
                return; // Skip inactive properties
            }
            
            // Calculate days since created
            let daysSinceCreated = 0;
            if (data.createdAt) {
                const createdDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                const now = new Date();
                daysSinceCreated = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
            }
            
            properties.push({
                id: doc.id,
                ...data,
                daysSinceCreated
            });
        });
        
        // Client-side sorting if sortBy is not 'createdAt' (since we already sorted by it in query)
        if (sortBy !== 'createdAt') {
            properties.sort((a, b) => {
                let aValue = a[sortBy];
                let bValue = b[sortBy];
                
                // Handle different data types
                if (typeof aValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }
                
                if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }
        
        return properties;
    } catch (error) {
        console.error('Error fetching user properties:', error);
        throw error;
    }
}

// Get single property by ID
export const getProperty = async (propertyId) => {
    try {
        const propertyRef = doc(db, "properties", propertyId);
        const propertySnap = await getDoc(propertyRef);
        
        if (propertySnap.exists()) {
            return { id: propertySnap.id, ...propertySnap.data() };
        } else {
            throw new Error("Property not found");
        }
    } catch (error) {
        console.error("Error getting property:", error);
        throw error;
    }
};

// Update property
export const updateProperty = async (propertyId, updateData) => {
    try {
        const userId = getCurrentUserId();
        const propertyRef = doc(db, "properties", propertyId);
        
        // First check if user owns this property
        const propertySnap = await getDoc(propertyRef);
        if (!propertySnap.exists()) {
            throw new Error("Property not found");
        }
        
        const propertyData = propertySnap.data();
        if (propertyData.ownerId !== userId) {
            throw new Error("You don't have permission to update this property");
        }
        
        const updatedData = {
            ...updateData,
            updatedAt: serverTimestamp(),
            // Ensure images is always an array
            images: Array.isArray(updateData.images) ? updateData.images : (updateData.images ? [updateData.images] : [])
        };
        
        await updateDoc(propertyRef, updatedData);
        console.log("Property updated successfully");
        return { id: propertyId, ...updatedData };
    } catch (error) {
        console.error("Error updating property:", error);
        throw error;
    }
};

// Delete property (and its images)
export const deleteProperty = async (propertyId) => {
    try {
        const user = getCurrentUser();
        if (!user?.uid) {
            throw new Error('User not authenticated');
        }

        if (!propertyId) {
            throw new Error('Property ID is required');
        }

        const db = getFirestore();
        
        // Reference to the specific property in user's subcollection
        const propertyRef = doc(db, 'users', user.uid, 'properties', propertyId);
        
        // Check if property exists and belongs to user
        const propertyDoc = await getDoc(propertyRef);
        if (!propertyDoc.exists()) {
            throw new Error('Property not found');
        }
        
        const propertyData = propertyDoc.data();
        if (propertyData.userId !== user.uid) {
            throw new Error('You do not have permission to delete this property');
        }
        
        // Delete the property
        await deleteDoc(propertyRef);
        
        return { success: true, message: 'Property deleted successfully' };
    } catch (error) {
        console.error('Error deleting property:', error);
        throw error;
    }
};


// Subscribe to all properties changes
export const subscribeToProperties = (callback, filters = {}) => {
    try {
        let q = collection(db, "properties");
        
        const queryConstraints = [];
        
        if (filters.status) {
            queryConstraints.push(where("status", "==", filters.status));
        } else {
            queryConstraints.push(where("status", "==", "active"));
        }
        
        queryConstraints.push(orderBy("createdAt", "desc"));
        
        if (filters.limit) {
            queryConstraints.push(limit(filters.limit));
        }
        
        q = query(q, ...queryConstraints);
        
        return onSnapshot(q, (querySnapshot) => {
            const properties = [];
            querySnapshot.forEach((doc) => {
                properties.push({ id: doc.id, ...doc.data() });
            });
            callback(properties);
        });
    } catch (error) {
        console.error("Error setting up properties subscription:", error);
        throw error;
    }
};

// ===========================================
// BATCH OPERATIONS
// ===========================================

// Update multiple properties at once
export const batchUpdateProperties = async (updates) => {
    try {
        const userId = getCurrentUserId();
        const batch = writeBatch(db);
        
        for (const update of updates) {
            const { propertyId, data } = update;
            const propertyRef = doc(db, "properties", propertyId);
            
            // Verify ownership
            const propertySnap = await getDoc(propertyRef);
            if (!propertySnap.exists() || propertySnap.data().ownerId !== userId) {
                throw new Error(`You don't have permission to update property ${propertyId}`);
            }
            
            batch.update(propertyRef, {
                ...data,
                updatedAt: serverTimestamp()
            });
        }
        
        await batch.commit();
        console.log("Batch update completed successfully");
        return true;
    } catch (error) {
        console.error("Error in batch update:", error);
        throw error;
    }
};



// ===========================================
// ANALYTICS & TRACKING
// ===========================================

// Increment property view count
export const incrementPropertyViews = async (propertyId) => {
    try {
        const propertyRef = doc(db, "properties", propertyId);
        await updateDoc(propertyRef, {
            views: increment(1),
            lastViewed: serverTimestamp()
        });
        
        return true;
    } catch (error) {
        console.error("Error incrementing property views:", error);
        throw error;
    }
};

// Get property analytics
export const getPropertyAnalytics = async (propertyId) => {
    try {
        const userId = getCurrentUserId();
        const propertyRef = doc(db, "properties", propertyId);
        const propertySnap = await getDoc(propertyRef);
        
        if (!propertySnap.exists()) {
            throw new Error("Property not found");
        }
        
        const propertyData = propertySnap.data();
        if (propertyData.ownerId !== userId) {
            throw new Error("You don't have permission to view analytics for this property");
        }
        
        return {
            views: propertyData.views || 0,
            favorites: propertyData.favorites || 0,
            lastViewed: propertyData.lastViewed,
            createdAt: propertyData.createdAt,
            updatedAt: propertyData.updatedAt
        };
    } catch (error) {
        console.error("Error getting property analytics:", error);
        throw error;
    }
};

// ===========================================
// SEARCH FUNCTIONALITY
// ===========================================

// Search properties by text
export const searchProperties = async (searchTerm, filters = {}) => {
    try {
        let q = collection(db, "properties");
        
        const queryConstraints = [];
        
        // Add status filter (default to active)
        queryConstraints.push(where("status", "==", filters.status || "active"));
        
        // Add other filters
        if (filters.propertyType) {
            queryConstraints.push(where("propertyType", "==", filters.propertyType));
        }
        
        if (filters.minPrice && filters.maxPrice) {
            queryConstraints.push(where("price", ">=", filters.minPrice));
            queryConstraints.push(where("price", "<=", filters.maxPrice));
        } else if (filters.minPrice) {
            queryConstraints.push(where("price", ">=", filters.minPrice));
        } else if (filters.maxPrice) {
            queryConstraints.push(where("price", "<=", filters.maxPrice));
        }
        
        if (filters.city) {
            queryConstraints.push(where("city", "==", filters.city));
        }
        
        if (filters.state) {
            queryConstraints.push(where("state", "==", filters.state));
        }
        
        // Add ordering
        queryConstraints.push(orderBy("createdAt", "desc"));
        
        // Add limit
        if (filters.limit) {
            queryConstraints.push(limit(filters.limit));
        }
        
        q = query(q, ...queryConstraints);
        
        const querySnapshot = await getDocs(q);
        const properties = [];
        
        querySnapshot.forEach((doc) => {
            const property = { id: doc.id, ...doc.data() };
            
            // Basic text search in title, description, and location
            if (searchTerm) {
                const searchTermLower = searchTerm.toLowerCase();
                const titleMatch = property.title?.toLowerCase().includes(searchTermLower);
                const descMatch = property.description?.toLowerCase().includes(searchTermLower);
                const locationMatch = property.location?.toLowerCase().includes(searchTermLower);
                const addressMatch = property.address?.toLowerCase().includes(searchTermLower);
                
                if (titleMatch || descMatch || locationMatch || addressMatch) {
                    properties.push(property);
                }
            } else {
                properties.push(property);
            }
        });
        
        return properties;
    } catch (error) {
        console.error("Error searching properties:", error);
        throw error;
    }
};

// Get properties by location
export const getPropertiesByLocation = async (city, state = null, country = null) => {
    try {
        const filters = { city, status: "active" };
        if (state) filters.state = state;
        if (country) filters.country = country;
        
        return await getProperties(filters);
    } catch (error) {
        console.error("Error getting properties by location:", error);
        throw error;
    }
};

// Get properties by price range
export const getPropertiesByPriceRange = async (minPrice, maxPrice, additionalFilters = {}) => {
    try {
        const filters = {
            minPrice,
            maxPrice,
            status: "active",
            ...additionalFilters
        };
        
        return await getProperties(filters);
    } catch (error) {
        console.error("Error getting properties by price range:", error);
        throw error;
    }
};

// Export the database and storage instances
export { 
    db, 
    storage, 
    serverTimestamp, 
    arrayUnion, 
    arrayRemove, 
    increment,
    // Re-export some Firebase functions for convenience
    uploadBytes,
    uploadBytesResumable,
    getDownloadURL,
    ref
};