import React, { useState, useEffect } from 'react';
import { ChevronDown, Filter, MapPin, Bed, Bath, Square, Eye, Heart, Search, X, Loader2, Home } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, getFirestore, onSnapshot, collectionGroup, limit } from 'firebase/firestore';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCurrentUser, subscribeToAuthChanges } from '../Firebase Auth/Firebase';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';


const PropertySearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [wishlist, setWishlist] = useState([]);
  const [properties, setProperties] = useState([]);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [propertiesPerPage] = useState(12);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
const [suggestionLoading, setSuggestionLoading] = useState(false);

  const navigate = useNavigate();

  // Get search query from URL parameters
  const initialSearchQuery = searchParams.get('q') || '';

  // Filter states
  const [filters, setFilters] = useState({
    priceMin: '',
    priceMax: '',
    location: '',
    propertyType: '',
    bedrooms: '',
    bathrooms: '',
    searchQuery: initialSearchQuery,
    country: '',
    state: '',
    city: '',
    advertisingFor: '' // For Sale, Rent, Shortlet
  });

  const [sortBy, setSortBy] = useState('newest');
  const [isShuffled, setIsShuffled] = useState(false);

  // Fetch user wishlist
  const fetchUserWishlist = async (userId) => {
    try {
      const db = getFirestore();
      
      // Try new structure first (profiles subcollection)
      const profileRef = doc(db, 'users', userId, 'profiles', 'userProfile');
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        const profileData = profileDoc.data();
        setWishlist(profileData.wishlist || []);
      } else {
        // Fallback to old structure
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setWishlist(userData.wishlist || []);
        }
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  // Shuffle array utility
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    
    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      
      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);
    
    return debouncedValue;
  };
const debouncedFilterSearchQuery = useDebounce(filters.searchQuery, 300);
  // Pagination calculations
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty);
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage);

  // Add this function before the useEffect that calls it (around line 130)

const fetchSearchSuggestions = async (searchTerm) => {
  try {
    const db = getFirestore();
    const suggestions = new Set();
    
    // Search in properties for titles, locations, descriptions
    const propertiesQuery = query(
      collectionGroup(db, 'properties'),
      where('status', '==', 'active'),
      limit(50)
    );
    
    const snapshot = await getDocs(propertiesQuery);
    
    snapshot.forEach((doc) => {
      const data = doc.data();
      const searchTermLower = searchTerm.toLowerCase();
      
      // Check title
      if (data.title && data.title.toLowerCase().includes(searchTermLower)) {
        suggestions.add(data.title);
      }
      
      // Check city
      if (data.city && data.city.toLowerCase().includes(searchTermLower)) {
        suggestions.add(data.city);
      }
      
      // Check state
      if (data.state && data.state.toLowerCase().includes(searchTermLower)) {
        suggestions.add(data.state);
      }
      
      // Check address
      if (data.address && data.address.toLowerCase().includes(searchTermLower)) {
        suggestions.add(data.address);
      }
      
      // Check property type
      if (data.propertyType && data.propertyType.toLowerCase().includes(searchTermLower)) {
        suggestions.add(data.propertyType);
      }
    });
    
    // Convert Set to Array and limit results
    return Array.from(suggestions).slice(0, 8);
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return [];
  }
};

  useEffect(() => {
  const fetchFilterSuggestions = async () => {
    if (debouncedFilterSearchQuery.trim() && debouncedFilterSearchQuery.length >= 2) {
      setSuggestionLoading(true);
      try {
        const suggestions = await fetchSearchSuggestions(debouncedFilterSearchQuery);
        setSearchSuggestions(suggestions);
        setShowSearchSuggestions(suggestions.length > 0);
      } catch (error) {
        console.error('Error fetching filter suggestions:', error);
        setSearchSuggestions([]);
        setShowSearchSuggestions(false);
      } finally {
        setSuggestionLoading(false);
      }
    } else {
      setSearchSuggestions([]);
      setShowSearchSuggestions(false);
    }
  };
  
  fetchFilterSuggestions();
}, [debouncedFilterSearchQuery]);


  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortBy]);

  // Location data
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

