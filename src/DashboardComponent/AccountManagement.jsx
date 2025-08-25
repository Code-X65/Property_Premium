  import React, { useState, useEffect } from 'react';
  import { Upload, X, User, Camera, Save, AlertCircle, CheckCircle, Home } from 'lucide-react';
  import { 
    auth,
    db,
    storage,
    getCurrentUser,
    subscribeToAuthChanges,
    getUserProfile,
    updateUserProfile,
    uploadImage,
    uploadProfileImage
  } from '../Firebase Auth/Firebase';

  import { 
    doc, 
    collection, 
    setDoc, 
    getDoc,
  }
  from "firebase/firestore";
  import { 
    uploadBytesResumable,
    ref as storageRef
  } from "firebase/storage";
  import { getDownloadURL } from "firebase/storage";
  // Mock Firebase functions for demonstration
  // Replace the entire mockFirebaseFunctions object
  const mockFirebaseFunctions = {
    
    getCurrentUser: () => getCurrentUser(),
    
getUserProfile: async (userId) => {
  try {
    // First check if profile exists in profiles subcollection
    const profileRef = doc(db, 'users', userId, 'profiles', 'userProfile');
    const profileDoc = await getDoc(profileRef);
    
    console.log('Profile document exists:', profileDoc.exists());
    
    if (profileDoc.exists()) {
      const data = profileDoc.data();
      console.log('Profile data from Firestore:', data);
      console.log('Uploaded files from Firestore:', data.uploadedFiles);
      
      // Ensure uploadedFiles structure exists
      if (!data.uploadedFiles) {
        data.uploadedFiles = {
          govtId: null,
          selfiePhoto: null,
          businessCAC: null
        };
      }
      return data;
    } else {
      console.log('No profile document found, creating new structure');
      // Fallback to main user document
      const userProfile = await getUserProfile(userId);
      if (userProfile) {
        // Migrate to new structure
        const profileData = {
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          primaryPhone: userProfile.primaryPhone || '',
          email: userProfile.email || '',
          whatsappPhone: userProfile.whatsappPhone || '',
          alternateEmail: userProfile.alternateEmail || '',
          isRealEstateProfessional: userProfile.isRealEstateProfessional || false,
          profileImage: userProfile.profileImage || '',
          companyName: userProfile.companyName || '',
          companyPhone: userProfile.companyPhone || '',
          category: userProfile.category || '',
          website: userProfile.website || '',
          country: userProfile.country || 'Nigeria',
          state: userProfile.state || '',
          city: userProfile.city || '',
          address: userProfile.address || '',
          aboutUs: userProfile.aboutUs || '',
          // Initialize uploadedFiles structure
          uploadedFiles: {
            govtId: null,
            selfiePhoto: null,
            businessCAC: null
          }
        };
        
        // Save to new structure
        await setDoc(profileRef, profileData);
        console.log('Migrated profile data:', profileData);
        return profileData;
      }
      return null;
    }
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw error;
  }
},
    
updateUserProfile: async (userId, profileData) => {
  try {
    const profileRef = doc(db, 'users', userId, 'profiles', 'userProfile');
    
    // Log what we're trying to save for debugging
    console.log('Saving profile data:', profileData);
    console.log('Uploaded files in save:', profileData.uploadedFiles);
    
    // Ensure uploadedFiles is properly structured for Firestore
    const dataToSave = {
      ...profileData,
      uploadedFiles: profileData.uploadedFiles || {
        govtId: null,
        selfiePhoto: null,
        businessCAC: null
      },
      updatedAt: new Date().toISOString()
    };
    
    console.log('Data being saved to Firestore:', dataToSave);
    
    await setDoc(profileRef, dataToSave, { merge: true });
    console.log('Profile saved successfully to Firestore');
    return true;
    
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    throw error;
  }
},
    
  uploadImage: async (file, progressCallback) => {
      try {
        const result = await uploadProfileImage(file, progressCallback);
        return result;
      } catch (error) {
        console.error('Upload error:', error);
        throw error;
      }
    },
    
    subscribeToAuthChanges: subscribeToAuthChanges
  };

  export default function ManageSubscription() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const requiredDocuments = ['govtId', 'selfiePhoto'];
    const [uploadedFiles, setUploadedFiles] = useState({
  govtId: null,
  selfiePhoto: null,
  businessCAC: null
});
const [validationStatus, setValidationStatus] = useState(false);


    const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      primaryPhone: '',
      email: '',
      whatsappPhone: '',
      alternateEmail: '',
      isRealEstateProfessional: false,
      companyName: '',
      companyPhone: '',
      category: '',
      website: '',
      country: 'Nigeria',
      state: '',
      city: '',
      address: '',
      aboutUs: '',
      profileImage: '' // Add this line
    });

    const [profileImage, setProfileImage] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [errors, setErrors] = useState({});

    // Nigerian states and cities data
    const nigerianStates = [
      'Lagos', 'Abuja', 'Rivers', 'Ogun', 'Kano', 'Kaduna', 'Oyo', 'Delta', 'Edo', 'Anambra'
    ];

    const citiesByState = {
      'Lagos': ['Lagos Island', 'Victoria Island', 'Ikeja', 'Lekki', 'Surulere', 'Yaba'],
      'Abuja': ['Garki', 'Wuse', 'Maitama', 'Gwarinpa', 'Kubwa', 'Nyanya'],
      'Rivers': ['Port Harcourt', 'Obio-Akpor', 'Eleme', 'Ikwerre', 'Oyigbo'],
      'Ogun': ['Abeokuta', 'Sagamu', 'Ijebu-Ode', 'Ota', 'Ilaro']
    };

    useEffect(() => {
      const unsubscribe = mockFirebaseFunctions.subscribeToAuthChanges(async (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          await loadUserProfile(currentUser.uid);
        } else {
          setUser(null);
          setLoading(false);
        }
      });

      return () => unsubscribe();
    }, []);
    useEffect(() => {
  console.log('uploadedFiles state changed:', uploadedFiles);
}, [uploadedFiles]);
// Add this useEffect after the existing useEffects
useEffect(() => {
  // Recheck validation when isRealEstateProfessional changes
  const isValid = checkValidationStatus(uploadedFiles, formData.isRealEstateProfessional);
  setValidationStatus(isValid);
}, [formData.isRealEstateProfessional, uploadedFiles]);
// File upload handlers
const handleFileUpload = async (fileType, file) => {
  if (!file) return;

  // Validate file size (5MB max for documents)
  if (file.size > 5 * 1024 * 1024) {
    showNotification('File size must be less than 5MB', 'error');
    return;
  }

  try {
    const base64File = await convertToBase64(file);
    const updatedFiles = {
      ...uploadedFiles,
      [fileType]: {
        name: file.name,
        data: base64File,
        type: file.type,
        size: file.size
      }
    };
    
    setUploadedFiles(updatedFiles);
    
    // Check validation status
    const isValid = checkValidationStatus(updatedFiles, formData.isRealEstateProfessional);
    setValidationStatus(isValid);
    
    // Save to database immediately with validation status
    if (user) {
      const currentProfile = await mockFirebaseFunctions.getUserProfile(user.uid);
      const updatedProfile = {
        ...currentProfile,
        uploadedFiles: updatedFiles,
        validation: isValid,
        updatedAt: new Date().toISOString()
      };
      await mockFirebaseFunctions.updateUserProfile(user.uid, updatedProfile);
    }
    
    showNotification(`${fileType} uploaded successfully!`);
  } catch (error) {
    console.error('File upload error:', error);
    showNotification('Error uploading file: ' + error.message, 'error');
  }
};
// Add this function after the existing helper functions
const checkValidationStatus = (files, isRealEstateProfessional) => {
  const requiredDocs = ['govtId', 'selfiePhoto'];
  if (isRealEstateProfessional) {
    requiredDocs.push('businessCAC');
  }
  
  return requiredDocs.every(doc => files[doc] !== null);
};

