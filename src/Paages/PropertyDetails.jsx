import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Bed, 
  Bath, 
  Square, 
  Heart, 
  Share2, 
  Phone, 
  MessageCircle, 
  Mail, 
  User,
  Calendar,
  Home,
  Car,
  Wifi,
  Shield,
  ChevronLeft,
  ChevronRight,
  Send,
  MessageSquare,
  Loader2,
  Globe,
   Clock,
  DollarSign,
  Building,
  CheckCircle,
  XCircle,
  Zap,
  Users,
  PawPrint,
  Cigarette,
  Star,
  CalculatorIcon
} from 'lucide-react';
import { doc, getDoc, getFirestore, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove, addDoc} from 'firebase/firestore';
import { subscribeToAuthChanges } from '../Firebase Auth/Firebase';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import UserProfileView from './UserProfileView';

import { 
  auth,
  db,
  getUserProfile
} from '../Firebase Auth/Firebase'; // Adjust the path as needed
import RecommendedProperties from './RecommendedProperties';


// Function to handle helpful vote


// Function to show login prompt for unauthenticated users
const promptLogin = () => {
  if (confirm('Please log in to leave a review. Would you like to go to the login page?')) {
    // Navigate to login - adjust this based on your routing
    navigate('/login', { state: { returnTo: `/property/${propertyId}` } });
  }
};
const PropertyDetails = () => {

  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [property, setProperty] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [contactForm, setContactForm] = useState({
      name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [showContactForm, setShowContactForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const propertyId = id;// Use this instead of the prop
useEffect(() => {
  testDatabaseConnection();
}, [propertyId]);


useEffect(() => {
  const fetchPropertyDetails = async () => {
    if (!propertyId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const db = getFirestore();
      
      // First try to fetch from main properties collection
      let propertyDoc = await getDoc(doc(db, 'properties', propertyId));
      
      if (!propertyDoc.exists()) {
        // If not found, try to find in user subcollections
        const usersSnapshot = await getDocs(collection(db, 'users'));
        
        for (const userDoc of usersSnapshot.docs) {
          try {
            propertyDoc = await getDoc(doc(db, 'users', userDoc.id, 'properties', propertyId));
            if (propertyDoc.exists()) {
              break;
            }
          } catch (error) {
            // Continue searching in other user collections
            continue;
          }
        }
      }

      if (propertyDoc.exists()) {
        const propertyData = propertyDoc.data();
        
        // Fetch owner details using the new profile structure
        let ownerData = null;
        const ownerId = propertyData.ownerId || propertyData.userId || propertyData.createdBy;
        
        if (ownerId) {
          ownerData = await getUserProfileFromDB(ownerId);
        }

        setProperty({
          id: propertyDoc.id,
          ...propertyData,
          createdAt: propertyData.createdAt?.toDate ? propertyData.createdAt.toDate() : new Date(propertyData.createdAt),
          owner: ownerData ? {
            id: ownerId,
            name: ownerData.displayName || `${ownerData.firstName} ${ownerData.lastName}`.trim() || 'Property Owner',
            profilePicture: ownerData.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            phone: ownerData.primaryPhone || 'Not provided',
            whatsapp: ownerData.whatsappPhone || ownerData.primaryPhone || 'Not provided',
            email: ownerData.email || 'Not provided',
            joinedDate: ownerData.createdAt?.toDate ? ownerData.createdAt.toDate() : new Date(),
            totalListings: ownerData.totalListings || 1,
            responseRate: ownerData.responseRate || '95%',
            responseTime: ownerData.responseTime || 'Within an hour',
            verified: ownerData.verified || false,
            // Additional company information if they are a real estate professional
            isRealEstateProfessional: ownerData.isRealEstateProfessional || false,
            companyName: ownerData.companyName || '',
            category: ownerData.category || '',
            website: ownerData.website || '',
            aboutUs: ownerData.aboutUs || '',
            city: ownerData.city || '',
            state: ownerData.state || ''
          } : {
            id: 'unknown',
            name: 'Property Owner',
            profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
            phone: 'Not provided',
            whatsapp: 'Not provided',
            email: 'Not provided',
            joinedDate: new Date(),
            totalListings: 1,
            responseRate: '95%',
            responseTime: 'Within an hour',
            verified: false,
            isRealEstateProfessional: false,
            companyName: '',
            category: '',
            website: '',
            aboutUs: '',
            city: '',
            state: ''
          }
        });
      } else {
        console.log('Property not found');
        setProperty(null);
      }
    } catch (error) {
      console.error('Error fetching property details:', error);
      setProperty(null);
    } finally {
      setLoading(false);
    }
  };

  fetchPropertyDetails();
}, [propertyId]);

useEffect(() => {
  const unsubscribe = subscribeToAuthChanges((user) => {
    setUser(user);
    if (user) {
      fetchUserWishlist(user.uid);
    } else {
      setWishlist([]);
      setIsFavorited(false);
    }
  });
  return unsubscribe;
}, [propertyId]);


  // In the PropertyDetails component, add this debugging
useEffect(() => {
  console.log('Property loaded:', property);
  if (property?.owner) {
   console.log('Property owner ID:', property?.owner?.id);
  }
}, [property]);



// Add this helper function to calculate average rating
const calculateAverageRating = (reviews) => {
  if (reviews.length === 0) return 0;
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  return (totalRating / reviews.length).toFixed(1);
};

const loadPropertyReviews = async () => {
  if (!propertyId) return;
  
  try {
    const reviewsQuery = query(
      collection(db, 'properties', propertyId, 'reviews'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(reviewsQuery);
    const propertyReviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
    }));
    
    setReviews(propertyReviews);
    
  } catch (error) {
    console.error('Error loading property reviews:', error);
    setReviews([]);
  }
};

// Add this function to submit a review
// Add this function to submit a review
const submitPropertyReview = async () => {
  if (!user) {
    alert('Please log in to leave a review');
    return;
  }
  
  if (!newReview.comment.trim()) {
    alert('Please write a comment');
    return;
  }
  
  try {
    setSubmittingReview(true);
    
    // Add review to property's subcollection
    const reviewRef = collection(db, 'properties', propertyId, 'reviews');
    await addDoc(reviewRef, {
      ...newReview,
      propertyId: propertyId,
      propertyTitle: property.title,
      reviewerId: user.uid,
      reviewerName: user.displayName || user.email || 'Anonymous User',
      reviewerEmail: user.email,
      createdAt: new Date(),
      updatedAt: new Date(),
      helpful: 0,
      reported: false
    });
    
    // Also add to the property owner's reviews collection
    if (property.owner?.id) {
      const ownerReviewRef = collection(db, 'users', property.owner.id, 'reviews');
      await addDoc(ownerReviewRef, {
        ...newReview,
        propertyId: propertyId,
        propertyTitle: property.title,
        reviewerId: user.uid,
        reviewerName: user.displayName || user.email || 'Anonymous User',
        reviewerEmail: user.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        type: 'property_review',
        helpful: 0,
        reported: false
      });
    }
    
    // Reset form and reload reviews
    setNewReview({
      rating: 5,
      comment: '',
      title: ''
    });
    setShowReviewForm(false);
    await loadPropertyReviews();
    
    alert('Review submitted successfully!');
    
  } catch (error) {
    console.error('Error submitting review:', error);
    alert('Failed to submit review. Please try again.');
  } finally {
    setSubmittingReview(false);
  }
};

const getPriceRange = (price) => {
  const priceNum = parseFloat(price);
  const symbol = property.currency === 'Nigeria Naira' ? '₦' : '$';
  
  if (priceNum < 100000) return `Under ${symbol}100k`;
  if (priceNum < 500000) return `${symbol}100k - ${symbol}500k`;
  if (priceNum < 1000000) return `${symbol}500k - ${symbol}1M`;
  if (priceNum < 5000000) return `${symbol}1M - ${symbol}5M`;
  return `Above ${symbol}5M`;
};

  const getUserProfileFromDB = async (userId) => {
  try {
    // First check if profile exists in profiles subcollection (new structure)
    const profileRef = doc(db, 'users', userId, 'profiles', 'userProfile');
    const profileDoc = await getDoc(profileRef);
    
    if (profileDoc.exists()) {
      return profileDoc.data();
    } else {
      // Fallback to main user document (old structure)
      const userProfile = await getUserProfile(userId);
      if (userProfile) {
        // Return the profile data directly
        return {
          firstName: userProfile.firstName || '',
          lastName: userProfile.lastName || '',
          displayName: userProfile.displayName || `${userProfile.firstName} ${userProfile.lastName}`.trim(),
          primaryPhone: userProfile.primaryPhone || userProfile.phone || '',
          email: userProfile.email || '',
          whatsappPhone: userProfile.whatsappPhone || userProfile.primaryPhone || userProfile.phone || '',
          alternateEmail: userProfile.alternateEmail || '',
          isRealEstateProfessional: userProfile.isRealEstateProfessional || false,
          profileImage: userProfile.profileImage || '',
          companyName: userProfile.companyName || '',
          companyPhone: userProfile.companyPhone || '',
          category: userProfile.category || '',
          website: userProfile.website || '',
          country: userProfile.country || '',
          state: userProfile.state || '',
          city: userProfile.city || '',
          address: userProfile.address || '',
          aboutUs: userProfile.aboutUs || '',
          createdAt: userProfile.createdAt || new Date(),
          totalListings: userProfile.totalListings || 1,
          responseRate: userProfile.responseRate || '95%',
          responseTime: userProfile.responseTime || 'Within an hour',
          verified: userProfile.verified || false
        };
      }
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

const fetchUserWishlist = async (userId) => {
  try {
    const db = getFirestore();
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      setWishlist(userData.wishlist || []);
      // Update the isFavorited state based on current property
      if (propertyId) {
        setIsFavorited((userData.wishlist || []).includes(propertyId));
      }
    }
  } catch (error) {
    console.error('Error fetching wishlist:', error);
  }
};


const toggleWishlist = async () => {
  if (!user) {
    alert('Please log in to add properties to wishlist');
    return;
  }

  try {
    const db = getFirestore();
    const userDocRef = doc(db, 'users', user.uid);
    
    const isInWishlist = wishlist.includes(propertyId);
    
    if (isInWishlist) {
      // Remove from wishlist
      await updateDoc(userDocRef, {
        wishlist: arrayRemove(propertyId)
      });
      setWishlist(prev => prev.filter(id => id !== propertyId));
      setIsFavorited(false);
    } else {
      // Add to wishlist
      await updateDoc(userDocRef, {
        wishlist: arrayUnion(propertyId)
      });
      setWishlist(prev => [...prev, propertyId]);
      setIsFavorited(true);
    }
  } catch (error) {
    console.error('Error updating wishlist:', error);
    alert('Failed to update wishlist. Please try again.');
  }
};
 

  const testDatabaseConnection = async () => {
  try {
    console.log('Testing database connection...');
    
    // Test 1: Check if we can read users collection
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(query(usersRef, limit(1)));
    console.log('Can read users collection:', !usersSnapshot.empty);
    
    // Test 2: Check specific user document
    if (userId) {
      const userDoc = await getDoc(doc(db, 'users', userId));
      console.log('User document exists:', userDoc.exists());
      if (userDoc.exists()) {
        console.log('User document data:', userDoc.data());
      }
    }
    
    // Test 3: Check properties collection
    const propertiesRef = collection(db, 'properties');
    const propertiesSnapshot = await getDocs(query(propertiesRef, limit(1)));
    console.log('Can read properties collection:', !propertiesSnapshot.empty);
    
  } catch (error) {
    console.error('Database connection test failed:', error);
  }
};

// Call this in useEffect for debugging



const formatPrice = (price, currency, pricePer = null) => {
  const symbol = currency === 'Nigeria Naira' ? '₦' : 
                 currency === 'Ghana Cedis' ? '₵' : 
                 currency === 'South African Rand' ? 'R' : '$';
  const formattedPrice = `${symbol}${price?.toLocaleString()}`;
  
  if (pricePer && pricePer !== 'Year') {
    return `${formattedPrice}${pricePer == 'Not Applicable' ? '' : `/${pricePer}`}`;
  }
 

  return formattedPrice;
};

  const handleContactFormChange = (field, value) => {
    setContactForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

const handleSendMessage = async () => {
  // Validate required fields
  if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
    alert('Please fill in all required fields');
    return;
  }
  
  try {
    // Here you can add logic to save the message to Firestore
    const db = getFirestore();
    // Example: Save to a messages collection
    /*
    await addDoc(collection(db, 'messages'), {
      propertyId: property.id,
      ownerId: property.owner.id,
      senderName: contactForm.name,
      senderEmail: contactForm.email,
      senderPhone: contactForm.phone,
      message: contactForm.message,
      createdAt: new Date(),
      status: 'unread'
    });
    */
    
    alert('Message sent successfully!');
    setContactForm({ name: '', email: '', phone: '', message: '' });
    setShowContactForm(false);
  } catch (error) {
    console.error('Error sending message:', error);
    alert('Failed to send message. Please try again.');
  }
};



  const nextImage = () => {
    setCurrentImageIndex(prev => 
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex(prev => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }



  if (!property) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Property not found</p>
       <button
  onClick={() => window.history.back()}
  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
>
  <ArrowLeft className="w-5 h-5" />
  Back to listings
</button>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">

          <div className="flex items-center justify-between">
     <button
  onClick={() => navigate(-1)} // Goes back to previous page
  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
>
  <ArrowLeft className="w-5 h-5" />
  Back to listings
</button>
            <div className="flex items-center gap-3">
          <button
  onClick={toggleWishlist}
  className={`p-2 rounded-full transition-colors ${
    isFavorited ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
  }`}
  title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
>
  <Heart className="w-5 h-5" fill={isFavorited ? 'currentColor' : 'none'} />
</button>
              <button className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* Left Side - Property Details */}
          <div className=" lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
              
              <div className="relative">
                {user && (
  <div className="flex items-center absolute right-0 gap-2 text-md">
    <Heart className={`w-4 h-4 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
    <span className={isFavorited ? 'text-red-600' : 'text-gray-500'}>
      {isFavorited ? 'Saved to wishlist' : 'Not in wishlist'}
    </span>
  </div>
)} 
               <img
  src={property.images[currentImageIndex]}
  alt={property.title}
  className="w-full h-64 sm:h-80 md:h-96 object-cover"
/>
              <div className="absolute top-4 left-4 flex gap-2">
  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
    {property.propertyType}
  </span>
  {property.marketStatus && property.marketStatus !== 'Available' && (
    <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
      {property.marketStatus}
    </span>
  )}
</div>
                {property.propertyCondition === 'Newly Built' && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      New
                    </span>
                  </div>
                )}
                
                {/* Navigation arrows */}
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image indicator dots */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {property.images.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Thumbnail strip */}
             <div className="p-3 sm:p-4 flex gap-2 overflow-x-auto">
                
                {property.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex ? 'border-blue-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
                    {/* Safety Tips */}
          <div className='bg-gray-100 p-6 rounded-lg shadow-sm '>
                  <h2 className='font-bold text-2xl text-blue-500'>Safety Tips </h2>
              <ol className='flex flex-col gap-1 text-gray-600 pt-2 list-decimal pl-5'>
                      <li>Do not make any inspection fee without seeing the agent and property.</li>
                      <li>Only pay Rental fee, Sales fee or any upfront payment after you verify the Landlord.</li>
                      <li>Ensure you meet the Agent in an open location.</li>
                      <li>The Agent does not represent Proerty Preprium and Property Preprium is not liable for any monetary transaction between you and the Agent.</li>
                    </ol>
                  </div>
            {/* Property Info */}
           <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">{property.title}</h1>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>
    {property.showAddress ? property.address : `${property.city}, ${property.state}`}
  </span>
                  </div>
                </div>
   <div className="text-right">
 <div className="text-2xl sm:text-3xl font-bold text-blue-600">
    {property.showPriceOption === 'Contact for price' ?
      'Contact for Price' :
      formatPrice(property.price, property.currency, property.pricePer)
    }
  </div>
  <div className="text-sm text-gray-500">
    {property.advertisingFor === 'Sale' ? 'For Sale' : 
     property.advertisingFor === 'Rent' ? `For Rent` : 
     property.advertisingFor || 'Available'}
  </div>
</div>        
 
              </div>

              {/* Key Features */}
           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 py-4 sm:py-6 border-y border-gray-200">
  <div className="flex items-center gap-2">
    🛏️
    <div>
      <div className="font-semibold text-gray-800">{property.bedroom}</div>
      <div className="text-sm text-gray-600">Bedrooms</div>
    </div>
  </div>
  <div className="flex items-center gap-2">
    🛁
    <div>
      <div className="font-semibold text-gray-800">{property.bathroom}</div>
      <div className="text-sm text-gray-600">Bathrooms</div>
    </div>
  </div>
  <div className="flex items-center gap-2">
    🏠
    <div>
      <div className="font-semibold text-gray-800">{property.toilet || 'N/A'}</div>
      <div className="text-sm text-gray-600">Toilets</div>
    </div>
  </div>
  <div className="flex items-center gap-2">
    📐
    <div>
      <div className="font-semibold text-gray-800">{property.totalArea}</div>
      <div className="text-sm text-gray-600">{property.totalAreaUnit}</div>
    </div>
  </div>
</div>

              {/* Description */}
              <div className="py-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{property.description}</p>
              </div>

              {/* Property Details */}
    
<div className="py-6 border-t border-gray-200">
  <h3 className="text-lg font-semibold text-gray-800 mb-4">Property Details</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
    
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600">Property Type</span>
      <span className="font-medium text-gray-800">{property.propertyType || 'Not specified'}</span>
    </div>
    
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600">Use of Property</span>
      <span className="font-medium text-gray-800">{property.useOfProperty || 'Not specified'}</span>
    </div>
    
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600">Market Status</span>
      <span className="font-medium text-gray-800">{property.marketStatus || 'Available'}</span>
    </div>
    
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600">Location</span>
      <span className="font-medium text-gray-800">{property.city}, {property.state}, {property.country}</span>
    </div>
    
    {property.yearBuilt && (
      <div className="flex justify-between py-2 border-b border-gray-100">
        <span className="text-gray-600">Year Built</span>
        <span className="font-medium text-gray-800">{property.yearBuilt}</span>
      </div>
    )}
    
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600">Condition</span>
      <span className="font-medium text-gray-800">{property.propertyCondition || 'Not specified'}</span>
    </div>
    
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600">Furnishing Status</span>
      <span className="font-medium text-gray-800">{property.furnishingStatus || 'Not specified'}</span>
    </div>
    
    {property.coveredArea && (
      <div className="flex justify-between py-2 border-b border-gray-100">
        <span className="text-gray-600">Covered Area</span>
        <span className="font-medium text-gray-800">{property.coveredArea} {property.coveredAreaUnit}</span>
      </div>
    )}
    
    {property.availableFrom && (
      <div className="flex justify-between py-2 border-b border-gray-100">
        <span className="text-gray-600">Available From</span>
        <span className="font-medium text-gray-800">{new Date(property.availableFrom).toLocaleDateString()}</span>
      </div>
    )}
    
    {property.minimumRentPeriod && property.advertisingFor === 'Rent' && (
      <div className="flex justify-between py-2 border-b border-gray-100">
        <span className="text-gray-600">Minimum Rent Period</span>
        <span className="font-medium text-gray-800">{property.minimumRentPeriod}</span>
      </div>
    )}
    
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600">Pet Policy</span>
      <span className="font-medium text-gray-800 flex items-center gap-1">
        {property.petPolicy === 'Allowed' ? (
          <><CheckCircle className="w-4 h-4 text-green-500" /> Pets Allowed</>
        ) : (
          <><XCircle className="w-4 h-4 text-red-500" /> No Pets</>
        )}
      </span>
    </div>
    
    <div className="flex justify-between py-2 border-b border-gray-100">
      <span className="text-gray-600">Smoking Policy</span>
      <span className="font-medium text-gray-800 flex items-center gap-1">
        {property.smokingPolicy === 'Allowed' ? (
          <><CheckCircle className="w-4 h-4 text-green-500" /> Smoking Allowed</>
        ) : (
          <><XCircle className="w-4 h-4 text-red-500" /> No Smoking</>
        )}
      </span>
    </div>
  </div>
</div>

{property.utilitiesIncluded && property.utilitiesIncluded.length > 0 && (
  <div className="py-6 border-t border-gray-200">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Utilities Included</h3>
   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
      {property.utilitiesIncluded.map((utility, index) => (
        <div key={index} className="flex items-center gap-2 text-gray-700">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-sm">{utility}</span>
        </div>
      ))}
    </div>
  </div>
)}


              {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
  <div className="py-6 border-t border-gray-200">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Amenities</h3>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {property.amenities.map((amenity, index) => (
        <div key={index} className="flex items-center gap-2 text-gray-700">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <span className="text-sm">{amenity}</span>
        </div>
      ))}
    </div>
  </div>
)}

              {/* Features */}
          {property.features && property.features.length > 0 && (
  <div className="py-6 border-t border-gray-200">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Features</h3>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {property.features.map((feature, index) => (
        <div key={index} className="flex items-center gap-2 text-gray-700">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          <span className="text-sm">{feature}</span>
        </div>
      ))}
    </div>
  </div>
)}

{property.nearbyAmenities && property.nearbyAmenities.length > 0 && property.nearbyAmenities.some(amenity => amenity.trim() !== '') && (
  <div className="py-6 border-t border-gray-200">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Nearby Amenities</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {property.nearbyAmenities.filter(amenity => amenity.trim() !== '').map((amenity, index) => (
        <div key={index} className="flex items-center gap-2 text-gray-700">
          <MapPin className="w-4 h-4 text-purple-600" />
          <span className="text-sm">{amenity}</span>
        </div>
      ))}
    </div>
  </div>
)}

            </div>
    <div className='flex justify-between items-center bg-white p-4 rounded-md'>
      <div className='flex items-center gap-2'>

      <img src="https://propertypro.ng/assets/new_public/images/8356a8ec6fcfe71b646ae827967e7d06-shield.webp" alt="" />
      <div>
        <h3 className='font-medium text-xl py-3 text-gray-800'>Property is verified as real </h3>
        <p className='text-gray-600'>if reported as fake, we will investigate to comfirm if this property isn't real  </p>
      </div>
     
      </div>
       <button className='border-1 p-3 rounded-md font-medium text-blue-500 hover:bg-blue-500 hover:text-white animation-all duration-300'>Report Property </button>
    </div>
   <RecommendedProperties
     currentPropertyId={propertyId}
  preferredLocation={{
    city: property.city,
    state: property.state,
    country: property.country
  }}
  preferredType={property.propertyType}
  maxProperties={3}
    />
          </div>

          {/* Right Side - Agent/Owner Info */}
          <div className="space-y-6">
            {/* Owner Profile Card */}
       <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm lg:sticky lg:top-24">
  <div className="text-center mb-6">
    <div className="relative inline-block cursor-pointer" onClick={() => navigate(`/profile/${property.owner.id}`)}>
      <img
        src={property.owner.profilePicture}
        alt={property.owner.name}
        className="w-20 h-20 rounded-full object-cover mx-auto mb-3 hover:opacity-80 transition-opacity"
      />
      {property.owner.verified && (
        <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1">
          <Shield className="w-3 h-3" />
        </div>
      )}
    </div>
  <h3 
  className="text-lg font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
  onClick={() => navigate(`/profile/${property.owner.id}`)}
>
  {property.owner.name}
</h3>
    {property.owner.isRealEstateProfessional ? (
      <div className="text-center">
        <p className="text-sm text-gray-600">{property.owner.category || 'Real Estate Professional'}</p>
        {property.owner.companyName && (
          <p className="text-sm font-medium text-blue-600">{property.owner.companyName}</p>
        )}
        {property.owner.city && property.owner.state && (
          <p className="text-xs text-gray-500">{property.owner.city}, {property.owner.state}</p>
        )}
      </div>
    ) : (
      <p className="text-sm text-gray-600">Property Owner</p>
    )}
  </div>

  {/* Show company about us if available */}
  {property.owner.aboutUs && (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-700 line-clamp-3">{property.owner.aboutUs}</p>
    </div>
  )}

              {/* Owner Stats */}
             <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
    <div className="text-center">
      <div className="font-semibold text-gray-800">{property.owner.totalListings}</div>
      <div className="text-xs text-gray-600">Total Listings</div>
    </div>
    <div className="text-center">
      <div className="font-semibold text-gray-800">{property.owner.responseRate}</div>
      <div className="text-xs text-gray-600">Response Rate</div>
    </div>
  </div>

              {/* Contact Info */}
              <div className="space-y-3 mb-6">
    <div className="flex items-center gap-3 text-gray-700">
      <Phone className="w-4 h-4" />
      <span className="text-sm">{property.owner.phone}</span>
    </div>
    <div className="flex items-center gap-3 text-gray-700">
      <MessageCircle className="w-4 h-4" />
      <span className="text-sm">{property.owner.whatsapp}</span>
    </div>
    <div className="flex items-center gap-3 text-gray-700">
      <Mail className="w-4 h-4" />
      <span className="text-sm">{property.owner.email}</span>
    </div>
    <div className="flex items-center gap-3 text-gray-700">
      <Calendar className="w-4 h-4" />
      <span className="text-sm">Responds {property.owner.responseTime}</span>
    </div>
    {property.owner.website && (
      <div className="flex items-center gap-3 text-gray-700">
        <Globe className="w-4 h-4" />
        <a 
          href={property.owner.website} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Visit Website
        </a>
      </div>
    )}
  </div>

              {/* Action Buttons */}
            
<div className="space-y-2 sm:space-y-3">
  
  <a  href={`https://wa.me/${property.owner.whatsapp?.replace(/[^\d]/g, '')}`}
    target="_blank"
    rel="noopener noreferrer"
   className="w-full bg-green-600 text-white py-2 sm:py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
  >
    <MessageCircle className="w-4 h-4" />
    WhatsApp
  </a>
  <a
    href={`tel:${property.owner.phone}`}
    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
  >
    <Phone className="w-4 h-4" />
    Call Now
  </a>
  <button
    onClick={() => setShowContactForm(!showContactForm)}
    className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
  >
    <MessageSquare className="w-4 h-4" />
    Send Message
  </button>
<button
  onClick={() => {
    const ownerId = property?.owner?.id;
    if (ownerId) {
      navigate(`/profile/${ownerId}`);
    } else {
      alert('Owner information not available');
    }
  }}
  className="w-full border border-blue-300 text-blue-600 py-3 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
>
  <User className="w-4 h-4" />
  View Profile
</button>
</div>

              {/* Contact Form */}
              {showContactForm && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-semibold text-gray-800 mb-4">Send a Message</h4>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={contactForm.name}
                      onChange={(e) => handleContactFormChange('name', e.target.value)}
className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm touch-manipulation"
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={contactForm.email}
                      onChange={(e) => handleContactFormChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="tel"
                      placeholder="Your Phone"
                      value={contactForm.phone}
                      onChange={(e) => handleContactFormChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <textarea
                      placeholder="Your message..."
                      value={contactForm.message}
                      onChange={(e) => handleContactFormChange('message', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                    ></textarea>
                    <button
                      onClick={handleSendMessage}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      Send Message
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
};

export default PropertyDetails;