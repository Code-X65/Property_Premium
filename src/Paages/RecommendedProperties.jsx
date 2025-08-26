import React, { useState, useEffect } from 'react';
import { MapPin, Heart, Eye, Loader2, Home } from 'lucide-react';
import { collection, query, getDocs, getFirestore, collectionGroup, where } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, subscribeToAuthChanges } from '../Firebase Auth/Firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

const RecommendedProperties = ({ 
  currentPropertyId, 
  preferredLocation = null, 
  preferredType = null,
  maxProperties = 6 
}) => {
  const [properties, setProperties] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Shuffle array function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Authentication state listener
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setUser(user);
      if (user) {
        fetchUserWishlist(user.uid);
      } else {
        setWishlist([]);
      }
    });
    return unsubscribe;
  }, []);

  // Fetch user wishlist
  const fetchUserWishlist = async (userId) => {
    try {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setWishlist(userData.wishlist || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  // Fetch recommended properties
  const fetchRecommendedProperties = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      
      let allProperties = [];

      try {
        // Try collection group query first (for user subcollections)
      const propertiesQuery = query(
  collectionGroup(db, 'properties')
);

        const querySnapshot = await getDocs(propertiesQuery);
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Exclude current property
          if (doc.id !== currentPropertyId) {
            allProperties.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
            });
          }
        });
      } catch (error) {
        console.log('Collection group query failed, trying main collection:', error);
        
        // Fallback to main properties collection
        const mainPropertiesQuery = query(
  collection(db, 'properties')
);

        const mainQuerySnapshot = await getDocs(mainPropertiesQuery);
        
        mainQuerySnapshot.forEach((doc) => {
          const data = doc.data();
          if (doc.id !== currentPropertyId) {
            allProperties.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
            });
          }
        });
      }

      // Apply intelligent filtering for recommendations
      let recommendedProperties = [...allProperties];

      // Prioritize properties with similar location or type
      if (preferredLocation || preferredType) {
        const prioritized = [];
        const others = [];

        recommendedProperties.forEach(property => {
          let score = 0;
          
          // Location matching (city, state, or country)
          if (preferredLocation) {
            if (property.city === preferredLocation.city) score += 3;
            else if (property.state === preferredLocation.state) score += 2;
            else if (property.country === preferredLocation.country) score += 1;
          }

          // Property type matching
          if (preferredType && property.propertyType === preferredType) {
            score += 2;
          }

          if (score > 0) {
            prioritized.push({ ...property, score });
          } else {
            others.push(property);
          }
        });

        // Sort prioritized by score (descending)
        prioritized.sort((a, b) => b.score - a.score);
        
        // Combine prioritized and others
        recommendedProperties = [...prioritized, ...others];
      }

      // Shuffle the array for variety on each reload
      const shuffledProperties = shuffleArray(recommendedProperties);

      // Limit to maxProperties
      const limitedProperties = shuffledProperties.slice(0, maxProperties);

      setProperties(limitedProperties);
    } catch (error) {
      console.error('Error fetching recommended properties:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendedProperties();
  }, [currentPropertyId, preferredLocation, preferredType]);

  // Toggle wishlist
  const toggleWishlist = async (propertyId) => {
    if (!user) {
      alert('Please log in to add properties to wishlist');
      return;
    }

    try {
      const db = getFirestore();
      const userDocRef = doc(db, 'users', user.uid);
      
      const isInWishlist = wishlist.includes(propertyId);
      
      if (isInWishlist) {
        await updateDoc(userDocRef, {
          wishlist: arrayRemove(propertyId)
        });
        setWishlist(prev => prev.filter(id => id !== propertyId));
      } else {
        await updateDoc(userDocRef, {
          wishlist: arrayUnion(propertyId)
        });
        setWishlist(prev => [...prev, propertyId]);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      alert('Failed to update wishlist. Please try again.');
    }
  };

  // Format price display
  const getPriceDisplay = (property) => {
    const symbol = property.currency === 'Nigeria Naira' ? '₦' : '$';
    const price = property.price || 0;
    
    if (price >= 1000000) {
      return `${symbol}${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${symbol}${(price / 1000).toFixed(0)}K`;
    }
    return `${symbol}${price.toLocaleString()}`;
  };

  // Get advertisement type display
  const getAdTypeDisplay = (advertisingFor) => {
    return advertisingFor === 'Sale' ? 'For Sale' : 'For Rent';
  };

  // Property Card Component
  const PropertyCard = ({ property }) => (
    <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className="relative">
        <img 
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'} 
          alt={property.title}
          className="w-full h-40 sm:h-48 object-cover"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
            {property.propertyType}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <button
            onClick={() => toggleWishlist(property.id)}
            className={`p-1.5 rounded-full transition-colors ${
              wishlist.includes(property.id) 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className="w-3 h-3" fill={wishlist.includes(property.id) ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
      
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <div className="text-lg font-bold text-blue-600">
            {getPriceDisplay(property)}
          </div>
          <div className="text-xs text-gray-500">
            {getAdTypeDisplay(property.advertisingFor)}
          </div>
        </div>
        
        <h3 className="text-gray-800 font-medium mb-2 line-clamp-2 text-sm">
          {property.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="text-xs truncate">
            {property.showAddress ? property.address : `${property.city}, ${property.state}`}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
          <div className="flex items-center space-x-2">
            {property.bedroom && (
              <span>🛏️ {property.bedroom}</span>
            )}
            {property.bathroom && (
              <span>🛁 {property.bathroom}</span>
            )}
          </div>
          {property.totalArea && (
            <span>📐 {property.totalArea} {property.totalAreaUnit}</span>
          )}
        </div>
        
        <button 
          onClick={() => navigate(`/Property_Premium/property/${property.id}`)}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 text-sm"
        >
          <Eye className="w-3 h-3" />
          View Details
        </button>
      </div>
    </div>
  );

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

  if (properties.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No recommended properties available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Recommended Properties</h2>
        <button
          onClick={fetchRecommendedProperties}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {properties.map((property) => (
          <PropertyCard key={`${property.id}-${Math.random()}`} property={property} />
        ))}
      </div>

      {properties.length === maxProperties && (
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/Property_Premium/properties')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            View All Properties →
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendedProperties;