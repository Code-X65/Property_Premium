import React, { useState, useEffect } from 'react';
import { Heart, MapPin, Bed, Bath, Square, Eye, Trash2, Share2, Calendar, Filter, Search, X, Loader2, Home } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, getFirestore, onSnapshot, collectionGroup, doc, updateDoc, arrayUnion, arrayRemove, getDoc, documentId } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser, subscribeToAuthChanges } from '../Firebase Auth/Firebase';


1


const Wishlist = () => {
    const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [wishlistProperties, setWishlistProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [filterType, setFilterType] = useState('');
  const [selectedProperties, setSelectedProperties] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for demonstration
  const mockProperties = [
    {
      id: '1',
      title: 'Beautiful 3 Bedroom Apartment in Victoria Island',
      price: 2500000,
      currency: 'Nigeria Naira',
      propertyType: 'Apartment',
      bedroom: 3,
      bathroom: 2,
      totalArea: '120',
      totalAreaUnit: 'sqm',
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      address: '123 Victoria Island Road, Lagos',
      showAddress: true,
      images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop'],
      description: 'Modern apartment with stunning ocean views and premium amenities.',
      dateAddedToWishlist: new Date('2024-01-15'),
      createdAt: new Date('2024-01-10')
    },
    {
      id: '2',
      title: 'Luxury Villa in Lekki Phase 1',
      price: 85000000,
      currency: 'Nigeria Naira',
      propertyType: 'House',
      bedroom: 5,
      bathroom: 4,
      totalArea: '450',
      totalAreaUnit: 'sqm',
      city: 'Lekki',
      state: 'Lagos',
      country: 'Nigeria',
      address: 'Lekki Phase 1, Lagos',
      showAddress: false,
      images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop'],
      description: 'Spacious luxury villa with private garden and swimming pool.',
      dateAddedToWishlist: new Date('2024-01-20'),
      createdAt: new Date('2024-01-18')
    },
    {
      id: '3',
      title: 'Modern Office Space in Ikeja',
      price: 15000000,
      currency: 'Nigeria Naira',
      propertyType: 'Office Space',
      bedroom: 0,
      bathroom: 2,
      totalArea: '200',
      totalAreaUnit: 'sqm',
      city: 'Ikeja',
      state: 'Lagos',
      country: 'Nigeria',
      address: 'CBD Ikeja, Lagos',
      showAddress: true,
      images: ['https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop'],
      description: 'Premium office space in the heart of Ikeja business district.',
      dateAddedToWishlist: new Date('2024-01-25'),
      createdAt: new Date('2024-01-22')
    }
  ];
const fetchWishlistProperties = async (userId) => {
  try {
    setLoading(true);
    const db = getFirestore();
    
    // Get user's wishlist
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists() || !userDoc.data().wishlist?.length) {
      setWishlistProperties([]);
      setLoading(false);
      return;
    }
    
    const wishlistIds = userDoc.data().wishlist;
    
    // Fetch properties using the same structure as PropertiesForSale
    const allProperties = [];
    
    try {
      // Try to use collectionGroup query first
      const propertiesQuery = query(
        collectionGroup(db, 'properties'),
        where(documentId(), 'in', wishlistIds.slice(0, 10)) // Firestore 'in' query limit is 10
      );
      
      const querySnapshot = await getDocs(propertiesQuery);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        allProperties.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
          dateAddedToWishlist: new Date() // You might want to store this separately
        });
      });
      
      // If we have more than 10 wishlist items, fetch in batches
      if (wishlistIds.length > 10) {
        for (let i = 10; i < wishlistIds.length; i += 10) {
          const batch = wishlistIds.slice(i, i + 10);
          const batchQuery = query(
            collectionGroup(db, 'properties'),
            where(documentId(), 'in', batch)
          );
          
          const batchSnapshot = await getDocs(batchQuery);
          batchSnapshot.forEach((doc) => {
            const data = doc.data();
            allProperties.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
              dateAddedToWishlist: new Date()
            });
          });
        }
      }
      
    } catch (error) {
      console.error('CollectionGroup query failed, trying manual fetch:', error);
      
      // Fallback: manually fetch from user collections
      const usersSnapshot = await getDocs(collection(db, 'users'));
      
      for (const userDocSnapshot of usersSnapshot.docs) {
        try {
          const userPropertiesSnapshot = await getDocs(
            collection(db, 'users', userDocSnapshot.id, 'properties')
          );
          
          userPropertiesSnapshot.forEach((propertyDoc) => {
            if (wishlistIds.includes(propertyDoc.id)) {
              const data = propertyDoc.data();
              allProperties.push({
                id: propertyDoc.id,
                ...data,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                dateAddedToWishlist: new Date()
              });
            }
          });
        } catch (userError) {
          console.log(`Error fetching properties for user ${userDocSnapshot.id}:`, userError);
        }
      }
    }
    
    setWishlistProperties(allProperties);
    setError('');
    
  } catch (error) {
    console.error('Error fetching wishlist properties:', error);
    setError('Failed to load wishlist properties. Please try again.');
  } finally {
    setLoading(false);
  }
};
  // Authentication state listener
useEffect(() => {
  const unsubscribe = subscribeToAuthChanges((user) => {
    setUser(user);
    if (user) {
      fetchWishlistProperties(user.uid);
    } else {
      setWishlistProperties([]);
      setLoading(false);
    }
  });
  return unsubscribe;
}, []);

  // Remove property from wishlist
 const removeFromWishlist = async (propertyId) => {
  if (!user) return;

  try {
    const db = getFirestore();
    const userDocRef = doc(db, 'users', user.uid);
    
    // Remove from Firestore
    await updateDoc(userDocRef, {
      wishlist: arrayRemove(propertyId)
    });

    // Update local state
    setWishlistProperties(prev => prev.filter(property => property.id !== propertyId));
    setSelectedProperties(prev => prev.filter(id => id !== propertyId));
    
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    alert('Failed to remove property from wishlist. Please try again.');
  }
};

  // Remove multiple properties
 const removeMultipleFromWishlist = async () => {
  if (!user || selectedProperties.length === 0) return;

  try {
    const db = getFirestore();
    const userDocRef = doc(db, 'users', user.uid);
    
    // Remove multiple items from Firestore
    for (const propertyId of selectedProperties) {
      await updateDoc(userDocRef, {
        wishlist: arrayRemove(propertyId)
      });
    }

    // Update local state
    setWishlistProperties(prev => 
      prev.filter(property => !selectedProperties.includes(property.id))
    );
    setSelectedProperties([]);
    
  } catch (error) {
    console.error('Error removing multiple from wishlist:', error);
    alert('Failed to remove properties from wishlist. Please try again.');
  }
};

  // Share property
  const shareProperty = async (property) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: `${window.location.origin}/property/${property.id}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const url = `${window.location.origin}/property/${property.id}`;
      navigator.clipboard.writeText(url).then(() => {
        alert('Property link copied to clipboard!');
      }).catch(() => {
        alert('Unable to copy link. Please copy manually: ' + url);
      });
    }
  };

  // Navigate to property details (mock function)
 const navigateToProperty = (propertyId) => {
  navigate(`Property_Premium/property/${propertyId}`);
};

  // Navigate to properties for sale page
const navigateToPropertiesForSale = () => {
  navigate('/Property_Premium/properties-for-sale'); // or whatever your route is
};

  // Format price function
  const formatPrice = (price, currency) => {
    const symbol = currency === 'Nigeria Naira' ? '₦' : '$';
    return `${symbol}${price?.toLocaleString() || '0'}`;
  };

  // Filter and sort properties
  const filteredAndSortedProperties = wishlistProperties
    .filter(property => {
      const matchesSearch = !searchQuery || 
        property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.state?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = !filterType || property.propertyType === filterType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dateAdded':
          return new Date(b.dateAddedToWishlist) - new Date(a.dateAddedToWishlist);
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

  // Get unique property types for filter
  const propertyTypes = [...new Set(wishlistProperties.map(p => p.propertyType).filter(Boolean))];

  const PropertyCard = ({ property }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative">
        <img 
          src={property.images?.[0] || 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'} 
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        
        {/* Selection checkbox */}
        <div className="absolute top-3 left-3">
          <input
            type="checkbox"
            checked={selectedProperties.includes(property.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedProperties(prev => [...prev, property.id]);
              } else {
                setSelectedProperties(prev => prev.filter(id => id !== property.id));
              }
            }}
            className="w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500"
          />
        </div>

        {/* Property type badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
            {property.propertyType}
          </span>
        </div>

        {/* Action buttons */}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            onClick={() => shareProperty(property)}
            className="p-2 bg-white/90 hover:bg-white rounded-full shadow-sm transition-colors"
            title="Share property"
          >
            <Share2 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => removeFromWishlist(property.id)}
            className="p-2 bg-white/90 hover:bg-red-50 rounded-full shadow-sm transition-colors"
            title="Remove from wishlist"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="text-2xl font-bold text-blue-600">
            {formatPrice(property.price, property.currency)}
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Added {new Date(property.dateAddedToWishlist).toLocaleDateString()}
          </div>
        </div>
        
        <h3 className="text-gray-800 font-medium mb-2 line-clamp-2">
          {property.title}
        </h3>
        
        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">
            {property.showAddress ? property.address : `${property.city}, ${property.state}`}
          </span>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Bed className="w-4 h-4 mr-1" />
            <span>{property.bedroom} Beds</span>
          </div>
          <div className="flex items-center">
            <Bath className="w-4 h-4 mr-1" />
            <span>{property.bathroom} Baths</span>
          </div>
          {property.totalArea && (
            <div className="flex items-center">
              <Square className="w-4 h-4 mr-1" />
              <span>{property.totalArea} {property.totalAreaUnit}</span>
            </div>
          )}
        </div>
        
        <button 
          onClick={() => navigateToProperty(property.id)}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Details
        </button>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Please log in to view your wishlist</p>
        </div>
      </div>
    );
  }

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-md">
          <p className="text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500" fill="currentColor" />
            <h1 className="text-3xl font-bold text-gray-800">My Wishlist</h1>
          </div>
          <p className="text-gray-600">
            {wishlistProperties.length} {wishlistProperties.length === 1 ? 'property' : 'properties'} saved for later
          </p>
        </div>

        {wishlistProperties.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-lg p-12 shadow-sm border border-gray-200 max-w-md mx-auto">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-600 mb-4">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6">
                Start browsing properties and save your favorites to see them here.
              </p>
              <button
                onClick={navigateToPropertiesForSale}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Properties
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search your saved properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>

                <div className="flex gap-3 items-center">
                  {/* Filter toggle */}
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      showFilters || filterType 
                        ? 'bg-blue-50 border-blue-300 text-blue-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Filter className="w-4 h-4 inline mr-2" />
                    Filter
                  </button>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dateAdded">Recently Added</option>
                    <option value="newest">Newest Listings</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>

                  {/* Bulk actions */}
                  {selectedProperties.length > 0 && (
                    <button
                      onClick={removeMultipleFromWishlist}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Remove Selected ({selectedProperties.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Expandable filters */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Property Type
                      </label>
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">All Types</option>
                        {propertyTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Clear filters button */}
                  {(filterType || searchQuery) && (
                    <div className="mt-4">
                      <button
                        onClick={() => {
                          setFilterType('');
                          setSearchQuery('');
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Clear all filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Bulk selection controls */}
            {wishlistProperties.length > 0 && (
              <div className="mb-4 flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={selectedProperties.length === filteredAndSortedProperties.length && filteredAndSortedProperties.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedProperties(filteredAndSortedProperties.map(p => p.id));
                      } else {
                        setSelectedProperties([]);
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  Select all visible ({filteredAndSortedProperties.length})
                </label>
                
                {selectedProperties.length > 0 && (
                  <span className="text-sm text-blue-600 font-medium">
                    {selectedProperties.length} selected
                  </span>
                )}
              </div>
            )}

            {/* Results count */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredAndSortedProperties.length} of {wishlistProperties.length} properties
              </p>
            </div>

            {/* Properties grid */}
            {filteredAndSortedProperties.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No properties found</h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your search or filter criteria.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('');
                      setShowFilters(false);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedProperties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}

            {/* Stats footer */}
            <div className="mt-12 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{wishlistProperties.length}</div>
                  <div className="text-gray-600 text-sm">Properties Saved</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(
                      Math.min(...wishlistProperties.map(p => p.price || 0)),
                      wishlistProperties[0]?.currency || 'Nigeria Naira'
                    )}
                  </div>
                  <div className="text-gray-600 text-sm">Lowest Price</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">
                    {formatPrice(
                      Math.max(...wishlistProperties.map(p => p.price || 0)),
                      wishlistProperties[0]?.currency || 'Nigeria Naira'
                    )}
                  </div>
                  <div className="text-gray-600 text-sm">Highest Price</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wishlist;