const handleRemoveFile = async (fileType) => {
  if (!user) return;

  try {
    // Update local state first
    const updatedFiles = {
      ...uploadedFiles,
      [fileType]: null
    };
    setUploadedFiles(updatedFiles);

    // Check validation status
    const isValid = checkValidationStatus(updatedFiles, formData.isRealEstateProfessional);
    setValidationStatus(isValid);

    // Immediately save to database with validation status
    const currentProfile = await mockFirebaseFunctions.getUserProfile(user.uid);
    const updatedProfile = {
      ...currentProfile,
      uploadedFiles: updatedFiles,
      validation: isValid,
      updatedAt: new Date().toISOString()
    };

    await mockFirebaseFunctions.updateUserProfile(user.uid, updatedProfile);
    showNotification(`${fileType.replace(/([A-Z])/g, ' $1').toLowerCase()} removed successfully!`);
    
  } catch (error) {
    console.error('Error removing file:', error);
    showNotification('Error removing file: ' + error.message, 'error');
  }
};
  // Replace the loadUserProfile function
const loadUserProfile = async (userId) => {
  try {
    setLoading(true);
    const currentUser = auth.currentUser;
    const userProfile = await mockFirebaseFunctions.getUserProfile(userId);
    
    if (userProfile) {
      setFormData({
        ...userProfile,
        // Ensure email and name from Google auth are used if profile is empty
        firstName: userProfile.firstName || currentUser?.displayName?.split(' ')[0] || '',
        lastName: userProfile.lastName || currentUser?.displayName?.split(' ')[1] || '',
        email: userProfile.email || currentUser?.email || ''
      });
      setProfileImage(userProfile.profileImage || null);
      
      // Load uploaded files with proper structure
      setUploadedFiles(userProfile.uploadedFiles || {
        govtId: null,
        selfiePhoto: null,
        businessCAC: null
      });
      const currentUploadedFiles = userProfile.uploadedFiles || {
  govtId: null,
  selfiePhoto: null,
  businessCAC: null
};
setUploadedFiles(currentUploadedFiles);

// Check and set validation status
const isValid = checkValidationStatus(currentUploadedFiles, userProfile.isRealEstateProfessional || false);
setValidationStatus(isValid);
    } else {
      // If no profile exists, use Google auth data as defaults
      setFormData({
        ...formData,
        firstName: currentUser?.displayName?.split(' ')[0] || '',
        lastName: currentUser?.displayName?.split(' ')[1] || '',
        email: currentUser?.email || ''
      });
      
      // Initialize empty uploadedFiles state
      setUploadedFiles({
        govtId: null,
        selfiePhoto: null,
        businessCAC: null
      });
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
    showNotification('Error loading profile data', 'error');
  } finally {
    setLoading(false);
  }
};

const handleSaveCompany = async () => {
  if (!user) return;

  // Filter out undefined values and convert them to empty strings
  const companyData = {
    companyName: formData.companyName || '',
    companyPhone: formData.companyPhone || '',
    category: formData.category || '',
    website: formData.website || '',
    country: formData.country || 'Nigeria',
    state: formData.state || '',
    city: formData.city || '',
    address: formData.address || '',
    aboutUs: formData.aboutUs || ''
  };

  if (!validateForm(companyData, true)) {
    showNotification('Please fix the errors in the company form', 'error');
    return;
  }

  try {
    setSaving(true);
    // Get current profile data and merge with company data
    const currentProfile = await mockFirebaseFunctions.getUserProfile(user.uid);
    
    // Ensure no undefined values in the merged data
    const updatedProfile = { 
      ...currentProfile, 
      ...companyData,
      // Include uploaded files in the save
      uploadedFiles: uploadedFiles,
      // Ensure these personal fields are never undefined
      firstName: currentProfile?.firstName || '',
      lastName: currentProfile?.lastName || '',
      primaryPhone: currentProfile?.primaryPhone || '',
      email: currentProfile?.email || '',
      whatsappPhone: currentProfile?.whatsappPhone || '',
      alternateEmail: currentProfile?.alternateEmail || '',
      isRealEstateProfessional: currentProfile?.isRealEstateProfessional || false,
      profileImage: currentProfile?.profileImage || ''
    };
    
    await mockFirebaseFunctions.updateUserProfile(user.uid, updatedProfile);
    showNotification('Company information saved successfully!');
  } catch (error) {
    console.error('Error saving company profile:', error);
    showNotification('Error saving company profile: ' + error.message, 'error');
  } finally {
    setSaving(false);
  }
};



    const showNotification = (message, type = 'success') => {
      setNotification({ show: true, message, type });
      setTimeout(() => {
        setNotification({ show: false, message: '', type: 'success' });
      }, 3000);
    };

const validateForm = (data, isCompany = false) => {
  const newErrors = {};
  
  if (!isCompany) {
    if (!data.firstName?.trim()) newErrors.firstName = 'First name is required';
    if (!data.lastName?.trim()) newErrors.lastName = 'Last name is required';
    if (!data.primaryPhone?.trim()) newErrors.primaryPhone = 'Primary phone is required';
    if (!data.email?.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = 'Email is invalid';
    
    // File upload validation - check current state
    console.log('Validating uploadedFiles:', uploadedFiles);
    requiredDocuments.forEach(docType => {
      if (!uploadedFiles[docType]) {
        const fieldName = docType.replace(/([A-Z])/g, ' $1').toLowerCase();
        newErrors[docType] = `${fieldName} is required`;
        console.log(`Validation error for ${docType}:`, newErrors[docType]);
      }
    });
  } else {
    if (!data.companyName?.trim()) newErrors.companyName = 'Company name is required';
    if (!data.category) newErrors.category = 'Category is required';
    if (!data.state) newErrors.state = 'State is required';
    if (!data.city) newErrors.city = 'City is required';
  }
  
  console.log('Validation errors:', newErrors);
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


    const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
      
      // Clear error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
      }
    };


const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file || !user) return;

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showNotification('Please select a valid image file', 'error');
    return;
  }

  // Validate file size (1MB max for Base64 to avoid Firestore document size limits)
  if (file.size > 1 * 1024 * 1024) {
    showNotification('Image size must be less than 1MB for profile pictures', 'error');
    return;
  }

  try {
    setUploadProgress(10);
    
    // Convert image to Base64
    const base64Image = await convertToBase64(file);
    setUploadProgress(50);
    
    // Get current profile data
    const currentProfile = await mockFirebaseFunctions.getUserProfile(user.uid) || {};
    setUploadProgress(70);
    
    // Update profile with Base64 image
    const updatedProfile = {
      firstName: currentProfile.firstName || formData.firstName || '',
      lastName: currentProfile.lastName || formData.lastName || '',
      primaryPhone: currentProfile.primaryPhone || formData.primaryPhone || '',
      email: currentProfile.email || formData.email || '',
      whatsappPhone: currentProfile.whatsappPhone || formData.whatsappPhone || '',
      alternateEmail: currentProfile.alternateEmail || formData.alternateEmail || '',
      isRealEstateProfessional: currentProfile.isRealEstateProfessional || formData.isRealEstateProfessional || false,
      profileImage: base64Image, // Store Base64 string directly
      companyName: currentProfile.companyName || formData.companyName || '',
      companyPhone: currentProfile.companyPhone || formData.companyPhone || '',
      category: currentProfile.category || formData.category || '',
      website: currentProfile.website || formData.website || '',
      country: currentProfile.country || formData.country || 'Nigeria',
      state: currentProfile.state || formData.state || '',
      city: currentProfile.city || formData.city || '',
      address: currentProfile.address || formData.address || '',
      aboutUs: currentProfile.aboutUs || formData.aboutUs || ''
    };
    
    setUploadProgress(90);
    await mockFirebaseFunctions.updateUserProfile(user.uid, updatedProfile);
    
    // Update local state
    setProfileImage(base64Image);
    setFormData(prev => ({ ...prev, profileImage: base64Image }));
    setUploadProgress(100);
    
    setTimeout(() => {
      setUploadProgress(0);
      showNotification('Profile image uploaded successfully!');
    }, 500);
    
  } catch (error) {
    console.error('Upload error:', error);
    showNotification('Error uploading image: ' + error.message, 'error');
    setUploadProgress(0);
  }
};

// Helper function to convert file to Base64
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};


  
const handleDeleteImage = async () => {
  if (user && profileImage) {
    try {
      // Get current profile data
      const currentProfile = await mockFirebaseFunctions.getUserProfile(user.uid) || {};
      
      // Update profile with empty image
      const updatedProfile = {
        ...currentProfile,
        profileImage: '', // Remove the Base64 image
        firstName: currentProfile.firstName || formData.firstName || '',
        lastName: currentProfile.lastName || formData.lastName || '',
        primaryPhone: currentProfile.primaryPhone || formData.primaryPhone || '',
        email: currentProfile.email || formData.email || '',
        whatsappPhone: currentProfile.whatsappPhone || formData.whatsappPhone || '',
        alternateEmail: currentProfile.alternateEmail || formData.alternateEmail || '',
        isRealEstateProfessional: currentProfile.isRealEstateProfessional || formData.isRealEstateProfessional || false,
        companyName: currentProfile.companyName || formData.companyName || '',
        companyPhone: currentProfile.companyPhone || formData.companyPhone || '',
        category: currentProfile.category || formData.category || '',
        website: currentProfile.website || formData.website || '',
        country: currentProfile.country || formData.country || 'Nigeria',
        state: currentProfile.state || formData.state || '',
        city: currentProfile.city || formData.city || '',
        address: currentProfile.address || formData.address || '',
        aboutUs: currentProfile.aboutUs || formData.aboutUs || ''
      };
      
      await mockFirebaseFunctions.updateUserProfile(user.uid, updatedProfile);
      
      // Update local state
      setProfileImage(null);
      setFormData(prev => ({ ...prev, profileImage: '' }));
      showNotification('Profile image deleted successfully!');
    } catch (error) {
      console.error('Error deleting image:', error);
      showNotification('Error deleting image: ' + error.message, 'error');
    }
  }
};

