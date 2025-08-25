import React, { useState } from 'react';
import { Play, Clock, Eye, MapPin, Bed, Bath, Square, ArrowRight } from 'lucide-react';

const VideoPropertyTours = () => {
  const [activeVideo, setActiveVideo] = useState(null);

  const properties = [
    {
      id: 1,
      title: "Modern Downtown Loft",
      location: "Manhattan, NY",
      price: "$2,850,000",
      beds: 2,
      baths: 2,
      sqft: "1,200",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=450&fit=crop",
      duration: "45s",
      views: "2.1k",
      featured: true
    },
    {
      id: 2,
      title: "Luxury Beachfront Villa",
      location: "Malibu, CA",
      price: "$5,200,000",
      beds: 4,
      baths: 3,
      sqft: "3,500",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=450&fit=crop",
      duration: "60s",
      views: "5.8k",
      featured: false
    },
    {
      id: 3,
      title: "Cozy Suburban Home",
      location: "Austin, TX",
      price: "$850,000",
      beds: 3,
      baths: 2,
      sqft: "2,100",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&h=450&fit=crop",
      duration: "38s",
      views: "1.3k",
      featured: false
    },
    {
      id: 4,
      title: "Urban Penthouse Suite",
      location: "Chicago, IL",
      price: "$3,100,000",
      beds: 3,
      baths: 3,
      sqft: "2,800",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=450&fit=crop",
      duration: "52s",
      views: "3.7k",
      featured: true
    }
  ];

  const handlePlayVideo = (id) => {
    setActiveVideo(activeVideo === id ? null : id);
  };

  const PropertyCard = ({ property }) => (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
      <div className="relative overflow-hidden">
        {/* Video Player or Thumbnail */}
        {activeVideo === property.id ? (
          <div className="aspect-video">
            <iframe
              src={property.videoUrl}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="relative aspect-video overflow-hidden">
            <img
              src={property.thumbnail}
              alt={property.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
              <button
                onClick={() => handlePlayVideo(property.id)}
                className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transform hover:scale-110 transition-all duration-300 shadow-xl"
              >
                <Play className="w-8 h-8 text-gray-800 ml-1" />
              </button>
            </div>

            {/* Video Info Badge */}
            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{property.duration}</span>
              </div>
              <div className="bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{property.views}</span>
              </div>
            </div>

            {/* Featured Badge */}
            {property.featured && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                Featured
              </div>
            )}
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
            {property.title}
          </h3>
          <span className="text-2xl font-bold text-purple-600">{property.price}</span>
        </div>

        <div className="flex items-center text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
          <div className="flex items-center space-x-1">
            <Bed className="w-4 h-4" />
            <span>{property.beds} beds</span>
          </div>
          <div className="flex items-center space-x-1">
            <Bath className="w-4 h-4" />
            <span>{property.baths} baths</span>
          </div>
          <div className="flex items-center space-x-1">
            <Square className="w-4 h-4" />
            <span>{property.sqft} sqft</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex space-x-3">
          <button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
            Watch Full Tour
          </button>
          <button className="flex-1 border-2 border-purple-200 hover:border-purple-400 text-purple-600 hover:text-purple-700 font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 hover:bg-purple-50">
            <span>Book Viewing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Video Property Tours
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Bring properties to life visually with immersive video tours that showcase every detail
          </p>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Showcase Your Property?</h2>
            <p className="text-lg mb-8 opacity-90">
              Create stunning video tours that capture buyers' attention and drive more viewings
            </p>
            <button className="bg-white text-purple-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
              Start Creating Tours
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPropertyTours;