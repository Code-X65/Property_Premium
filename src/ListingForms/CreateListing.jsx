import React, { useState, useEffect } from 'react';
import { ChevronDown, List, Image, FileText, Upload, X, Camera, Plus, Loader2 } from 'lucide-react';
import PropertyDetails from './PropertyDetails';
import PropertyMedia from './PropertyMedia';
import ListingDecription from './ListingDecription';
import 'react-toastify/dist/ReactToastify.css';

import { toast, ToastContainer } from 'react-toastify';

// Import Firebase functions
import { getCurrentUser, subscribeToAuthChanges } from '../Firebase Auth/Firebase'; // Update path as needed
import { createProperty, updateProperty } from '../Firebase Auth/Firestore'; // Update path as needed
import { collection, addDoc, updateDoc, doc, getFirestore, getDoc } from 'firebase/firestore';

const CreateListing = ({ propertyId = null, existingProperty = null }) => {
  const options = ['24/7 Electricity', 'Water facilities', 'Furnished', 'Serviced', 'Swimming pool', 'Parking Space', 'Elevator', 'Gym', 'Security', 'Generator', 'CCTV', 'Balcony', 'Garden', 'Laundry'];
    const addressViewer = ['YES, show it (recommended)', 'No, do not']
    const priceViewer = ['YES, show it', 'No, do not show', 'Show price range only', 'Contact for price']

     const locationData = {
        'Nigeria': {
            'Lagos': ['Ikeja', 'Victoria Island', 'Lekki', 'Surulere', 'Yaba', 'Ajah', 'Ikoyi', 'Maryland', 'Gbagada', 'Festac'],
            'Abuja': ['Garki', 'Wuse', 'Maitama', 'Asokoro', 'Gwarinpa', 'Kubwa', 'Lugbe', 'Nyanya', 'Karu', 'Jahi'],
            'Rivers': ['Port Harcourt', 'Obio-Akpor', 'Eleme', 'Ikwerre', 'Oyigbo', 'Okrika', 'Ogu–Bolo', 'Degema'],
            'Kano': ['Kano Municipal', 'Fagge', 'Dala', 'Gwale', 'Tarauni', 'Nassarawa', 'Ungogo', 'Kumbotso'],
            'Oyo': ['Ibadan North', 'Ibadan South-West', 'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Egbeda', 'Akinyele', 'Lagelu']
        },
        'Ghana': {
            'Greater Accra': ['Accra', 'Tema', 'Ga West', 'Ga East', 'Ga Central', 'Ga South', 'Ledzokuku-Krowor'],
            'Ashanti': ['Kumasi', 'Obuasi', 'Ejisu-Juaben', 'Bekwai', 'Oforikrom', 'Asokwa', 'Kwadaso'],
            'Western': ['Sekondi-Takoradi', 'Tarkwa-Nsuaem', 'Prestea Huni-Valley', 'Ellembelle', 'Nzema East']
        },
        'South Africa': {
            'Gauteng': ['Johannesburg', 'Pretoria', 'Soweto', 'Randburg', 'Sandton', 'Midrand', 'Germiston', 'Benoni'],
            'Western Cape': ['Cape Town', 'Stellenbosch', 'Paarl', 'George', 'Worcester', 'Hermanus', 'Mossel Bay'],
            'KwaZulu-Natal': ['Durban', 'Pietermaritzburg', 'Newcastle', 'Richards Bay', 'Pinetown', 'Chatsworth']
        }
    };



    const checkUserProfileValidation = async (userId) => {
    try {
        const db = getFirestore();
        const profileRef = doc(db, 'users', userId, 'profiles', 'userProfile');
        const profileDoc = await getDoc(profileRef);
        
        if (profileDoc.exists()) {
            const profileData = profileDoc.data();
            return profileData.validation || false;
        }
        return false;
    } catch (error) {
        console.error('Error checking profile validation:', error);
        return false;
    }
};


    const [selectedOptions, setSelectedOptions] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Initialize form data
  const [formData, setFormData] = useState({
    listingTitle: existingProperty?.title || 'e.g, 4 Bedroom Serviced Duplex with BQ',
    advertisingFor: existingProperty?.advertisingFor || '',
    propertyType: existingProperty?.propertyType || 'House',
    useOfProperty: existingProperty?.useOfProperty || 'Unspecified',
    marketStatus: existingProperty?.marketStatus || 'Available',
    country: existingProperty?.country || 'Nigeria',
    state: existingProperty?.state || 'Lagos',
    city: existingProperty?.city || 'Ikeja', // CHANGED from 'ikeja'
    address: existingProperty?.address || 'No 14, adeshina street',
    currency: existingProperty?.currency || 'Nigeria Naira',
    price: existingProperty?.price || '0',
    price_per: existingProperty?.price_per || 'Year',
    bedroom: existingProperty?.bedroom || 3,
    bathroom: existingProperty?.bathroom || 4,
    toilet: existingProperty?.toilet || 5,
    year_built: existingProperty?.year_built || '2014',
    totalArea: existingProperty?.totalArea || '3425',
    totalAreaUnit: existingProperty?.totalAreaUnit || 'sqm',
    coveredArea: existingProperty?.coveredArea || 1234,
    coveredAreaUnit: existingProperty?.coveredAreaUnit || 'sqm',
    images: existingProperty?.images || [],
    description: existingProperty?.description || '',
    features: existingProperty?.features || [''],
    nearbyAmenities: existingProperty?.nearbyAmenities || [''],
    showAddress: existingProperty?.showAddress || 'YES, show it (recommended)',
    showPrice: existingProperty?.showPrice || 'YES, show it', // CHANGED
    // ADD NEW FIELDS:
    propertyCondition: existingProperty?.propertyCondition || 'Newly Built',
    furnishingStatus: existingProperty?.furnishingStatus || 'Unfurnished',
    availableFrom: existingProperty?.availableFrom || '',
    minimumRentPeriod: existingProperty?.minimumRentPeriod || '1 Year',
    utilitiesIncluded: existingProperty?.utilitiesIncluded || [],
    petPolicy: existingProperty?.petPolicy || 'Not Allowed',
    smokingPolicy: existingProperty?.smokingPolicy || 'Not Allowed'
});

const [availableStates, setAvailableStates] = useState(Object.keys(locationData['Nigeria'] || {}));
const [availableCities, setAvailableCities] = useState(locationData['Nigeria']?.['Lagos'] || []);
    const propertyTypesByAdvertisingFor = {
  'Sale': ['House', 'Apartment', 'Duplex', 'Bungalow', 'Penthouse', 'Commercial', 'Land', 'Warehouse', 'Office Space'],
  'Rent': ['House', 'Apartment', 'Duplex', 'Bungalow', 'Studio', 'Penthouse', 'Office Space'],
  'Lease': ['Commercial', 'Office Space', 'Warehouse', 'Land'],
  'Shortlet': ['Apartment', 'House', 'Studio', 'Penthouse']
};
const getAvailablePropertyTypes = (advertisingFor) => {
  return advertisingFor ? propertyTypesByAdvertisingFor[advertisingFor] || [] : [];
};

const availablePropertyTypes = getAvailablePropertyTypes(formData.advertisingFor);

useEffect(() => {
    if (formData.country && locationData[formData.country]) {
        const states = Object.keys(locationData[formData.country]);
        setAvailableStates(states);
        
        // Reset state and city if current state doesn't exist in new country
        if (!states.includes(formData.state)) {
            setFormData(prev => ({ ...prev, state: states[0] || '', city: '' }));
        }
    }
}, [formData.country]);
useEffect(() => {
    if (formData.country && formData.state && locationData[formData.country]?.[formData.state]) {
        const cities = locationData[formData.country][formData.state];
        setAvailableCities(cities);
        
        // Reset city if current city doesn't exist in new state
        if (!cities.includes(formData.city)) {
            setFormData(prev => ({ ...prev, city: cities[0] || '' }));
        }
    }
}, [formData.country, formData.state]);

    const [activeTab, setActiveTab] = useState('details');
    const [uploadedImages, setUploadedImages] = useState([]);
    const [dragOver, setDragOver] = useState(false);

// Check if we're editing an existing property
useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
        // Fetch the property to edit
        fetchPropertyForEdit(editId);
    } else if (propertyId && existingProperty) {
        setupEditMode(existingProperty);
    }
}, [user]);