// Fetch all properties (Sale, Rent, Shortlet)
const fetchAllProperties = async () => {
  try {
    setLoading(true);
    const db = getFirestore();
    
    try {
      // First try: Simple collection group query without where clause
      const propertiesQuery = collectionGroup(db, 'properties');
      const querySnapshot = await getDocs(propertiesQuery);
      const propertiesData = [];
      
querySnapshot.forEach((doc) => {
  const data = doc.data();
  if (data.status === 'active') {
    propertiesData.push({
      id: doc.id, // ✅ This should be the Firestore document ID
      docPath: doc.ref.path, // Optional: full document path
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
    });
  }
});

      // Sort by creation date
      propertiesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const shuffledProperties = shuffleArray(propertiesData);

      setProperties(shuffledProperties);
      setFilteredProperties(shuffledProperties);
      setError('');
      
    } catch (collectionGroupError) {
      console.error('Collection group query failed:', collectionGroupError);
      // Fallback to main properties collection
      await fetchFromMainCollection();
    }
  } catch (error) {
    console.error('Error fetching properties:', error);
    setError('Failed to load properties. Please try again in a few minutes.');
  } finally {
    setLoading(false);
  }
};

  // Fallback to main properties collection
  const fetchFromMainCollection = async () => {
    const db = getFirestore();
    
    try {
      const propertiesQuery = query(
        collection(db, 'properties'),
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

      propertiesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const shuffledProperties = shuffleArray(propertiesData);

      setProperties(shuffledProperties);
      setFilteredProperties(shuffledProperties);
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchAllProperties();
  }, []);

  // Format price function
  const formatPrice = (price, currency) => {
    const symbol = currency === 'Nigeria Naira' ? '₦' : '$';
    if (price >= 1000000) {
      return `${symbol}${(price / 1000000).toFixed(1)}M`;
    } else if (price >= 1000) {
      return `${symbol}${(price / 1000).toFixed(0)}K`;
    }
    return `${symbol}${price?.toLocaleString() || '0'}`;
  };

  // Get price display
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
        property.description?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        property.address?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        property.city?.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        property.state?.toLowerCase().includes(filters.searchQuery.toLowerCase());
      
      const matchesPrice = (!filters.priceMin || property.price >= parseInt(filters.priceMin)) &&
        (!filters.priceMax || property.price <= parseInt(filters.priceMax));
      
      const matchesLocation = !filters.location || 
        property.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
        property.state?.toLowerCase().includes(filters.location.toLowerCase()) ||
        property.country?.toLowerCase().includes(filters.location.toLowerCase()) ||
        property.address?.toLowerCase().includes(filters.location.toLowerCase());
      
      const matchesType = !filters.propertyType || property.propertyType === filters.propertyType;
      const matchesBedrooms = !filters.bedrooms || property.bedroom >= parseInt(filters.bedrooms);
      const matchesBathrooms = !filters.bathrooms || property.bathroom >= parseInt(filters.bathrooms);
      const matchesCountry = !filters.country || property.country === filters.country;
      const matchesState = !filters.state || property.state === filters.state;
      const matchesCity = !filters.city || property.city === filters.city;
      const matchesAdvertisingFor = !filters.advertisingFor || property.advertisingFor === filters.advertisingFor;

      return matchesSearch && matchesPrice && matchesLocation && matchesType && 
             matchesBedrooms && matchesBathrooms && matchesCountry && matchesState && 
             matchesCity && matchesAdvertisingFor;
    });

    // Sort properties
    if (sortBy === 'shuffle' || isShuffled) {
      filtered = shuffleArray(filtered);
      setIsShuffled(true);
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
          filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
          break;
        case 'price-high':
          filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
          break;
        case 'bedrooms':
          filtered.sort((a, b) => (b.bedroom || 0) - (a.bedroom || 0));
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
      city: '',
      advertisingFor: ''
    });
    // Clear URL search params
    setSearchParams({});
  };

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

  const PropertyCard = ({ property }) => {
    console.log('Property in card:', property.id);
    return(

    <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
      <div className="relative">
        <img 
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'} 
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
            {property.propertyType}
          </span>
          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
            For {property.advertisingFor}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <button
            onClick={() => toggleWishlist(property.id)}
            className={`p-2 rounded-full transition-colors ${
              wishlist.includes(property.id) 
                ? 'bg-red-500 text-white' 
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart className="w-4 h-4" fill={wishlist.includes(property.id) ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className='flex justify-between gap-4'>
          <h3 className="text-gray-800 font-medium mb-2 line-clamp-2 flex-1">
            {property.title}
          </h3>
          <div className="text-right">
            <div className="text-xl font-semibold text-blue-600">
              {getPriceDisplay(property)}
            </div>
            <div className="text-sm text-gray-500">
              {property.advertisingFor === 'Rent' && property.paymentFrequency && 
                `/${property.paymentFrequency.toLowerCase()}`
              }
            </div>
          </div>
        </div>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="text-sm truncate">
            {property.showAddress ? property.address : `${property.city}, ${property.state}`}
          </span>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center">
            🛏️
            <span className="ml-1">{property.bedroom || 0} Beds</span>
          </div>
          <div className="flex items-center">
            🛁
            <span className="ml-1">{property.bathroom || 0} Baths</span>
          </div>
          {property.totalArea && (
            <div className="flex items-center">
              📐
              <span className="ml-1">{property.totalArea} {property.totalAreaUnit}</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {property.description}
        </p>
        
     <button 
  onClick={() => {
    console.log('Navigating to property:', property.id);
    // Pass property data as state (optional)
    navigate(`/Property_Premium/property/${property.id}`, { 
      state: { 
        property: property,
        returnTo: '/Property_Premium/property-search' 
      } 
    });
  }}
  className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
>
  <Eye className="w-4 h-4" />
  View Details
</button>
      </div>
    </div>
    )
};

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="relative flex items-center justify-center">
          <Home className="text-blue-600 h-10 w-10 z-10" />
          <div className="absolute animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
        </div>
        <span className="mt-4 text-gray-600 text-lg font-medium">
          Searching Properties...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={fetchAllProperties}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Property Search</h1>
              {initialSearchQuery && (
                <p className="text-gray-600 mt-1">
                  Search results for: <span className="font-medium">"{initialSearchQuery}"</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={clearFilters}
                className="text-blue-600 text-sm hover:text-blue-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h2>
            <div className="flex items-center gap-4">
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
                  <option value="shuffle">Shuffle</option>
                </select>
              </div>
            </div>
          </div>

          {/* Filter Grid */}
         {/* Search with Firestore Suggestions */}
<div className="relative">
  <div className="relative">
    <input
      type="text"
      placeholder="Search properties..."
      value={filters.searchQuery}
      onChange={(e) => {
        const value = e.target.value;
        handleFilterChange('searchQuery', value);
        
        if (!value.trim()) {
          setShowSearchSuggestions(false);
          setSearchSuggestions([]);
        }
      }}
      onFocus={() => {
        if (filters.searchQuery.trim() && searchSuggestions.length > 0) {
          setShowSearchSuggestions(true);
        }
      }}
      onBlur={() => {
        setTimeout(() => setShowSearchSuggestions(false), 200);
      }}
      className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
    />
    {suggestionLoading && (
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <div className="animate-spin h-3 w-3 border border-gray-400 border-t-transparent rounded-full"></div>
      </div>
    )}
  </div>
  
  {/* Search Suggestions for Filter */}
  {showSearchSuggestions && (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 max-h-60 overflow-y-auto">
      <div className="px-3 py-2 text-xs text-gray-500 font-medium border-b border-gray-100">
        Suggestions
      </div>
      {searchSuggestions.length > 0 ? (
        searchSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => {
              handleFilterChange('searchQuery', suggestion);
              setShowSearchSuggestions(false);
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            <Search className="w-3 h-3 text-gray-400" />
            <span>{suggestion}</span>
          </button>
        ))
      ) : !suggestionLoading && filters.searchQuery.length >= 2 && (
        <div className="px-3 py-2 text-sm text-gray-500 flex items-center gap-2">
          <Search className="w-3 h-3 text-gray-400" />
          No suggestions found
        </div>
      )}
    </div>
  )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {currentProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredProperties.length > propertiesPerPage && (
            <div className="flex justify-center items-center mt-8 space-x-2">
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
              onClick={() => navigate('/Property_Premium/post_a_listing')}
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

export default PropertySearch;