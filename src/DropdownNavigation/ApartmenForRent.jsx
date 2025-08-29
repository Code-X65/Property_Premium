import React, { useState, useEffect } from 'react';
import { ChevronDown, Filter, MapPin, Bed, Bath, Square, Eye, Heart, Search, X, Loader2, Home, Grid, List, Share2 } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, getFirestore, onSnapshot, collectionGroup } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, subscribeToAuthChanges } from '../Firebase Auth/Firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';

const ApartmentForRent = () => {
  
  const [wishlist, setWishlist] = useState([]);
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
const [propertiesPerPage] = useState(8);


  const navigate = useNavigate();
  // Add this function after the fetchProperties functions
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
const shareProperty = async (property) => {
  const shareData = {
    title: property.title,
    text: `Check out this property: ${property.title} in ${property.city}, ${property.state}`,
    url: `${window.location.origin}/property/${property.id}`
  };

  try {
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareData.url);
      alert('Property link copied to clipboard!');
    }
  } catch (error) {
    console.error('Error sharing:', error);
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareData.url);
      alert('Property link copied to clipboard!');
    } catch (clipboardError) {
      console.error('Clipboard error:', clipboardError);
      alert('Unable to share. Please copy the URL manually.');
    }
  }
};
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};
const indexOfLastProperty = currentPage * propertiesPerPage;
const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);
const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);
  // Filter states
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    location: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    searchQuery: '',
    country: '',
    state: '',
    city: ''
  });

  const [sortBy, setSortBy] = useState('shuffle');
  const [isShuffled, setIsShuffled] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  useEffect(() => {
  setCurrentPage(1);
}, [filters, sortBy]);

  // Location data from the original CreateListing component
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

  // Authentication state listener
// Replace the existing authentication useEffect with this
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

  // Fetch properties from Firestore
  const fetchProperties = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      
      // Start with a simpler query to avoid index issues
      let propertiesQuery;
      
      try {
        // Try the full query first
        propertiesQuery = query(
          collection(db, 'properties'),
          where('advertisingFor', '==', 'Rent'),
          where('propertyType', '==', 'Apartment'),
          where('status', '==', 'active'),
          orderBy('createdAt', 'desc')
        );
      } catch (indexError) {
        console.log('Composite index not ready, using simpler query');
        // Fallback to simpler query without orderBy
        propertiesQuery = query(
          collection(db, 'properties'),
          where('advertisingFor', '==', 'Rent'),
          where('propertyType', '==', 'Apartment'),
          where('status', '==', 'active')
        );
      }

      const querySnapshot = await getDocs(propertiesQuery);
      const propertiesData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        propertiesData.push({
          id: doc.id,
          ...data,
          // Ensure createdAt is properly handled
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
        });
      });

      // Sort in JavaScript if we couldn't sort in Firestore
      propertiesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const shuffledProperties = shuffleArray(propertiesData);
setProperties(shuffledProperties);
setFilteredProperties(shuffledProperties);
setIsShuffled(true); // Mark as shuffled

      setError('');
    } catch (error) {
      console.error('Error fetching properties:', error);
      
      // Try even simpler query as last resort
      try {
        const db = getFirestore();
        const simpleQuery = query(collection(db, 'properties'));
        const querySnapshot = await getDocs(simpleQuery);
        const propertiesData = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Filter for Rent properties in JavaScript
          if (data.advertisingFor === 'Rent' && data.status === 'active' && data.propertyType === 'Apartment') {
            propertiesData.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
            });
          }
        });

        propertiesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
const shuffledProperties = shuffleArray(propertiesData);

       setProperties(shuffledProperties);
setFilteredProperties(shuffledProperties);
        setError('');
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        setError('Failed to load properties. The database index is still building. Please try again in a few minutes.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Alternative method for user subcollections (if that's your structure)
  const fetchPropertiesFromUserCollections = async () => {
    try {
      setLoading(true);
      const db = getFirestore();
      
      // Use collectionGroup to query across all user subcollections
      try {
        const propertiesQuery = query(
          collectionGroup(db, 'properties'),
          where('advertisingFor', '==', 'Rent'),
          where('propertyType', '==', 'Apartment'),
          where('status', '==', 'active')
        );

        const querySnapshot = await getDocs(propertiesQuery);
        const propertiesData = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          propertiesData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
          });
        });

        // Sort in JavaScript since we can't use orderBy with collectionGroup and where clauses
propertiesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
const shuffledProperties = shuffleArray(propertiesData);
setProperties(shuffledProperties);
setFilteredProperties(shuffledProperties);
setIsShuffled(true);
        setError('');
      } catch (error) {
        console.error('Collection group query failed:', error);
        // Fallback: manually fetch from known user collections
        // This is less efficient but works when indexes aren't ready
        await fetchPropertiesManually();
      }
    } catch (error) {
      console.error('Error fetching properties from user collections:', error);
      setError('Failed to load properties. The database is still setting up. Please try again in a few minutes.');
    } finally {
      setLoading(false);
    }
  };

  // Manual fetch as absolute fallback
  const fetchPropertiesManually = async () => {
    const db = getFirestore();
    const allProperties = [];

    try {
      // Get all users collection (this might be expensive for large datasets)
      const usersSnapshot = await getDocs(collection(db, 'users'));

      for (const userDoc of usersSnapshot.docs) {
        try {
          const userPropertiesSnapshot = await getDocs(
            collection(db, 'users', userDoc.id, 'properties')
          );
          
          userPropertiesSnapshot.forEach((propertyDoc) => {
            const data = propertyDoc.data();
            if (data.advertisingFor === 'Rent' && data.status === 'active' && data.propertyType === 'Apartment') {
              allProperties.push({
                id: propertyDoc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
              });
            }
          });
        } catch (userError) {
          console.log(`Error fetching properties for user ${userDoc.id}:`, userError);
          // Continue with other users
        }
      }

      allProperties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
const shuffledProperties = shuffleArray(allProperties);
setProperties(shuffledProperties);
setFilteredProperties(shuffledProperties);
setIsShuffled(true);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    // Based on your CreateListing code, properties are stored in user subcollections
    // Use this method to fetch from users/{userId}/properties structure
    fetchPropertiesFromUserCollections();
    
    // Uncomment the line below and comment the line above if you have a main properties collection
    // fetchProperties();
  }, []);

  // Format price function
  const formatPrice = (price, currency) => {
    const symbol = currency === 'Nigeria Naira' ? '₦' : '$';
    if (price >= 1000000) {
      return `${symbol}${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${symbol}${(price / 1000).toFixed(0)}K`;
    }
    return `${symbol}${price.toLocaleString()}`;
  };

  // Get price display based on showPrice options