const fetchPropertyForEdit = async (propertyId) => {
    if (!user) return;
    
    try {
        setLoading(true);
        // Import your Firestore function
        const { getUserProperties } = await import('../Firebase Auth/Firestore');
        const properties = await getUserProperties();
        const property = properties.find(p => p.id === propertyId);
        
        if (property) {
           if (property.userId !== user.uid) {
    const errorMessage = 'You do not have permission to edit this property.';
    setSubmitError(errorMessage);
    toast.error(errorMessage);
    return;
}
            setupEditMode(property);
        } else {
            setSubmitError('Property not found.');
            toast.error('Property not found.');
        }
    } catch (error) {
        setSubmitError('Error loading property for editing.');
    } finally {
        setLoading(false);
    }
};

const setupEditMode = (property) => {
    setIsEditing(true);
    setSelectedOptions(property.amenities || []);
    
    // Update form data with existing property data
    setFormData({
        listingTitle: property.title || '',
        advertisingFor: property.advertisingFor || '',
        propertyType: property.propertyType || 'House',
        useOfProperty: property.useOfProperty || 'Unspecified',
        marketStatus: property.marketStatus || 'Available',
        country: property.country || 'Nigeria',
        state: property.state || 'Lagos',
        city: property.city || '',
        address: property.address || '',
        currency: property.currency || 'Nigeria Naira',
        price: property.price?.toString() || '0',
        price_per: property.pricePer || 'Year',
        bedroom: property.bedroom || 0,
        bathroom: property.bathroom || 0,
        toilet: property.toilet || 0,
        year_built: property.yearBuilt || '',
        totalArea: property.totalArea?.toString() || '',
        totalAreaUnit: property.totalAreaUnit || 'sqm',
        coveredArea: property.coveredArea || 0,
        coveredAreaUnit: property.coveredAreaUnit || 'sqm',
        images: property.images || [],
        description: property.description || '',
        features: property.features || [''],
        nearbyAmenities: property.nearbyAmenities || [''],
        showAddress: property.showAddress ? 'YES, show it (recommended)' : 'No, do not',
        showPrice: property.showPrice ? 'YES, show it (recommended)' : 'No, do not',
         propertyCondition: property.propertyCondition || 'Newly Built',
        furnishingStatus: property.furnishingStatus || 'Unfurnished',
        availableFrom: property.availableFrom || '',
        minimumRentPeriod: property.minimumRentPeriod || '1 Year',
        utilitiesIncluded: property.utilitiesIncluded || [],
        petPolicy: property.petPolicy || 'Not Allowed',
        smokingPolicy: property.smokingPolicy || 'Not Allowed'
    });
    
    // Set up existing images
 if (property.images && property.images.length > 0) {
        const existingImages = property.images.map((img, index) => ({
            id: `existing-${index}`,
            name: `image-${index}`,
            size: 0,
            type: 'image/jpeg',
            preview: img,
            isExisting: true,
            url: img
        }));
        setUploadedImages(existingImages);
    }
};

    // Authentication state listener
    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges((user) => {
            setUser(user);
        });

        return unsubscribe;
    }, []);

    const handleCheckboxChange = (option) => {
        setSelectedOptions((prevSelected) =>
            prevSelected.includes(option)
                ? prevSelected.filter((item) => item !== option)
                : [...prevSelected, option]
        );
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        if (field === 'images') {
            setFormData(prev => ({
                ...prev,
                images: uploadedImages.map(img => img.preview || img.url)
            }));
        }
       
        if (field === 'advertisingFor') {
  const newPropertyTypes = getAvailablePropertyTypes(value);
  if (formData.propertyType && !newPropertyTypes.includes(formData.propertyType)) {
    setFormData(prev => ({ ...prev, [field]: value, propertyType: '' }));
    return;
  }
}
    };

    const handleListChange = (field, index, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const addListItem = (field) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], '']
        }));
    };

    const removeListItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    // Generate unique ID for images
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    // Convert image file to base64 data URL
    const fileToDataURL = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Compress image to reduce file size