const handleSave = async () => {
  if (!user) return;

  // Filter out undefined values and convert them to empty strings
  const profileData = {
    firstName: formData.firstName || '',
    lastName: formData.lastName || '',
    primaryPhone: formData.primaryPhone || '',
    email: formData.email || '',
    whatsappPhone: formData.whatsappPhone || '',
    alternateEmail: formData.alternateEmail || '',
    isRealEstateProfessional: formData.isRealEstateProfessional || false
  };

  if (!validateForm(profileData, false)) {
    showNotification('Please fix the errors in the form', 'error');
    return;
  }

  try {
    setSaving(true);
    // Get current profile data and merge with personal data
    const currentProfile = await mockFirebaseFunctions.getUserProfile(user.uid);
    
    // Ensure no undefined values in the merged data
    const updatedProfile = { 
      ...currentProfile, 
      ...profileData,
      // Include uploaded files in the save
      uploadedFiles: uploadedFiles,
      // Preserve existing company data if it exists
      companyName: currentProfile?.companyName || '',
      companyPhone: currentProfile?.companyPhone || '',
      category: currentProfile?.category || '',
      website: currentProfile?.website || '',
      country: currentProfile?.country || 'Nigeria',
      state: currentProfile?.state || '',
      city: currentProfile?.city || '',
      address: currentProfile?.address || '',
      aboutUs: currentProfile?.aboutUs || '',
      profileImage: currentProfile?.profileImage || ''
    };
    
    await mockFirebaseFunctions.updateUserProfile(user.uid, updatedProfile);
    showNotification('Profile information saved successfully!');
  } catch (error) {
    console.error('Error saving profile:', error);
    showNotification('Error saving profile: ' + error.message, 'error');
  } finally {
    setSaving(false);
  }
};

  

    if (loading) {
      return (
       <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="relative flex items-center justify-center">
        {/* Static House */}
        <Home className="text-blue-600 h-10 w-10 z-10" />

        {/* Spinning Circle Around House */}
        <div className="absolute animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>

      {/* Loading Text */}
      <span className="mt-4 text-gray-600 text-lg font-medium">
        Property Premium
      </span>
    </div>
      );
    }

    if (!user) {
      return (
        <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
          <div className="text-center py-12">
            <User className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-4">Please sign in to manage your profile</h2>
            <p className="text-gray-600">You need to be logged in to view and edit your profile information.</p>
          </div>
        </div>
      );
    }

    return (
      <div className=" mx-auto p-2 md:p-6 bg-white min-h-screen">
        {/* Notification */}
        {notification.show && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            notification.type === 'error' ? 'bg-red-100 border border-red-300' : 'bg-green-100 border border-green-300'
          }`}>
            <div className="flex items-center">
              {notification.type === 'error' ? (
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              )}
              <span className={notification.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                {notification.message}
              </span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Management</h1>
          <p className="text-gray-600">Manage your personal and company information</p>
        </div>

        {/* Tabs */}


    {/* Personal Profile Tab */}
  {(
    <div className="space-y-6">
      {/* Profile Image Section */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Image</h3>
        <div className=" sm:flex items-center sm:space-x-6">
          <div className="relative">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="h-12 w-12 text-gray-400" />
              </div>
            )}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                <div className="text-white text-sm font-medium">{uploadProgress}%</div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex space-x-3">
              <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                <Camera className="inline h-4 w-4 mr-2" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {profileImage && (
                <button
                  onClick={handleDeleteImage}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  <X className="inline h-4 w-4 mr-2" />
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information Form */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Phone *
            </label>
            <input
              type="tel"
              name="primaryPhone"
              value={formData.primaryPhone}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.primaryPhone ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.primaryPhone && <p className="text-red-500 text-sm mt-1">{errors.primaryPhone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Phone
            </label>
            <input
              type="tel"
              name="whatsappPhone"
              value={formData.whatsappPhone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alternate Email
            </label>
            <input
              type="email"
              name="alternateEmail"
              value={formData.alternateEmail}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isRealEstateProfessional"
              checked={formData.isRealEstateProfessional}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              I am a real estate professional
              {formData.isRealEstateProfessional && (
                <span className="ml-2 text-blue-600 text-xs">(Company form will appear below)</span>
              )}
            </span>
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="inline h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )}

  {/* File Upload Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Documents</h3>
        <div className="space-y-6">
          
          {/* Government Issued ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Govt. Issued ID *
            </label>
            <div className="flex items-center space-x-4">
              <label className={`cursor-pointer px-4 py-2 rounded-md transition-colors ${
                uploadedFiles.govtId ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
                <Upload className="inline h-4 w-4 mr-2" />
                {uploadedFiles.govtId ? 'File Uploaded' : 'Choose File'}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => handleFileUpload('govtId', e.target.files[0])}
                  className="hidden"
                />
              </label>
              {uploadedFiles.govtId && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{uploadedFiles.govtId.name}</span>
                  <button
                    onClick={() => handleRemoveFile('govtId')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {errors.govtId && <p className="text-red-500 text-sm mt-1">{errors.govtId}</p>}
          </div>

          {/* Selfie Photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selfie Photo *
            </label>
            <div className="flex items-center space-x-4">
              <label className={`cursor-pointer px-4 py-2 rounded-md transition-colors ${
                uploadedFiles.selfiePhoto ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}>
                <Upload className="inline h-4 w-4 mr-2" />
                {uploadedFiles.selfiePhoto ? 'File Uploaded' : 'Choose File'}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={(e) => handleFileUpload('selfiePhoto', e.target.files[0])}
                  className="hidden"
                />
              </label>
              {uploadedFiles.selfiePhoto && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{uploadedFiles.selfiePhoto.name}</span>
                  <button
                    onClick={() => handleRemoveFile('selfiePhoto')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {errors.selfiePhoto && <p className="text-red-500 text-sm mt-1">{errors.selfiePhoto}</p>}
          </div>

          {/* Business CAC Document - Only show for real estate professionals */}
          {formData.isRealEstateProfessional && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business CAC Document
              </label>
              <div className="flex items-center space-x-4">
                <label className={`cursor-pointer px-4 py-2 rounded-md transition-colors ${
                  uploadedFiles.businessCAC ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                  <Upload className="inline h-4 w-4 mr-2" />
                  {uploadedFiles.businessCAC ? 'File Uploaded' : 'Choose File'}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => handleFileUpload('businessCAC', e.target.files[0])}
                    className="hidden"
                  />
                </label>
                {uploadedFiles.businessCAC && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{uploadedFiles.businessCAC.name}</span>
                    <button
                      onClick={() => handleRemoveFile('businessCAC')}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              {errors.businessCAC && <p className="text-red-500 text-sm mt-1">{errors.businessCAC}</p>}
            </div>
          )}
        </div>
      </div>

  {/* Company Profile Form - Only show when checkbox is checked */}
 {formData.isRealEstateProfessional && (
      <div className="space-y-6 mt-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.companyName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Phone
              </label>
              <input
                type="tel"
                name="companyPhone"
                value={formData.companyPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select category</option>
                <option value="real-estate-agent">Real Estate Agent</option>
                <option value="real-estate-organization">Real Estate Organization</option>
                <option value="estate-surverying-firm">Estate Surveying Firm</option>
                <option value="developer">Developer</option>
                <option value="property-manager">Property Manager</option>
                <option value="broker">Broker</option>
              </select>
              {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                readOnly
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select state</option>
                {nigerianStates.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={!formData.state}
              >
                <option value="">Select city</option>
                {formData.state && citiesByState[formData.state]?.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About Us
              </label>
              <textarea
                name="aboutUs"
                value={formData.aboutUs}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveCompany}
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white inline mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="inline h-4 w-4 mr-2" />
                  Save Company Info
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}

      </div>

      
    )};