const getPriceDisplay = (property) => {
  const symbol = property.currency === 'Nigeria Naira' ? '₦' : '$';
  return `${symbol}${property.price?.toLocaleString() || '0'}`;
};

  // Filter and sort properties
  useEffect(() => {
    let filtered = properties.filter(property => {
      const matchesSearch = !filters.searchQuery || 
        property.title?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        property.location?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        property.description?.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      const matchesPrice = (!filters.priceMin || property.price >= parseInt(filters.priceMin)) &&
        (!filters.priceMax || property.price <= parseInt(filters.priceMax));
      
      const matchesLocation = !filters.location || 
        property.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
        property.state?.toLowerCase().includes(filters.location.toLowerCase()) ||
        property.country?.toLowerCase().includes(filters.location.toLowerCase());
      
      const matchesType = !filters.propertyType || property.propertyType === filters.propertyType;
      const matchesBedrooms = !filters.bedrooms || property.bedroom >= parseInt(filters.bedrooms);
      const matchesBathrooms = !filters.bathrooms || property.bathroom >= parseInt(filters.bathrooms);
      const matchesCountry = !filters.country || property.country === filters.country;
      const matchesState = !filters.state || property.state === filters.state;
      const matchesCity = !filters.city || property.city === filters.city;

      return matchesSearch && matchesPrice && matchesLocation && matchesType && 
             matchesBedrooms && matchesBathrooms && matchesCountry && matchesState && matchesCity;
    });

// Sort properties
if (sortBy === 'shuffle') {
  if (!isShuffled) {
    filtered = shuffleArray(filtered);
    setIsShuffled(true);
  }
  // If already shuffled and sortBy is still shuffle, keep the current order
} else {
  setIsShuffled(false);
   switch (sortBy) {
    case 'newest':
      filtered.sort((a, b) => {
        const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
        const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
        return bDate - aDate;
      });
      break;
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'bedrooms':
      filtered.sort((a, b) => b.bedroom - a.bedroom);
      break;
    default:
      break;
  }
}

    setFilteredProperties(filtered);
  }, [filters, sortBy, properties]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      priceMin: '',
      priceMax: '',
      location: '',
      propertyType: '',
      bedrooms: '',
      bathrooms: '',
      searchQuery: '',
      country: '',
      state: '',
      city: ''
    });
  };

 // Replace the existing toggleFavorite function with this
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
      // Remove from wishlist
      await updateDoc(userDocRef, {
        wishlist: arrayRemove(propertyId)
      });
      setWishlist(prev => prev.filter(id => id !== propertyId));
    } else {
      // Add to wishlist
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



const PropertyCard = ({ property, viewMode = 'grid' }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 flex">
      <div className="relative w-32 sm:w-48 md:w-64 h-full flex-shrink-0">
        <img 
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'} 
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-1 sm:top-2 md:top-3 left-1 sm:left-2 md:left-3">
          <span className="bg-blue-500 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium">
            {property.propertyType}
          </span>
        </div>
        <div className="absolute top-1 sm:top-2 md:top-3 right-1 sm:right-2 md:right-3">
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => shareProperty(property)}
              className="p-1 sm:p-1.5 md:p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 transition-colors"
              title="Share property"
            >
              <Share2 className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4" />
            </button>
            <button
              onClick={() => toggleWishlist(property.id)}
              className={`p-1 sm:p-1.5 md:p-2 rounded-full transition-colors ${
                wishlist.includes(property.id) 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              title="Add to wishlist"
            >
              <Heart className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4" fill={wishlist.includes(property.id) ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-2 sm:p-4 md:p-6 flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className='flex justify-between gap-2 sm:gap-4 mb-2 sm:mb-3 md:mb-4'>
            <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 truncate">
              {property.title}
            </h3>
            <div className="text-right flex-shrink-0">
              <div className="text-sm sm:text-lg md:text-2xl font-bold text-blue-600">
                {getPriceDisplay(property)}
              </div>
              <div className="text-xs sm:text-sm text-gray-500">For Rent</div>
            </div>
          </div>
          
          <div className="flex items-center text-gray-600 mb-2 sm:mb-3 md:mb-4">
            <MapPin className="w-3 sm:w-3.5 md:w-4 h-3 sm:h-3.5 md:h-4 mr-1 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">
              {property.showAddress ? property.address : `${property.city}, ${property.state}`}
            </span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 md:gap-6 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 md:mb-4">
            <div className="flex items-center gap-1">
              🛏️
              <span className="hidden sm:inline">{property.bedroom} Beds</span>
              <span className="sm:hidden">{property.bedroom}</span>
            </div>
            <div className="flex items-center gap-1">
              🛁
              <span className="hidden sm:inline">{property.bathroom} Baths</span>
              <span className="sm:hidden">{property.bathroom}</span>
            </div>
            {property.totalArea && (
              <div className="flex items-center gap-1">
                📐
                <span className="hidden md:inline">{property.totalArea} {property.totalAreaUnit}</span>
                <span className="md:hidden">{property.totalArea}</span>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 md:mb-4 line-clamp-1 sm:line-clamp-2 md:line-clamp-3">
            {property.description}
          </p>
        </div>
        
        <button 
          onClick={() => navigate(`/property/${property.id}`)}
          className="bg-blue-600 text-white py-1.5 sm:py-2 px-3 sm:px-6 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 sm:gap-2 self-start text-xs sm:text-sm"
        >
          <Eye className="w-3 sm:w-4 h-3 sm:h-4" />
          <span className="hidden sm:inline">View Details</span>
          <span className="sm:hidden">View</span>
        </button>
      </div>
    </div>
    );
  }

  // Grid view (existing code)
  return (
     <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
    <div className="relative">
      <img 
        src={property.images?.[0] || 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'} 
        alt={property.title}
        className="w-full h-48 object-cover"
      />
      <div className="absolute top-3 left-3">
        <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
          {property.propertyType}
        </span>
      </div>
    <div className="absolute top-3 right-3">
  <div className="flex gap-2">
    <button
      onClick={() => shareProperty(property)}
      className="p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 transition-colors"
      title="Share property"
    >
      <Share2 className="w-4 h-4" />
    </button>
    <button
      onClick={() => toggleWishlist(property.id)}
      className={`p-2 rounded-full transition-colors ${
        wishlist.includes(property.id) 
          ? 'bg-red-500 text-white' 
          : 'bg-white text-gray-600 hover:bg-gray-100'
      }`}
      title="Add to wishlist"
    >
      <Heart className="w-4 h-4" fill={wishlist.includes(property.id) ? 'currentColor' : 'none'} />
    </button>
  </div>
</div>
    </div>
    
    <div className="p-4">
    
      <div className='flex justify-between gap-4' >
      <h3 className="text-gray-800 font-medium mb-2 line-clamp-2">
        {property.title}
      </h3>
  <div className="text-right">
  <div className="text-xl font-semibold text-blue-600">
    {getPriceDisplay(property)}
  </div>
  <div className="text-sm text-gray-500">For Rent</div>
</div>
      </div>
      
      <div className="flex items-center text-gray-600 mb-3">
        <MapPin className="w-4 h-4 mr-1" />
        <span className="text-sm">
          {property.showAddress ? property.address : `${property.city}, ${property.state}`}
        </span>
      </div>
      
      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
        <div className="flex items-center">
          🛏️
          <span>{property.bedroom} Beds</span>
        </div>
        <div className="flex items-center">
          🛁
          <span>{property.bathroom} Baths</span>
        </div>
        {property.totalArea && (
          <div className="flex items-center">
            📐
            <span>{property.totalArea} {property.totalAreaUnit}</span>
          </div>
        )}
      </div>
      
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {property.description}
      </p>
      
  <button 
    onClick={() => navigate(`/property/${property.id}`)}
    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
>
    <Eye className="w-4 h-4" />
    View Details
</button>
    </div>
  </div>
  );
};

  const SelectField = ({ label, value, onChange, options, placeholder = 'Select type' }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-sm"
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700">{error}</p>
        <button 
          onClick={fetchProperties}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }




return (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto">
      {/* Top Filter Bar - Always visible */}
      <div className="bg-white border-b border-gray-200 p-4 top-0 z-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </h2>
         <div className="flex items-center gap-4">
  <button
    onClick={clearFilters}
    className="text-blue-600 text-sm hover:text-blue-700"
  >
    Clear Filters
  </button>
  <div className="flex items-center gap-2">
    <span className="text-sm text-gray-600">Sort:</span>
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    >
      <option value="newest">Newest</option>
      <option value="price-low">Price ↑</option>
      <option value="price-high">Price ↓</option>
      <option value="bedrooms">Bedrooms</option>
    </select>
  </div>
  <div className="flex items-center gap-2">
    <button
      onClick={() => setViewMode('grid')}
      className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <Grid className="w-4 h-4" />
    </button>
    <button
      onClick={() => setViewMode('list')}
      className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
    >
      <List className="w-4 h-4" />
    </button>
  </div>
</div>
        </div>

        {/* Filter Grid - Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <input
              type="text"
              placeholder="Search properties..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Price Min */}
          <div>
            <input
              type="number"
              placeholder="Min Price"
              value={filters.priceMin}
              onChange={(e) => handleFilterChange('priceMin', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Price Max */}
          <div>
            <input
              type="number"
              placeholder="Max Price"
              value={filters.priceMax}
              onChange={(e) => handleFilterChange('priceMax', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          {/* Property Type */}
          <div className="relative">
            <select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none text-sm"
            >
              <option value="">Property Type</option>
              {['House', 'Apartment', 'Condo', 'Townhouse', 'Land', 'Commercial', 'Office Space'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-gray-600 text-sm">
            Showing {filteredProperties.length} of {properties.length} properties
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 lg:p-6">
        {/* Properties Grid */}
        {filteredProperties.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg p-8 shadow-sm">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Properties Found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search criteria or filters to find more properties.
              </p>
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
         <div className={viewMode === 'grid' 
  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
  : "space-y-4"
}>
  {currentProperties.map((property) => (
    <PropertyCard key={property.id} property={property} viewMode={viewMode} />
  ))}
</div>
        )}

        {/* Load More Button */}
     {filteredProperties.length > propertiesPerPage && (
  <div className="flex justify-center items-center mt-8 space-x-2">
    {/* Previous Button */}
    <button
      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      disabled={currentPage === 1}
      className={`flex items-center px-3 py-2 rounded-md ${
        currentPage === 1
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
      }`}
    >
      <ChevronDown className="w-4 h-4 mr-1 rotate-90" />
      Previous
    </button>

    {/* Page Numbers */}
    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
      let pageNumber;
      if (totalPages <= 5) {
        pageNumber = i + 1;
      } else if (currentPage <= 3) {
        pageNumber = i + 1;
      } else if (currentPage >= totalPages - 2) {
        pageNumber = totalPages - 4 + i;
      } else {
        pageNumber = currentPage - 2 + i;
      }

      return (
        <button
          key={pageNumber}
          onClick={() => setCurrentPage(pageNumber)}
          className={`px-3 py-2 rounded-md ${
            currentPage === pageNumber
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          }`}
        >
          {pageNumber}
        </button>
      );
    })}

    {/* Next Button */}
    <button
      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
      disabled={currentPage === totalPages}
      className={`flex items-center px-3 py-2 rounded-md ${
        currentPage === totalPages
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
      }`}
    >
      Next
      <ChevronDown className="w-4 h-4 ml-1 -rotate-90" />
    </button>
  </div>
)}

{/* Page Info */}
{filteredProperties.length > 0 && (
  <div className="text-center mt-4">
    <p className="text-sm text-gray-600">
      Showing {indexOfFirstProperty + 1} to {Math.min(indexOfLastProperty, filteredProperties.length)} of {filteredProperties.length} results
    </p>
  </div>
)}
      </div>

      {/* Floating Action Button - Create Listing */}
      {user && (
        <div className="fixed bottom-6 right-6">
          <button 
            onClick={() => window.location.href = '/Property_Premium/post_a_listing'}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            title="Create New Listing"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      )}
    </div>
  </div>
);
};

export default ApartmentForRent;