// Compress image to reduce file size
const compressImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        // Check if we're in a browser environment
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            // If not in browser, just convert to data URL without compression
            fileToDataURL(file).then(resolve).catch(reject);
            return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = document.createElement('img'); // Use document.createElement instead

        img.onload = () => {
            try {
                // Calculate new dimensions
                let { width, height } = img;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width *= ratio;
                    height *= ratio;
                }

                // Set canvas dimensions
                canvas.width = width;
                canvas.height = height;

                // Draw and compress
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to data URL with compression
                const compressedDataURL = canvas.toDataURL(file.type, quality);
                
                // Check if compressed size is still reasonable (under 200KB as base64)
                if (compressedDataURL.length > 200 * 1024 * 1.37) {
                    // If still too large, reduce quality further
                    const reducedQuality = Math.max(0.3, quality - 0.2);
                    const furtherCompressed = canvas.toDataURL(file.type, reducedQuality);
                    resolve(furtherCompressed);
                } else {
                    resolve(compressedDataURL);
                }
                
                // Clean up
                if (img.src && img.src.startsWith('blob:')) {
                    URL.revokeObjectURL(img.src);
                }
            } catch (error) {
                console.error('Error in image compression:', error);
                if (img.src && img.src.startsWith('blob:')) {
                    URL.revokeObjectURL(img.src);
                }
                // Fallback to original file as data URL
                fileToDataURL(file).then(resolve).catch(reject);
            }
        };

        img.onerror = (error) => {
            console.error('Error loading image:', error);
            // Fallback to original file as data URL
            fileToDataURL(file).then(resolve).catch(reject);
        };

        // Create object URL for the image
        try {
            img.src = URL.createObjectURL(file);
        } catch (error) {
            console.error('Error creating object URL:', error);
            // Fallback to original file as data URL
            fileToDataURL(file).then(resolve).catch(reject);
        }
    });
};

    // Handle image upload - convert to data URLs
   // Handle image upload - resize and compress images
// Handle image upload - resize and compress images
const handleImageUpload = async (files) => {
    if (!files) return;

    setLoading(true);
    const newImages = [];

    try {
        for (const file of Array.from(files)) {
            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
              toast.error(`${file.name} is too large. Maximum size is 10MB.`);
                continue;
            }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not a valid image file.`);
                continue;
            }

            // Compress and resize image
            try {
                const compressedDataURL = await compressImage(file);
                newImages.push({
                    id: generateId(),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    preview: compressedDataURL,
                    isExisting: false,
                    url: compressedDataURL
                });
            } catch (error) {
                console.error(`Error compressing ${file.name}:`, error);
               toast.error('Failed to process images. Please try again.');
            }
        }

      if (newImages.length > 0) {
    setUploadedImages(prev => {
        const updatedImages = [...prev, ...newImages];
        return updatedImages;
    });
    
    // Update formData after images are set
    setTimeout(() => {
        setFormData(prevForm => ({
            ...prevForm,
            images: [...uploadedImages, ...newImages].map(img => img.url || img.preview)
        }));
    }, 0);
}
    } catch (error) {
        console.error('Error processing images:', error);
        alert('Failed to process images. Please try again.');
    } finally {
        setLoading(false);
    }
};

    const removeImage = (imageId) => {
        const updatedImages = uploadedImages.filter(img => img.id !== imageId);
        setUploadedImages(updatedImages);
        
        // Update formData
        setFormData(prev => ({
            ...prev,
            images: updatedImages.map(img => img.url || img.preview)
        }));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = e.dataTransfer.files;
        handleImageUpload(files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setDragOver(false);
    };

    const handleNext = () => {
        if (activeTab === 'details') {
            setActiveTab('media');
        } else if (activeTab === 'media') {
            setActiveTab('description');
        } else if (activeTab === 'description') {
            // Handle form submission on the last tab
            handleSubmit();
        }
    };

     <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                style={{ zIndex: 9999 }}
            />

    const handlePrevious = () => {
        if (activeTab === 'media') {
            setActiveTab('details');
        } else if (activeTab === 'description') {
            setActiveTab('media');
        }
    };

const validateForm = () => {
    const errors = [];

    if (!formData.listingTitle || formData.listingTitle.trim() === '' || formData.listingTitle === 'e.g, 4 Bedroom Serviced Duplex with BQ') {
        errors.push('Please enter a valid listing title');
    }

    if (!formData.advertisingFor) {
        errors.push('Please select what you are advertising for');
    }

    if (!formData.price || formData.price === '0') {
        errors.push('Please enter a valid price');
    }

    if (!formData.description || formData.description.trim() === '') {
        errors.push('Please enter a property description');
    }

    if (uploadedImages.length === 0) {
        errors.push('Please upload at least one image');
    }

    // Enhanced validations
    if (!formData.country) {
        errors.push('Please select a country');
    }
    
    if (!formData.state) {
        errors.push('Please select a state');
    }
    
    if (!formData.city) {
        errors.push('Please select a city');
    }
    
    if (formData.availableFrom && new Date(formData.availableFrom) < new Date()) {
        errors.push('Available from date cannot be in the past');
    }

    return errors;
};



const handleSubmit = async () => {
    if (!user) {
        const errorMessage = 'Please sign in to create a listing';
        setSubmitError(errorMessage);
        toast.error(errorMessage);
        return;
    }

    // NEW: Check profile validation before proceeding
    const isProfileValid = await checkUserProfileValidation(user.uid);
    
    if (!isProfileValid) {
        const errorMessage = 'Your profile is not validated yet. Please complete your profile validation by uploading required documents.';
        setSubmitError(errorMessage);
        toast.error(errorMessage, {
            position: "top-center",
            autoClose: 7000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        });
        
        // Optionally show a button to go to profile management
        setTimeout(() => {
            if (window.confirm('Would you like to go to Profile Management to complete validation?')) {
                window.location.href = '/Property_Premium/dashboard/my-account'; // Adjust path as needed
            }
        }, 2000);
        
        return;
    }

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
        const errorMessage = validationErrors.join('. ');
        
        // Show both banner and toast
        setSubmitError(errorMessage);
        toast.error(errorMessage);
        return;
    }

    setLoading(true);
    setSubmitError('');
    setSubmitSuccess('');

    // Rest of your existing handleSubmit code remains the same...
    try {
        // Get image URLs/data URLs - no need to upload to Firebase Storage
        const imageUrls = uploadedImages.map(img => img.url || img.preview);

        // Get current timestamp
        const now = new Date();

        // Prepare submission data with user information
        const submissionData = {
            // User identification
            userId: user.uid,
            userEmail: user.email,
            userName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
            userPhotoURL: user.photoURL || null,
            
            // Property details
            title: formData.listingTitle,
            advertisingFor: formData.advertisingFor,
            propertyType: formData.propertyType,
            useOfProperty: formData.useOfProperty,
            marketStatus: formData.marketStatus,
            country: formData.country,
            state: formData.state,
            city: formData.city,
            address: formData.address,
            showAddress: formData.showAddress === 'YES, show it (recommended)', // Boolean
            currency: formData.currency,
            price: parseFloat(formData.price),
            pricePer: formData.price_per,
            showPriceOption: formData.showPrice, // String option
            showPrice: formData.showPrice === 'YES, show it', // Boolean for backward compatibility
            bedroom: parseInt(formData.bedroom),
            bathroom: parseInt(formData.bathroom),
            toilet: parseInt(formData.toilet),
            yearBuilt: formData.year_built,
            totalArea: parseFloat(formData.totalArea),
            totalAreaUnit: formData.totalAreaUnit,
            coveredArea: parseFloat(formData.coveredArea),
            coveredAreaUnit: formData.coveredAreaUnit,
            images: imageUrls,
            description: formData.description,
            features: formData.features.filter(f => f.trim() !== ''),
            nearbyAmenities: formData.nearbyAmenities.filter(a => a.trim() !== ''),
            amenities: selectedOptions,
            location: `${formData.city}, ${formData.state}, ${formData.country}`,
            status: 'active',
            
            // NEW FIELDS:
            propertyCondition: formData.propertyCondition,
            furnishingStatus: formData.furnishingStatus,
            availableFrom: formData.availableFrom,
            minimumRentPeriod: formData.minimumRentPeriod,
            utilitiesIncluded: formData.utilitiesIncluded,
            petPolicy: formData.petPolicy,
            smokingPolicy: formData.smokingPolicy,
            
            // Enhanced location data
            locationHierarchy: {
                country: formData.country,
                state: formData.state,
                city: formData.city,
                fullAddress: formData.address
            },
            
            // Timestamps
            createdAt: isEditing ? existingProperty?.createdAt || now : now,
            updatedAt: now,
            
            // Additional metadata
            source: 'web_app',
            version: '1.1', // Updated version
            
            // SEO and search optimization
            searchKeywords: [
                formData.propertyType.toLowerCase(),
                formData.city.toLowerCase(),
                formData.state.toLowerCase(),
                formData.advertisingFor.toLowerCase(),
                ...selectedOptions.map(opt => opt.toLowerCase())
            ],
            
            // Price analytics
            pricePerUnit: formData.totalArea ? (parseFloat(formData.price) / parseFloat(formData.totalArea)) : 0
        };

        const db = getFirestore();
        const urlParams = new URLSearchParams(window.location.search);
        const editId = urlParams.get('edit');
        let result;

        if (isEditing && editId) {
            // FIXED: Create proper document reference
            const propertyRef = doc(db, 'users', user.uid, 'properties', editId);
            await updateDoc(propertyRef, submissionData);
            result = { id: editId, ...submissionData };
            
            // Set the state for banner display
            setSubmitSuccess('Property updated successfully! 🎉');
            // AND also show toast notification
            toast.success('Property updated successfully! 🎉');
            
            setTimeout(() => {
                window.location.href = '/Property_Premium/dashboard/my-listings';
            }, 2000);
        } else {
            const userPropertiesCollection = collection(db, 'users', user.uid, 'properties');
            const docRef = await addDoc(userPropertiesCollection, submissionData);
            result = { id: docRef.id, ...submissionData };
            
            // Both banner and toast
            setSubmitSuccess('Property listing created successfully! 🎉');
            toast.success('Property listing created successfully! 🎉');
            
            setTimeout(() => {
                window.location.href = '/Property_Premium/dashboard/my-listings';
            }, 1500);
        }

        console.log('Property saved:', result);
        console.log('Associated with user:', user.uid);

        // Reset form after successful submission (optional)
        setTimeout(() => {
            if (!isEditing) {
                resetForm();
            }
            setSubmitSuccess('');
        }, 3000);

    } catch (error) {
        console.error('Error submitting property:', error);
        const errorMessage = error.message || 'Failed to submit property. Please try again.';
        
        // Show both banner and toast
        setSubmitError(errorMessage);
        toast.error(errorMessage);
    } finally {
        setLoading(false);
    }
};

const ProfileValidationBanner = ({ user, onCheckValidation }) => {
    const [validationStatus, setValidationStatus] = useState(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (user) {
            checkValidationStatus();
        }
    }, [user]);

    const checkValidationStatus = async () => {
        try {
            const isValid = await checkUserProfileValidation(user.uid);
            setValidationStatus(isValid);
        } catch (error) {
            console.error('Error checking validation:', error);
            setValidationStatus(false);
        } finally {
            setChecking(false);
        }
    };

    if (checking) {
        return (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-700">Checking profile validation...</p>
            </div>
        );
    }

    if (validationStatus === false) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Profile Validation Required</h3>
                        <p className="mt-1 text-sm text-red-700">
                            You need to complete your profile validation before creating listings. Please upload your required documents.
                        </p>
                        <div className="mt-3">
                            <button
                                onClick={() => window.location.href = '/Property_Premium/dashboard/my-account'}
                                className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                            >
                                Complete Profile Validation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (validationStatus === true) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-green-700 font-medium">
                            ✓ Profile validated - You can create listings
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

  const resetForm = () => {
    setFormData({
        listingTitle: 'e.g, 4 Bedroom Serviced Duplex with BQ',
        advertisingFor: '',
        propertyType: 'House',
        useOfProperty: 'Unspecified',
        marketStatus: 'Available',
        country: 'Nigeria',
        state: 'Lagos',
        city: 'Ikeja', // CHANGED
        address: 'No 14, adeshina street',
        currency: 'Nigeria Naira',
        price: '0',
        price_per: 'Year',
        bedroom: 3,
        bathroom: 4,
        toilet: 5,
        year_built: '2014',
        totalArea: '3425',
        totalAreaUnit: 'sqm',
        coveredArea: 1234,
        coveredAreaUnit: 'sqm',
        images: [],
        description: '',
        features: [''],
        nearbyAmenities: [''],
        showAddress: 'YES, show it (recommended)',
        showPrice: 'YES, show it', // CHANGED
        // ADD NEW FIELDS:
        propertyCondition: 'Newly Built',
        furnishingStatus: 'Unfurnished',
        availableFrom: '',
        minimumRentPeriod: '1 Year',
        utilitiesIncluded: [],
        petPolicy: 'Not Allowed',
        smokingPolicy: 'Not Allowed'
    });
    setUploadedImages([]);
    setSelectedOptions([]);
    setActiveTab('details');
    setAvailableStates(Object.keys(locationData['Nigeria'] || {}));
    setAvailableCities(locationData['Nigeria']?.['Lagos'] || []);
};

const getPriceDisplayText = (priceOption, price) => {
    switch(priceOption) {
        case 'YES, show it':
            return price;
        case 'Show price range only':
            const priceNum = parseFloat(price);
            if (priceNum < 100000) return 'Under ₦100k';
            if (priceNum < 500000) return '₦100k - ₦500k';
            if (priceNum < 1000000) return '₦500k - ₦1M';
            if (priceNum < 5000000) return '₦1M - ₦5M';
            return 'Above ₦5M';
        case 'Contact for price':
            return 'Contact for Price';
        default:
            return 'Price not disclosed';
    }
};


const validateAdvancedForm = () => {
    const errors = [];
    
    // Existing validations...
    if (!formData.listingTitle || formData.listingTitle.trim() === '' || formData.listingTitle === 'e.g, 4 Bedroom Serviced Duplex with BQ') {
        errors.push('Please enter a valid listing title');
    }

    if (!formData.advertisingFor) {
        errors.push('Please select what you are advertising for');
    }

    if (!formData.price || formData.price === '0') {
        errors.push('Please enter a valid price');
    }

    if (!formData.description || formData.description.trim() === '') {
        errors.push('Please enter a property description');
    }

    if (uploadedImages.length === 0) {
        errors.push('Please upload at least one image');
    }
    
    // NEW validations:
    if (!formData.country) {
        errors.push('Please select a country');
    }
    
    if (!formData.state) {
        errors.push('Please select a state');
    }
    
    if (!formData.city) {
        errors.push('Please select a city');
    }
    
    if (formData.availableFrom && new Date(formData.availableFrom) < new Date()) {
        errors.push('Available from date cannot be in the past');
    }

    return errors;
};

    const TabButton = ({ id, icon: Icon, label, isActive }) => (
        <button
            onClick={() => setActiveTab(id)}
            disabled={loading}
            className={`flex flex-col items-center px-6 py-4 border-b-2 transition-colors ${
                isActive 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-gray-200 text-gray-500 hover:text-gray-700'
            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <Icon className="w-6 h-6 mb-2" />
            <span className="text-sm font-medium">{label}</span>
        </button>
    );

    const SelectField = ({ label, value, onChange, options, placeholder = '--select--' }) => (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none disabled:opacity-50"
                >
                    <option value="">{placeholder}</option>
                    {options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
        </div>
    );

    // Show authentication message if user is not logged in
    if (!user) {
        return (
            <div className="max-w-4xl mx-auto bg-white p-8">
                <div className="text-center">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                            Authentication Required
                        </h3>
                        <p className="text-yellow-700">
                            Please sign in to create or edit property listings.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

return (
    <>
    <div className="max-w-4xl mx-auto bg-white">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
           <TabButton
                              id="details"
                              icon={List}
                              label="DETAILS"
                              isActive={activeTab === 'details'}
                          />
                          <TabButton
                              id="media"
                              icon={Image}
                              label="MEDIA"
                              isActive={activeTab === 'media'}
                          />
                          <TabButton
                              id="description"
                              icon={FileText}
                              label="DESCRIPTION"
                              isActive={activeTab === 'description'}
                          />
        </div>

        {/* Content Area */}
        <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
                {isEditing ? 'EDIT PROPERTY' : 'CREATE NEW PROPERTY'}
            </h2>


{user && <ProfileValidationBanner user={user} />}

            {/* ADD ERROR/SUCCESS MESSAGES HERE */}
            {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <X className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{submitError}</p>
                        </div>
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    onClick={() => setSubmitError('')}
                                    className="inline-flex bg-red-50 rounded-md p-1.5 text-red-400 hover:bg-red-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {submitSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-green-700">{submitSuccess}</p>
                        </div>
                        <div className="ml-auto pl-3">
                            <div className="-mx-1.5 -my-1.5">
                                <button
                                    onClick={() => setSubmitSuccess('')}
                                    className="inline-flex bg-green-50 rounded-md p-1.5 text-green-400 hover:bg-green-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
             <h3 className="font-semibold text-yellow-800 mb-2">Important notice</h3>
                    <p className="text-sm text-yellow-700">
                        We do not allow the posting or marketing of properties that you do not have the legal authority to do so. Should we suspect potential scam or are reported to, we reserve the right to notify security operatives and share your information to the authorities before account is permanently closed. Thank you for your honesty.
                    </p>
            </div>
 {activeTab === 'details' && (
                    <PropertyDetails
                        formData={formData}
                        handleInputChange={handleInputChange}
                        options={options}
                        addressViewer={addressViewer}
                        selectedOptions={selectedOptions}
                        handleCheckboxChange={handleCheckboxChange}
                        SelectField={SelectField}
                        priceViewer={priceViewer}
                        disabled={loading}
                        locationData={locationData}
 availableStates={availableStates}
availableCities={availableCities}
getPriceDisplayText={getPriceDisplayText}
availablePropertyTypes={availablePropertyTypes}
                    />
                )}

                {/* Media Tab Content */}
                {activeTab === 'media' && (
                    <PropertyMedia  
                        handleDrop={handleDrop}
                        handleDragOver={handleDragOver}
                        handleDragLeave={handleDragLeave}
                        handleImageUpload={handleImageUpload}
                        uploadedImages={uploadedImages}
                        removeImage={removeImage}
                        dragOver={dragOver}
                        disabled={loading}
                    />
                )}

                {/* Description Tab Content */}
                {activeTab === 'description' && (
                    <ListingDecription 
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleListChange={handleListChange}
                        addListItem={addListItem}
                        removeListItem={removeListItem}
                        disabled={loading}
                    />
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center mt-12">
                    <button 
                        onClick={handlePrevious}
                        disabled={activeTab === 'details' || loading}
                        className={`px-6 py-2 border rounded-md transition-colors ${
                            activeTab === 'details' || loading
                                ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        Previous
                    </button>
                    
                    {/* Progress Indicator */}
                    <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${activeTab === 'details' ? 'bg-blue-600' : 'bg-blue-200'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${activeTab === 'media' ? 'bg-blue-600' : 'bg-blue-200'}`}></div>
                        <div className={`w-3 h-3 rounded-full ${activeTab === 'description' ? 'bg-blue-600' : 'bg-blue-200'}`}></div>
                    </div>

                    <button 
                        onClick={handleNext}
                        disabled={loading}
                        className={`px-8 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {activeTab === 'description' ? 'Submitting...' : 'Processing...'}
                            </>
                        ) : (
                            <>
                                {activeTab === 'description' ? (isEditing ? 'Update' : 'Submit') : 'Next'}
                                {activeTab === 'description' && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </>
                        )}
                    </button>
                </div>
        </div>

        {/* Chat Button */}
        <div className="fixed bottom-6 right-6">
             <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg shadow-lg transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                    </svg>
                </button>
        </div>

        {/* ADD TOASTCONTAINER AT THE END */}
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            style={{ zIndex: 9999 }}
        />
    </div>
    </>
);
};

export default CreateListing;