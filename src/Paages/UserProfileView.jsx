import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Building,
  Globe,
  Shield,
  User,
  Heart,
  Eye,
  Edit,
  Trash2,
  Plus,
  Filter,
  Search,
  Grid,
  List,
  MessageCircle,
  Star,
  Verified,
  Home,
  Bed,
  Bath,
  Square,
  DollarSign,
  Clock,
  AlertCircle
} from 'lucide-react';
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  addDoc
} from 'firebase/firestore';
import { 
  auth,
  db,
  getUserProfile
} from '../Firebase Auth/Firebase'; // Adjust path as needed
import { useNavigate, useParams } from 'react-router-dom';

const UserProfileView = ({ onBack, currentUser }) => {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
const [showReviewForm, setShowReviewForm] = useState(false);
const [submittingReview, setSubmittingReview] = useState(false);
const [newReview, setNewReview] = useState({
  rating: 5,
  comment: '',
  propertyTitle: ''
});
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [propertiesLoading, setPropertiesLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grid');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    soldListings: 0,
    rentedListings: 0
  });

  console.log('UserProfileView - userId from params:', userId);
  console.log('UserProfileView - currentUser:', currentUser);
const handleBack = () => {
  navigate(-1); // or navigate(-1) to go back to previous page
};

  useEffect(() => {
    loadUserProfile();
    loadUserProperties();
    loadUserReviews();
  }, [userId]);

