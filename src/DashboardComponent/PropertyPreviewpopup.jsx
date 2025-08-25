import React, { useState, useEffect } from 'react';
import { 
    X,
    MapPin,
    Calendar,
    DollarSign,
    Bed,
    Bath,
    Square,
    ChevronLeft,
    ChevronRight,
    Eye,
    Edit,
    Trash2,
    Home,
    Car,
    Wifi,
    Coffee,
    Dumbbell,
    Shield,
    Waves,
    TreePine,
    Users,
    Phone,
    Mail,
    MessageCircle
} from 'lucide-react';

const PropertyPreviewPopup = ({ 
    property, 
    isOpen, 
    onClose, 
    onEdit, 
    onDelete,
    showActions = true 
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Reset image index when property changes
    useEffect(() => {
        setCurrentImageIndex(0);
        setImageError(false);
    }, [property]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !property) return null;

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

    const handlePrevImage = () => {
        if (property.images && property.images.length > 1) {
            setCurrentImageIndex(prev => 
                prev === 0 ? property.images.length - 1 : prev - 1
            );
        }
    };

    const handleNextImage = () => {
        if (property.images && property.images.length > 1) {
            setCurrentImageIndex(prev => 
                prev === property.images.length - 1 ? 0 : prev + 1
            );
        }
    };

    const handleImageError = () => {
        setImageError(true);
    };

    // Common amenities icons mapping
    const amenityIcons = {
        'parking': Car,
        'wifi': Wifi,
        'gym': Dumbbell,
        'pool': Waves,
        'security': Shield,
        'garden': TreePine,
        'gym/fitness': Dumbbell,
        'swimming pool': Waves,
        'parking space': Car,
        'internet/wifi': Wifi,
        'security system': Shield,
        'garden/yard': TreePine,
        'community center': Users,
        'coffee shop': Coffee
    };

    const getAmenityIcon = (amenity) => {
        const amenityLower = amenity?.toLowerCase() || '';
        for (const [key, Icon] of Object.entries(amenityIcons)) {
            if (amenityLower.includes(key)) {
                return Icon;
            }
        }
        return Home; // Default icon
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <Eye className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Property Preview</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {showActions && (
                            <>
                                <button
                                    onClick={() => onEdit && onEdit(property)}
                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit Property"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => onDelete && onDelete(property)}
                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete Property"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                    {/* Image Gallery */}
                    <div className="relative h-64 md:h-80 bg-gray-200">
                        {property.images && property.images.length > 0 && !imageError ? (
                            <>
                                <img
                                    src={property.images[currentImageIndex]}
                                    alt={`Property image ${currentImageIndex + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={handleImageError}
                                />
                                
                                {/* Image Navigation */}
                                {property.images.length > 1 && (
                                    <>
                                        <button
                                            onClick={handlePrevImage}
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={handleNextImage}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                        
                                        {/* Image Indicators */}
                                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                            {property.images.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    className={`w-2 h-2 rounded-full transition-all ${
                                                        index === currentImageIndex 
                                                            ? 'bg-white' 
                                                            : 'bg-white bg-opacity-50'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                <Square className="w-16 h-16 text-gray-400" />
                            </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(property.status)}`}>
                                {property.status || 'Active'}
                            </span>
                        </div>

                        {/* Image Count */}
                        {property.images && property.images.length > 0 && (
                            <div className="absolute top-4 right-4">
                                <span className="bg-black bg-opacity-50 text-white px-2 py-1 text-sm rounded">
                                    {currentImageIndex + 1} / {property.images.length}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Property Details */}
                    <div className="p-6 space-y-6">
                        {/* Title and Location */}
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                                {property.title || 'Untitled Property'}
                            </h1>
                            <div className="flex items-center text-gray-600 mb-4">
                                <MapPin className="w-5 h-5 mr-2 flex-shrink-0" />
                                <span className="text-lg">
                                    {property.location || 
                                    (property.city && property.state ? `${property.city}, ${property.state}` : 'Location not specified')}
                                </span>
                            </div>
                        </div>

                        {/* Price and Advertising Type */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div>
                                <div className="text-3xl font-bold text-blue-600 mb-1">
                                    {formatPrice(property.price, property.currency, property.pricePer)}
                                </div>
                                <div className="text-lg text-blue-700 font-medium">
                                    {property.advertisingFor || 'For Sale'}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-600 mb-1">Listed on</div>
                                <div className="text-lg font-medium text-gray-800">
                                    {formatDate(property.createdAt)}
                                </div>
                            </div>
                        </div>

                        {/* Property Features */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {property.bedroom && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Bed className="w-6 h-6 text-gray-600" />
                                    <div>
                                        <div className="font-semibold text-gray-800">{property.bedroom}</div>
                                        <div className="text-sm text-gray-600">Bedrooms</div>
                                    </div>
                                </div>
                            )}
                            {property.bathroom && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Bath className="w-6 h-6 text-gray-600" />
                                    <div>
                                        <div className="font-semibold text-gray-800">{property.bathroom}</div>
                                        <div className="text-sm text-gray-600">Bathrooms</div>
                                    </div>
                                </div>
                            )}
                            {property.totalArea && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Square className="w-6 h-6 text-gray-600" />
                                    <div>
                                        <div className="font-semibold text-gray-800">
                                            {property.totalArea} {property.totalAreaUnit || 'sqft'}
                                        </div>
                                        <div className="text-sm text-gray-600">Total Area</div>
                                    </div>
                                </div>
                            )}
                            {property.propertyType && (
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Home className="w-6 h-6 text-gray-600" />
                                    <div>
                                        <div className="font-semibold text-gray-800">{property.propertyType}</div>
                                        <div className="text-sm text-gray-600">Property Type</div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        {property.description && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                                <div className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-4 rounded-lg">
                                    {property.description.split('\n').map((paragraph, index) => (
                                        paragraph.trim() && <p key={index} className="mb-2 last:mb-0">{paragraph}</p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Amenities */}
                        {property.amenities && property.amenities.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Amenities</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {property.amenities.map((amenity, index) => {
                                        const IconComponent = getAmenityIcon(amenity);
                                        return (
                                            <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                                                <IconComponent className="w-4 h-4 text-green-600 flex-shrink-0" />
                                                <span className="text-sm text-green-800">{amenity}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Additional Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Property Details */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Property Details</h3>
                                <div className="space-y-2 text-sm">
                                    {property.yearBuilt && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Year Built:</span>
                                            <span className="font-medium">{property.yearBuilt}</span>
                                        </div>
                                    )}
                                    {property.furnished && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Furnished:</span>
                                            <span className="font-medium">{property.furnished}</span>
                                        </div>
                                    )}
                                    {property.parkingSpaces && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Parking Spaces:</span>
                                            <span className="font-medium">{property.parkingSpaces}</span>
                                        </div>
                                    )}
                                    {property.floors && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Number of Floors:</span>
                                            <span className="font-medium">{property.floors}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
                                <div className="space-y-3">
                                    {property.contactPhone && (
                                        <div className="flex items-center gap-3">
                                            <Phone className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm">{property.contactPhone}</span>
                                        </div>
                                    )}
                                    {property.contactEmail && (
                                        <div className="flex items-center gap-3">
                                            <Mail className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm">{property.contactEmail}</span>
                                        </div>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                            <Phone className="w-4 h-4" />
                                            Call
                                        </button>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                                            <MessageCircle className="w-4 h-4" />
                                            Message
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>Created: {formatDate(property.createdAt)}</span>
                                </div>
                                {property.updatedAt && (
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-4 h-4" />
                                        <span>Updated: {formatDate(property.updatedAt)}</span>
                                    </div>
                                )}
                                {property.daysSinceCreated !== undefined && (
                                    <div>
                                        <span>{property.daysSinceCreated} days ago</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyPreviewPopup;