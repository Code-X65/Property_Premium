import {useState, useEffect, React} from 'react'
import { 
    Plus, 
    CreditCard, 
    Mail,
    Phone,
    MessageCircle,
    Save,
    User2,
    MapPin,
    Calendar,
    Bed,
    Bath,
    Square,
    Loader2,
    Eye
  } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCurrentUser, subscribeToAuthChanges } from '../Firebase Auth/Firebase';
import { getUserProperties } from '../Firebase Auth/Firestore';

const MainDashboad = ({user}) => {
    const [recentListings, setRecentListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add useEffect to fetch listings
  useEffect(() => {
    if (user) {
      fetchRecentListings();
    }
  }, [user]);
 const fetchRecentListings = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const userProperties = await getUserProperties();
      const propertiesArray = Array.isArray(userProperties) ? userProperties : [];
      
      const sortedProperties = propertiesArray
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
          return dateB - dateA;
        })
        .slice(0, 4);

      setRecentListings(sortedProperties);
    } catch (error) {
      console.error('Error fetching recent listings:', error);
      setError('Failed to load recent listings');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, currency, pricePer) => {
    try {
      if (!price || isNaN(price)) {
        return 'Price not available';
      }

      const formatter = new Intl.NumberFormat('en-US');
      const currencySymbol = currency === 'Nigeria Naira' ? '₦' : '$';
      const formattedPrice = `${currencySymbol}${formatter.format(Number(price))}`;
      
      return pricePer ? `${formattedPrice}${pricePer.toLowerCase() === 'not applicable'? '' : '/' }${pricePer.toLowerCase() === 'not applicable'? '' : pricePer.toLowerCase() }` : formattedPrice;
    } catch (error) {
      console.error('Error formatting price:', error);
      return 'Price error';
    }
  };

  const formatDate = (date) => {
    try {
      if (!date) return 'N/A';
      
      let dateObj;
      if (date && typeof date.toDate === 'function') {
        dateObj = date.toDate();
      } else if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string' || typeof date === 'number') {
        dateObj = new Date(date);
      } else {
        return 'Invalid date';
      }
      
      if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
      }
      
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date error';
    }
  };
  return (
    <>
    <div>
    {/* Welcome Message */}
    <div className="mb-8">
      <h3 className="text-lg text-gray-700">Welcome back {user}</h3>
    </div>

    {/* Action Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Link to='/post_a_listing'>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Plus className="w-6 h-6 text-green-600" />
        </div>
        <h4 className="font-medium text-gray-800">Post a Listing</h4>
      </div>
      </Link>
    <Link to='/dashboard/my-account'>
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <User2 className="w-6 h-6 text-green-600" />
        </div>
        <h4 className="font-medium text-gray-800">Upadate Profile</h4>
      </div>
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-6 h-6 text-green-600" />
        </div>
        <h4 className="font-medium text-gray-800">Manage Subscription</h4>
      </div>
    </div>

  {/* Recent Listings */}
<div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
  <div className="flex items-center justify-between mb-4">
    <h4 className="text-lg font-medium text-gray-800">Your Recent Listings</h4>
    <Link to='/dashboard/my-listings'>
      <button className="text-blue-600 text-sm hover:underline">See all...</button>
    </Link>
  </div>
  
  {loading ? (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      <span className="ml-2 text-gray-600">Loading recent listings...</span>
    </div>
  ) : error ? (
    <div className="text-center py-8">
      <p className="text-red-600 mb-2">{error}</p>
      <button 
        onClick={fetchRecentListings}
        className="text-blue-600 hover:underline text-sm"
      >
        Try again
      </button>
    </div>
  ) : recentListings.length === 0 ? (
    <div className="text-center py-8">
      <p className="text-gray-600">
        You do not have any recent listing. 
        <Link to='/post_a_listing'>
          <button className="text-blue-600 hover:underline ml-1">
            Click here to Post a Listing
          </button>
        </Link>
      </p>
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {recentListings.map((property) => (
        <div key={property.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
          {/* Property Image */}
          <div className="relative h-32 bg-gray-200">
            {property.images && Array.isArray(property.images) && property.images.length > 0 ? (
              <img
                src={property.images[0]}
                alt={property.title || 'Property image'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMiAxNkw4IDEySDEwVjhIMTRWMTJIMTZMMTIgMTZaIiBmaWxsPSIjOUI5QkExIi8+Cjwvc3ZnPgo=';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Square className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Property Details */}
          <div className="p-3">
            <div className="text-sm font-semibold text-blue-600 mb-1">
              {formatPrice(property.price, property.currency, property.pricePer)}
            </div>
            
            <h5 className="text-sm font-medium text-gray-800 mb-1 line-clamp-1">
              {property.title || 'Untitled Property'}
            </h5>
            
            <div className="flex items-center text-gray-600 mb-2">
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="text-xs truncate">
                {property.location || 
                (property.city && property.state ? `${property.city}, ${property.state}` : 'Location not specified')}
              </span>
            </div>

            {/* Property Features */}
            <div className="flex items-center gap-3 text-xs text-gray-600 mb-2">
              {property.bedroom && (
                <div className="flex items-center gap-1">
                  <Bed className="w-3 h-3" />
                  <span>{property.bedroom}</span>
                </div>
              )}
              {property.bathroom && (
                <div className="flex items-center gap-1">
                  <Bath className="w-3 h-3" />
                  <span>{property.bathroom}</span>
                </div>
              )}
              {property.totalArea && (
                <div className="flex items-center gap-1">
                  <Square className="w-3 h-3" />
                  <span>{property.totalArea} {property.totalAreaUnit || 'sqft'}</span>
                </div>
              )}
            </div>

            {/* Created Date */}
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                <span>{formatDate(property.createdAt)}</span>
              </div>
              
              <Link to={`/dashboard/my-listings`}>
                <button className="text-blue-600 hover:text-blue-700">
                  <Eye className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

    {/* Latest from Service Areas */}
    <div className="hidden md:block bg-white rounded-lg border border-gray-200 p-6 ">
      <h4 className="text-lg font-medium text-gray-800 mb-6">Latest from Your Service Areas</h4>
      
      <div className="flex space-x-4">
        {/* Property Image */}
        <div className="w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
          <img 
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='128' height='96' viewBox='0 0 128 96'%3E%3Crect width='128' height='96' fill='%23f3f4f6'/%3E%3Cpath d='M64 32L48 48h32l-16-16z' fill='%23d1d5db'/%3E%3Crect x='40' y='48' width='48' height='32' fill='%23e5e7eb'/%3E%3Crect x='56' y='56' width='16' height='16' fill='%23d1d5db'/%3E%3C/svg%3E"
            alt="Property"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Property Details */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-red-600 font-semibold text-lg mb-1">₦160,000</div>
              <h5 className="text-blue-600 hover:underline cursor-pointer mb-1">
                3 Bedroom House Shortlet at Oniru, Lagos
              </h5>
              <p className="text-gray-600 text-sm">Oniru VI, Oniru, Lagos</p>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>Olamax suites</span>
              <span>|</span>
              <span>📅 2 days ago</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 mt-4">
            <button className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700">
              <Mail className="w-3 h-3" />
              <span>Email</span>
            </button>
            <button className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700">
              <Phone className="w-3 h-3" />
              <span>Phone</span>
            </button>
            <button className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
              <MessageCircle className="w-3 h-3" />
              <span>WhatsApp</span>
            </button>
            <button className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700">
              <Save className="w-3 h-3" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
    </>
  )
}

export default MainDashboad