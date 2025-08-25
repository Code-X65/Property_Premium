    import React, { useState, useEffect, useRef } from 'react';
    import { 
        Plus, 
        List,
        Edit,
        Trash2,
        Eye,
        MoreVertical,
        MapPin,
        Calendar,
        Bed,
        Bath,
        Square,
        Loader2,    
        AlertCircle,
        Home,
    
    } from 'lucide-react';
    import {Link} from 'react-router-dom'

    // Import Firebase functions (update paths as needed)
    import { getCurrentUser, subscribeToAuthChanges } from '../Firebase Auth/Firebase';

    import { getUserProperties, deleteProperty, getUserPropertyCount } from '../Firebase Auth/Firestore';

    const Listing = ({onPreviewProperty}) => {
        const [activeFilter, setActiveFilter] = useState('all');
        const [user, setUser] = useState(null);
        const [properties, setProperties] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState('');
        const [deleteLoading, setDeleteLoading] = useState(null);
        const [showDeleteModal, setShowDeleteModal] = useState(false);
        const [propertyToDelete, setPropertyToDelete] = useState(null);
        const [openMenuId, setOpenMenuId] = useState(null);

        // 2. Add this filtering function after your existing functions (around line 170)
const getFilteredProperties = () => {
    if (activeFilter === 'all') {
        return properties;
    }
    
    return properties.filter(property => {
        const status = property.status?.toLowerCase() || 'active';
        
        if (activeFilter === 'active') {
            return status === 'active' || status === 'pending';
        } else if (activeFilter === 'inactive') {  // CHANGED: specific check for 'inactive'
            return status === 'sold' || status === 'rented' || status === 'inactive' || status === 'draft';
        }
        
        return true;
    });
};
        
        
        const [propertyStats, setPropertyStats] = useState({ total: 0, active: 0, inactive: 0 });
        
        // Refs for handling clicks outside menu
        const menuRefs = useRef({});

        // Add this useEffect after the existing ones:
useEffect(() => {
    return () => {
        // Clean up refs when component unmounts
        menuRefs.current = {};
    };
}, []);

        // Authentication state listener
        useEffect(() => {
            let unsubscribe;
            
            try {
                unsubscribe = subscribeToAuthChanges((user) => {
                    console.log('Auth state changed:', user);
                    setUser(user);
                });
            } catch (error) {
                console.error('Error setting up auth listener:', error);
                setError('Failed to initialize authentication. Please refresh the page.');
                setLoading(false);
            }

            return () => {
                if (unsubscribe && typeof unsubscribe === 'function') {
                    unsubscribe();
                }
            };
        }, []);

        // Fetch user properties when user changes or filters change
        useEffect(() => {
            if (user) {
                fetchUserProperties();
                fetchPropertyStats();
            } else {
                setProperties([]);
                setPropertyStats({ total: 0, active: 0, inactive: 0 });
                setLoading(false);
            }
        }, [user]);

        // Handle clicks outside menu to close it
      
useEffect(() => {
    const handleClickOutside = (event) => {
        // Check if click is outside any of the open menus
        if (openMenuId && menuRefs.current[openMenuId]) {
            if (!menuRefs.current[openMenuId].contains(event.target)) {
                setOpenMenuId(null);
            }
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, [openMenuId]);

        const fetchUserProperties = async () => {
            if (!user?.uid) {
                console.warn('No user UID available for fetching properties');
                return;
            }

            setLoading(true);
            setError('');

            try {
                console.log('Fetching properties for user:', user.uid);
                // Use enhanced getUserProperties with filtering and sorting
                const userProperties = await getUserProperties();
                
                // Ensure properties is always an array
                const propertiesArray = Array.isArray(userProperties) ? userProperties : [];
                setProperties(propertiesArray);
                
                console.log('Fetched properties:', propertiesArray.length);
            } catch (error) {
                console.error('Error fetching user properties:', error);
                
                // Set user-friendly error message based on error type
                let errorMessage = 'Failed to load your properties. Please try again.';
                
                if (error.message.includes('permission')) {
                    errorMessage = 'You don\'t have permission to view these properties.';
                } else if (error.message.includes('network')) {
                    errorMessage = 'Network error. Please check your connection and try again.';
                } else if (error.message.includes('auth')) {
                    errorMessage = 'Authentication error. Please sign in again.';
                }
                
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        const fetchPropertyStats = async () => {
            try {
                const stats = await getUserPropertyCount(true); // Always get full stats
                setPropertyStats(stats);
            } catch (error) {
                console.error('Error fetching property stats:', error);
                // Don't show error for stats, just keep default values
            }
        };

        const handleDeleteProperty = async (propertyId) => {
            if (!propertyId) {
                console.error('No property ID provided for deletion');
                setError('Invalid property ID. Cannot delete property.');
                return;
            }

            setDeleteLoading(propertyId);
            
            try {
                console.log('Deleting property:', propertyId);
                await deleteProperty(propertyId);
                
                // Remove from local state
                setProperties(prevProperties => 
                    prevProperties.filter(prop => prop.id !== propertyId)
                );
                
                // Update stats
                await fetchPropertyStats();
                
                // Close modal
                setShowDeleteModal(false);
                setPropertyToDelete(null);
                
                console.log('Property deleted successfully');
            } catch (error) {
                console.error('Error deleting property:', error);
                
                let errorMessage = 'Failed to delete property. Please try again.';
                
                if (error.message.includes('permission')) {
                    errorMessage = 'You don\'t have permission to delete this property.';
                } else if (error.message.includes('not found')) {
                    errorMessage = 'Property not found. It may have already been deleted.';
                    // Remove from local state if not found
                    setProperties(prevProperties => 
                        prevProperties.filter(prop => prop.id !== propertyId)
                    );
                    setShowDeleteModal(false);
                    setPropertyToDelete(null);
                }
                
                setError(errorMessage);
            } finally {
                setDeleteLoading(null);
            }
        };

        const formatPrice = (price, currency, pricePer) => {
            try {
                // Handle invalid price values
                if (!price || isNaN(price)) {
                    return 'Price not available';
                }

                const formatter = new Intl.NumberFormat('en-US');
                const currencySymbol = currency === 'Nigeria Naira' ? '₦' : '$';
                const formattedPrice = `${currencySymbol}${formatter.format(Number(price))}`;
                
                // return pricePer ? `${formattedPrice}/${pricePer.toLowerCase()}` : formattedPrice;
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
                    // Firestore timestamp
                    dateObj = date.toDate();
                } else if (date instanceof Date) {
                    dateObj = date;
                } else if (typeof date === 'string' || typeof date === 'number') {
                    dateObj = new Date(date);
                } else {
                    return 'Invalid date';
                }
                
                // Check if date is valid
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

        const getStatusColor = (status) => {
            const statusLower = status?.toLowerCase() || 'active';
            
            const statusColors = {
                'active': 'bg-green-100 text-green-800',
                'pending': 'bg-yellow-100 text-yellow-800',
                'sold': 'bg-red-100 text-red-800',
                'rented': 'bg-blue-100 text-blue-800',
                'inactive': 'bg-gray-100 text-gray-800',
                'draft': 'bg-purple-100 text-purple-800'
            };
            
            return statusColors[statusLower] || 'bg-gray-100 text-gray-800';
        };

        const handleMenuToggle = (propertyId, event) => {
            event.stopPropagation();
            setOpenMenuId(openMenuId === propertyId ? null : propertyId);
        };


const handleMenuAction = (action, property) => {
    setOpenMenuId(null);
    
    switch (action) {
        case 'preview':
            if (onPreviewProperty && typeof onPreviewProperty === 'function') {
                onPreviewProperty(property);
                // Refresh properties after preview
                fetchUserProperties();
            } else {
                console.warn('onPreviewProperty callback not provided');
            }
            break;
        case 'edit':
            handleEditProperty(property);
            // Refresh properties after edit
            fetchUserProperties();
            break;
        case 'delete':
            setPropertyToDelete(property);
            setShowDeleteModal(true);
            break;
        default:
            console.warn('Unknown menu action:', action);
    }
};

// Add these functions after the existing state declarations (around line 35)
const handleCreateListing = () => {
    // Add your create listing logic here
    console.log('Creating new listing...');
    // Example: You could navigate to a create listing page or open a modal
    // window.location.href = '/create-listing';
    // or dispatch an action, etc.
};

const handleEditProperty = (property) => {
    // Navigate to edit page with property data
    // You can use React Router or your preferred navigation method
    window.location.href = `/post_a_listing?edit=${property.id}`;
    // OR if using React Router:
    // navigate(`/post_a_listing?edit=${property.id}`, { state: { property } });
};

const handlePreviewProperty = (property) => {
    // Add your preview property logic here
    console.log('Previewing property:', property);
    // Example: Navigate to preview page or open preview modal
    // window.location.href = `/preview-property/${property.id}`;
    // or set state to show preview, etc.
};

      
        const PropertyCard = ({ property }) => {
            // Validate property data
            if (!property || !property.id) {
                console.warn('Invalid property data:', property);
                return null;
            }

            const isMenuOpen = openMenuId === property.id;

            return (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {/* Property Image */}
                    <div className="relative h-48 bg-gray-200">
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
                                <Square className="w-12 h-12 text-gray-400" />
                            </div>
                        )}
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 left-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(property.status)}`}>
                                {property.status || 'Active'}
                            </span>
                        </div>

                        {/* Days Since Created Badge */}
                        {property.daysSinceCreated !== undefined && (
                            <div className="absolute bottom-3 left-3">
                                <span className="bg-black bg-opacity-50 text-white px-2 py-1 text-xs rounded">
                                    {property.daysSinceCreated} days ago
                                </span>
                            </div>
                        )}

                        {/* Actions Menu */}
                    
{/* Actions Menu */}
<div 
    className="absolute top-3 right-3" 
    ref={(el) => {
        if (el) {
            menuRefs.current[property.id] = el;
        } else {
            delete menuRefs.current[property.id];
        }
    }}
>
    <div className="relative">
        <button
            onClick={(e) => handleMenuToggle(property.id, e)}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 p-2 rounded-full transition-all"
            aria-label="Property actions"
        >
            <MoreVertical className="w-4 h-4 text-gray-600" />
        </button>
        
        {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[120px]">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleMenuAction('preview', property);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                    <Eye className="w-4 h-4" />
                    Preview
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleMenuAction('edit', property);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                    <Edit className="w-4 h-4" />
                    Edit
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleMenuAction('delete', property);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete
                </button>
            </div>
        )}
    </div>
</div>
                    </div>

                    {/* Property Details */}
                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                            {property.title || 'Untitled Property'}
                        </h3>
                        
                        <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="text-sm truncate">
                                {property.location || 
                                (property.city && property.state ? `${property.city}, ${property.state}` : 'Location not specified')}
                            </span>
                        </div>

                        <div className="flex items-center justify-between mb-3">
                            <div className="text-lg font-bold text-blue-600">
                                {formatPrice(property.price, property.currency, property.pricePer)}
                            </div>
                            <div className="text-sm text-gray-500">
                                {property.advertisingFor || 'For Sale'}
                            </div>
                        </div>

                        {/* Property Features */}
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
                            {property.totalArea && (
                                <div className="flex items-center gap-1">
                                    <Square className="w-4 h-4" />
                                    <span>{property.totalArea} {property.totalAreaUnit || 'sqft'}</span>
                                </div>
                            )}
                        </div>

                        {/* Created Date */}
                        <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>Listed {formatDate(property.createdAt)}</span>
                        </div>
                    </div>
                </div>
            );
        };

        // Filter and Sort Controls
 
        // Property Stats Component
      const PropertyStats = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2  gap-4 mb-6">
        <div 
            className={`border rounded-lg p-4 text-center cursor-pointer transition-all hover:shadow-md ${
                activeFilter === 'all' 
                    ? 'bg-blue-100 border-blue-300' 
                    : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
            }`}
            onClick={() => setActiveFilter('all')}
        >
            <div className="text-2xl font-bold text-blue-600">{propertyStats.total}</div>
            <div className="text-sm text-blue-600">Total</div>
        </div>
        <div 
            className={`border rounded-lg p-4 text-center cursor-pointer transition-all hover:shadow-md ${
                activeFilter === 'active' 
                    ? 'bg-green-100 border-green-300' 
                    : 'bg-green-50 border-green-200 hover:bg-green-100'
            }`}
            onClick={() => setActiveFilter('active')}
        >
            <div className="text-2xl font-bold text-green-600">{propertyStats.active}</div>
            <div className="text-sm text-green-600">Active</div>
        </div>
        <div 
            className={`border rounded-lg p-4 text-center cursor-pointer transition-all hover:shadow-md ${
                activeFilter !== 'active' 
                    ? 'bg-gray-100 border-gray-300' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
            onClick={() => setActiveFilter('inactive')}
        >
            <div className="text-2xl font-bold text-gray-600">{propertyStats.inactive}</div>
            <div className="text-sm text-gray-600">Inactive</div>
        </div>
    </div>
);

        // Delete Confirmation Modal
        const DeleteModal = () => (
            <div className="fixed inset-0 bg-black/[0.5] bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                        <h3 className="text-lg font-semibold text-gray-800">Delete Property</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-6">
                        Are you sure you want to delete "{propertyToDelete?.title || 'this property'}"? This action cannot be undone.
                    </p>
                    
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setPropertyToDelete(null);
                            }}
                            disabled={deleteLoading}
                            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => handleDeleteProperty(propertyToDelete?.id)}
                            disabled={deleteLoading}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {deleteLoading === propertyToDelete?.id ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                'Delete'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );

        // Show authentication message if user is not logged in
        if (!user && !loading) {
            return (
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                    <div className="text-center">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                                Authentication Required
                            </h3>
                            <p className="text-yellow-700">
                                Please sign in to view your property listings.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <>
                <div className=" rounded-lg p-2">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            {/* <h3 className="text-2xl font-semibold text-gray-800">My Listings</h3> */}
                            <p className="text-gray-600 text-sm mt-1">
                                Manage your property listings
                            </p>
                        </div>
                        
                        <Link to="/post_a_listing">
                        <button 
                       
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            disabled={loading}
                        >
                            <Plus className="w-4 h-4" />
                            New Listing
                        </button>
                        </Link>
                    </div>

                    {/* Property Stats */}
                    {user && propertyStats.total > 0 && <PropertyStats />}

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-red-700 text-sm">{error}</p>
                                <button
                                    onClick={() => setError('')}
                                    className="ml-auto text-red-500 hover:text-red-700"
                                    aria-label="Close error"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {loading ? (
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
                    ) : getFilteredProperties().length === 0 ? (
                        /* Empty State */
                      <div className="text-center py-12">
    <List className="w-16 h-16 text-gray-400 mx-auto mb-4" />
    {activeFilter === 'all' ? (
        <>
            <p className="text-gray-600 mb-2">
                You don't have any listings yet.
            </p>
            <p className="text-gray-500 text-sm mb-4">
                Create your first listing to get started.
            </p>
           <Link to="/post_a_listing"><button 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
                Create Listing
            </button>
            </Link> 
        </>
    ) : (
        <>
            <p className="text-gray-600 mb-2">
                No {activeFilter} listings found.
            </p>
            <p className="text-gray-500 text-sm mb-4">
                Try viewing all listings or create a new one.
            </p>
            <div className="space-x-3">
                <button 
                    onClick={() => setActiveFilter('all')}
                    className="text-blue-600 hover:text-blue-700 underline"
                >
                    Show all listings
                </button>
            <Link to="/post_a_listing">
               <button 
                 
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Create Listing
                </button>
            </Link> 
            
            </div>
        </>
    )}
</div>
                    ) : (
                        /* Properties Grid */
                       <>
    <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
            {getFilteredProperties().length} listing{getFilteredProperties().length !== 1 ? 's' : ''} found
            {activeFilter !== 'all' && (
                <span className="ml-2 text-blue-600">
                    • Showing {activeFilter} properties
                </span>
            )}
        </div>
        {activeFilter !== 'all' && (
            <button
                onClick={() => setActiveFilter('all')}
                className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
                Show all
            </button>
        )}
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getFilteredProperties().map((property) => (
            <PropertyCard key={property.id} property={property} />
        ))}
    </div>
</>
                    )}
                </div>

                {/* Delete Modal */}
                {showDeleteModal && <DeleteModal />}
            </>
        );
    };

    export default Listing;