const loadUserProfile = async () => {
  try {
    setLoading(true);
    
    console.log('Loading profile for userId:', userId);
    
    if (!userId) {
      console.error('No userId provided');
      setProfile(null);
      setLoading(false);
      return;
    }
    
    // Try multiple document paths
    let profileData = null;
    
    // Method 1: Try new profile structure
    try {
      const profileRef = doc(db, 'users', userId, 'profiles', 'userProfile');
      const profileDoc = await getDoc(profileRef);
      
      if (profileDoc.exists()) {
        profileData = profileDoc.data();
        console.log('Found profile in new structure:', profileData);
      }
    } catch (error) {
      console.log('New structure failed:', error.message);
    }
    
    // Method 2: Try old structure (main user document)
    if (!profileData) {
      try {
        const userRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          profileData = userDoc.data();
          console.log('Found profile in old structure:', profileData);
        }
      } catch (error) {
        console.log('Old structure failed:', error.message);
      }
    }
    
    // Method 3: Use your existing getUserProfile function
    if (!profileData) {
      try {
        profileData = await getUserProfile(userId);
        console.log('Found profile via getUserProfile:', profileData);
      } catch (error) {
        console.log('getUserProfile failed:', error.message);
      }
    }

 // Replace your existing profile transformation in loadUserProfile function with this:

if (profileData) {
  // Transform the data with proper date handling and default values
  const transformedProfile = {
    id: userId,
    firstName: profileData.firstName || '',
    lastName: profileData.lastName || '',
    displayName: profileData.displayName || `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 'User',
    primaryPhone: profileData.primaryPhone || profileData.phone || 'Not provided',
    email: profileData.email || 'Not provided',
    whatsappPhone: profileData.whatsappPhone || profileData.primaryPhone || profileData.phone || 'Not provided',
    alternateEmail: profileData.alternateEmail || '',
    isRealEstateProfessional: profileData.isRealEstateProfessional || false,
    profileImage: profileData.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    companyName: profileData.companyName || '',
    companyPhone: profileData.companyPhone || '',
    category: profileData.category || '',
    website: profileData.website || '',
    country: profileData.country || '',
    state: profileData.state || '',
    city: profileData.city || '',
    address: profileData.address || '',
    aboutUs: profileData.aboutUs || '',
    
    // Fix the date handling here:
    joinedDate: profileData.createdAt?.toDate ? profileData.createdAt.toDate() : 
                profileData.createdAt ? new Date(profileData.createdAt) : 
                new Date(), // fallback to current date
    
    totalListings: profileData.totalListings || 0,
    responseRate: profileData.responseRate || '95%',
    responseTime: profileData.responseTime || 'Within an hour',
    verified: profileData.verified || false,
    
    // Add these missing properties with defaults:
    averageRating: profileData.averageRating || 4.5,
    totalReviews: profileData.totalReviews || 0,
    yearsExperience: profileData.yearsExperience || 1
  };
  
  console.log('Transformed profile:', transformedProfile);
  setProfile(transformedProfile);
} else {
  console.log('No profile found for userId:', userId);
  setProfile(null);
}
    
  } catch (error) {
    console.error('Error loading user profile:', error);
    setProfile(null);
  } finally {
    setLoading(false);
  }
};

const loadUserProperties = async () => {
  try {
    setPropertiesLoading(true);
    console.log('Loading properties for userId:', userId);
    
    let userProperties = [];
    
    // Method 1: Query by ownerId
    try {
      const propertiesQuery = query(
        collection(db, 'properties'),
        where('ownerId', '==', userId)
      );
      
      const snapshot = await getDocs(propertiesQuery);
      userProperties = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
      }));
      
      console.log('Properties found by ownerId:', userProperties.length);
    } catch (error) {
      console.log('Query by ownerId failed:', error.message);
    }
    
    // Method 2: Try other possible field names
    if (userProperties.length === 0) {
      try {
        const propertiesQuery2 = query(
          collection(db, 'properties'),
          where('userId', '==', userId)
        );
        
        const snapshot2 = await getDocs(propertiesQuery2);
        userProperties = snapshot2.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
        }));
        
        console.log('Properties found by userId:', userProperties.length);
      } catch (error) {
        console.log('Query by userId failed:', error.message);
      }
    }
    
    // Method 3: Try user subcollection
    if (userProperties.length === 0) {
      try {
        const userPropertiesQuery = collection(db, 'users', userId, 'properties');
        const userSnapshot = await getDocs(userPropertiesQuery);
        userProperties = userSnapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
        }));
        
        console.log('Properties found in subcollection:', userProperties.length);
      } catch (error) {
        console.log('Subcollection query failed:', error.message);
      }
    }
    
    setProperties(userProperties);
    calculateStats(userProperties);
    
  } catch (error) {
    console.error('Error loading properties:', error);
    setProperties([]);
    calculateStats([]);
  } finally {
    setPropertiesLoading(false);
  }
};

const loadUserReviews = async () => {
  try {
    const reviewsQuery = query(
      collection(db, 'users', userId, 'reviews'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(reviewsQuery);
    const userReviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate() : new Date(doc.data().createdAt)
    }));
    
    setReviews(userReviews);
    
    // Update profile stats based on reviews
    if (userReviews.length > 0) {
      const totalRating = userReviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / userReviews.length;
      
      setProfile(prev => ({
        ...prev,
        averageRating: averageRating,
        totalReviews: userReviews.length
      }));
    }
    
  } catch (error) {
    console.error('Error loading reviews:', error);
    setReviews([]);
  }
};

const submitReview = async (reviewData) => {
  if (!currentUser) return;
  
  try {
    setSubmittingReview(true);
    
    // Add review to user's subcollection
    const reviewRef = collection(db, 'users', userId, 'reviews');
    await addDoc(reviewRef, {
      ...reviewData,
      reviewerId: currentUser.uid,
      reviewerName: currentUser.displayName || 'Anonymous',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // Reload reviews
    await loadUserReviews();
    
    // Reset form
    setNewReview({
      rating: 5,
      comment: '',
      propertyTitle: ''
    });
    setShowReviewForm(false);
    
  } catch (error) {
    console.error('Error submitting review:', error);
  } finally {
    setSubmittingReview(false);
  }
};

// Add this at the top of your component
useEffect(() => {
  console.log('=== UserProfileView Debug Info ===');
  console.log('userId:', userId);
  console.log('currentUser:', currentUser);
  console.log('db instance:', db);
  console.log('auth instance:', auth);
  console.log('=================================');
}, [userId, currentUser]);

// Add this to monitor state changes
useEffect(() => {
  console.log('Profile state changed:', profile);
}, [profile]);

useEffect(() => {
  console.log('Properties state changed:', properties);
}, [properties]);

  const calculateStats = (properties) => {
    const stats = {
      totalListings: properties.length,
      activeListings: properties.filter(p => p.marketStatus === 'Available').length,
      soldListings: properties.filter(p => p.marketStatus === 'Sold').length,
      rentedListings: properties.filter(p => p.marketStatus === 'Rented').length
    };
    setStats(stats);
  };

  const formatPrice = (price, currency, pricePer = null) => {
    const symbol = currency === 'Nigeria Naira' ? '₦' : '$';
    const formattedPrice = `${symbol}${price?.toLocaleString()}`;
    
    if (pricePer && pricePer !== 'Year') {
      return `${formattedPrice}/${pricePer.toLowerCase()}`;
    }
    return formattedPrice;
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'available' && property.marketStatus === 'Available') ||
                         (filterStatus === 'sold' && property.marketStatus === 'Sold') ||
                         (filterStatus === 'rented' && property.marketStatus === 'Rented');
    
    return matchesSearch && matchesFilter;
  });

  const isOwnProfile = currentUser && currentUser.uid === userId;

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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-4">The user profile you're looking for doesn't exist.</p>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
           <button
  onClick={handleBack}
  className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
>
  <ArrowLeft className="w-5 h-5" />
  Back
</button>
            {isOwnProfile && (
              <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Profile Image */}
              <div className="relative">
                <img
                  src={profile.profileImage}
                  alt={profile.displayName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                {profile.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1.5">
                    <Shield className="w-4 h-4" />
                  </div>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.displayName}</h1>
                  {profile.verified && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Verified
                    </span>
                  )}
                </div>
                
                {profile.isRealEstateProfessional ? (
                  <div className="mb-3">
                    <p className="text-lg text-gray-700 font-medium">{profile.category}</p>
                    {profile.companyName && (
                      <p className="text-blue-600 font-medium">{profile.companyName}</p>
                    )}
                    <p className="text-gray-500 text-sm">{profile.city}, {profile.state}</p>
                  </div>
                ) : (
                  <p className="text-gray-600 mb-3">Property Owner</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {profile.joinedDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    <span>{profile.totalListings} listings</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{profile.averageRating} ({profile.totalReviews} reviews)</span>
                  </div>
                </div>
              </div>

              {/* Contact Actions */}
              {!isOwnProfile && (
                <div className="flex flex-col gap-2">
                  <a
                    href={`https://wa.me/${profile.whatsappPhone?.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                  <a
                    href={`tel:${profile.primaryPhone}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="border-t border-gray-200 px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.totalListings}</div>
                <div className="text-sm text-gray-600">Total Listings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.activeListings}</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.soldListings}</div>
                <div className="text-sm text-gray-600">Sold</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.rentedListings}</div>
                <div className="text-sm text-gray-600">Rented</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('properties')}
                className={`py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'properties'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Properties ({properties.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`py-3 border-b-2 font-medium text-sm ${
                  activeTab === 'reviews'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Reviews ({profile.totalReviews})
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* About */}
                {profile.aboutUs && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                    <p className="text-gray-700 leading-relaxed">{profile.aboutUs}</p>
                  </div>
                )}

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Primary Phone</div>
                        <div className="text-gray-600">{profile.primaryPhone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <MessageCircle className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">WhatsApp</div>
                        <div className="text-gray-600">{profile.whatsappPhone}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">Email</div>
                        <div className="text-gray-600">{profile.email}</div>
                      </div>
                    </div>
                    {profile.website && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Globe className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-medium text-gray-900">Website</div>
                          <a 
                            href={profile.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {profile.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{profile.responseRate}</div>
                      <div className="text-sm text-gray-600">Response Rate</div>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{profile.responseTime}</div>
                      <div className="text-sm text-gray-600">Avg Response Time</div>
                    </div>
                    <div className="p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{profile.yearsExperience} years</div>
                      <div className="text-sm text-gray-600">Experience</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Properties Tab */}
            {activeTab === 'properties' && (
              <div className="space-y-6">
                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                  <div className="flex flex-wrap gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search properties..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="available">Available</option>
                      <option value="sold">Sold</option>
                      <option value="rented">Rented</option>
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
                    {isOwnProfile && (
                      <button className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Property
                      </button>
                    )}
                  </div>
                </div>

                {/* Properties Grid/List */}
                {propertiesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading properties...</p>
                    </div>
                  </div>
                ) : filteredProperties.length === 0 ? (
                  <div className="text-center py-12">
                    <Home className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Properties Found</h3>
                    <p className="text-gray-600">
                      {searchTerm || filterStatus !== 'all' 
                        ? 'Try adjusting your search or filter criteria.' 
                        : 'This user hasn\'t listed any properties yet.'}
                    </p>
                  </div>
                ) : (
                  <div className={viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
                    : 'space-y-4'
                  }>
                    {filteredProperties.map((property) => (
                      <div key={property.id} className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}>
                        <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}`}>
                          <img
                            src={property.images[0]}
                            alt={property.title}
                            className={`object-cover ${viewMode === 'list' ? 'w-full h-32' : 'w-full h-48'}`}
                          />
                          <div className="absolute top-2 left-2 flex gap-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                              property.marketStatus === 'Available' ? 'bg-green-500' :
                              property.marketStatus === 'Sold' ? 'bg-blue-500' : 'bg-orange-500'
                            }`}>
                              {property.marketStatus}
                            </span>
                            {property.featured && (
                              <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                Featured
                              </span>
                            )}
                          </div>
                          {isOwnProfile && (
                            <div className="absolute top-2 right-2 flex gap-1">
                              <button className="bg-white bg-opacity-80 p-1.5 rounded-full hover:bg-opacity-100 transition-all">
                                <Edit className="w-3 h-3 text-gray-600" />
                              </button>
                              <button className="bg-white bg-opacity-80 p-1.5 rounded-full hover:bg-opacity-100 transition-all">
                                <Trash2 className="w-3 h-3 text-red-600" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900 line-clamp-1">{property.title}</h3>
                            <div className="text-lg font-bold text-blue-600">
                              {formatPrice(property.price, property.currency, property.pricePer)}
                            </div>
                          </div>
                          
                          <div className="flex items-center text-gray-600 text-sm mb-3">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{property.city}, {property.state}</span>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                            {property.bedroom && (
                              <div className="flex items-center gap-1">
                                <Bed className="w-4 h-4" />
                                <span>{property.bedroom}</span>
                              </div>
                            )}
                            {property.bathroom && (
                              <div className="flex items-center gap-1">
                                <Bath className="w-4 h-4" />
                                <span>{property.bathroom}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Square className="w-4 h-4" />
                              <span>{property.totalArea} {property.totalAreaUnit}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Eye className="w-4 h-4" />
                                <span>{property.views}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Heart className="w-4 h-4" />
                                <span>{property.favorites}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              <span>{property.createdAt.toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Reviews Tab */}
         {/* Reviews Tab */}
{activeTab === 'reviews' && (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.floor(profile.averageRating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">
            {profile.averageRating.toFixed(1)} ({profile.totalReviews} reviews)
          </span>
        </div>
      </div>
      
      {/* Add Review Button */}
      {!isOwnProfile && currentUser && (
        <button
          onClick={() => setShowReviewForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Write Review
        </button>
      )}
    </div>

    {/* Review Form */}
    {showReviewForm && (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Write a Review</h4>
        <div className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                  className="focus:outline-none"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= newReview.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* Property Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property (Optional)
            </label>
            <input
              type="text"
              value={newReview.propertyTitle}
              onChange={(e) => setNewReview(prev => ({ ...prev, propertyTitle: e.target.value }))}
              placeholder="Which property did you interact with?"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment
            </label>
            <textarea
              value={newReview.comment}
              onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
              placeholder="Share your experience..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => submitReview(newReview)}
              disabled={submittingReview || !newReview.comment.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submittingReview && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              )}
              Submit Review
            </button>
            <button
              onClick={() => setShowReviewForm(false)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Reviews List */}
    {reviews.length === 0 ? (
      <div className="text-center py-12">
        <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Reviews Yet</h3>
        <p className="text-gray-600">
          {isOwnProfile 
            ? "You haven't received any reviews yet." 
            : "Be the first to leave a review!"}
        </p>
      </div>
    ) : (
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{review.reviewerName}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= review.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {review.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-gray-700 mb-2">{review.comment}</p>
            {review.propertyTitle && (
              <div className="text-sm text-blue-600">Property: {review.propertyTitle}</div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)}
          </div>
        </div>

        {/* Quick Contact Card (for non-owners) */}
        {!isOwnProfile && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Get in Touch</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a
                href={`tel:${profile.primaryPhone}`}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Call Now
              </a>
              <a
                href={`https://wa.me/${profile.whatsappPhone?.replace(/[^\d]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
              <a
                href={`mailto:${profile.email}`}
                className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Email
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileView;