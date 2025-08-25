import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, MapPin, Bed, Bath, Square, ArrowRight, Star, Crown, Flame, Sparkles } from 'lucide-react';

const FeaturedListings = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  // Featured properties data
  const featuredProperties = [
    {
      id: 1,
      title: "Luxury Oceanfront Villa",
      price: "$2,850,000",
      originalPrice: "$3,200,000",
      location: "Malibu, CA",
      beds: 5,
      baths: 4,
      sqft: 4200,
      type: "Villa",
      badge: "Luxury",
      badgeColor: "bg-purple-500",
      badgeIcon: Crown,
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&h=400&fit=crop&q=80",
      rating: 4.9,
      isVerified: true,
      isNew: false,
      isHot: true
    },
    {
      id: 2,
      title: "Modern Downtown Penthouse",
      price: "$1,450,000",
      location: "Manhattan, NY",
      beds: 3,
      baths: 3,
      sqft: 2800,
      type: "Penthouse",
      badge: "New",
      badgeColor: "bg-green-500",
      badgeIcon: Sparkles,
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&h=400&fit=crop&q=80",
      rating: 4.8,
      isVerified: true,
      isNew: true,
      isHot: false
    },
    {
      id: 3,
      title: "Suburban Family Estate",
      price: "$875,000",
      location: "Beverly Hills, CA",
      beds: 6,
      baths: 5,
      sqft: 5200,
      type: "Estate",
      badge: "Hot",
      badgeColor: "bg-red-500",
      badgeIcon: Flame,
      image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&h=400&fit=crop&q=80",
      rating: 4.7,
      isVerified: true,
      isNew: false,
      isHot: true
    },
    {
      id: 4,
      title: "Contemporary Waterfront Home",
      price: "$1,200,000",
      location: "Miami Beach, FL",
      beds: 4,
      baths: 3,
      sqft: 3200,
      type: "House",
      badge: "Verified",
      badgeColor: "bg-blue-500",
      badgeIcon: Star,
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=500&h=400&fit=crop&q=80",
      rating: 4.9,
      isVerified: true,
      isNew: false,
      isHot: false
    },
    {
      id: 5,
      title: "Historic Brownstone Renovation",
      price: "$980,000",
      location: "Brooklyn, NY",
      beds: 3,
      baths: 2,
      sqft: 2100,
      type: "Townhouse",
      badge: "New",
      badgeColor: "bg-green-500",
      badgeIcon: Sparkles,
      image: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=500&h=400&fit=crop&q=80",
      rating: 4.6,
      isVerified: true,
      isNew: true,
      isHot: false
    },
    {
      id: 6,
      title: "Mountain View Retreat",
      price: "$675,000",
      location: "Aspen, CO",
      beds: 4,
      baths: 3,
      sqft: 2800,
      type: "Cabin",
      badge: "Hot",
      badgeColor: "bg-red-500",
      badgeIcon: Flame,
      image: "https://images.unsplash.com/photo-1520637736862-4197d17c90a?w=500&h=400&fit=crop&q=80",
      rating: 4.8,
      isVerified: false,
      isNew: false,
      isHot: true
    }
  ];

  const itemsPerSlide = 2;
  const totalSlides = Math.ceil(featuredProperties.length / itemsPerSlide);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 10000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  // Lazy loading for images
  const handleImageLoad = (imageId) => {
    setLoadedImages(prev => new Set([...prev, imageId]));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getCurrentSlideProperties = () => {
    const startIndex = currentSlide * itemsPerSlide;
    return featuredProperties.slice(startIndex, startIndex + itemsPerSlide);
  };

  return (
    <section 
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-gray-500 to-gray-900 via-gray-100 relative z-10">

    
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className={`text-center mb-16 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Crown className="w-4 h-4" />
            Premium Properties
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Featured <span className="text-blue-600">Listings</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover handpicked premium properties from our exclusive collection. 
            Each listing is carefully verified and represents exceptional value.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          {/* <button 
            onClick={prevSlide}
            className={`absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all duration-300 hover:scale-110 ${
              isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
            }`}
            style={{ transitionDelay: '0.3s' }}
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          
          <button 
            onClick={nextSlide}
            className={`absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-all duration-300 hover:scale-110 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
            }`}
            style={{ transitionDelay: '0.3s' }}
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button> */}

          {/* Property Cards */}
          <div className="grid md:grid-cols-2 gap-8 px-16">
            {getCurrentSlideProperties().map((property, index) => {
              const BadgeIcon = property.badgeIcon;
              return (
                <div
                  key={property.id}
                  ref={el => cardsRef.current[index] = el}
                  className={`group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden transform hover:-translate-y-2 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
                  }`}
                  style={{ 
                    transitionDelay: `${0.2 + index * 0.1}s`,
                    animation: isVisible ? `slideInUp 0.8s ease-out ${0.2 + index * 0.1}s both` : 'none'
                  }}
                >
                  {/* Image Container */}
                  <div className="relative overflow-hidden">
                    {!loadedImages.has(property.id) && (
                      <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                    )}
                    <img 
                      src={property.image}
                      alt={property.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                      onLoad={() => handleImageLoad(property.id)}
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                      <div className={`${property.badgeColor} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg`}>
                        <BadgeIcon className="w-3 h-3" />
                        {property.badge}
                      </div>
                      {property.isVerified && (
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Verified
                        </div>
                      )}
                    </div>

                    {/* Price Overlay */}
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
                      <div className="text-lg font-bold">{property.price}</div>
                      {property.originalPrice && (
                        <div className="text-xs text-gray-300 line-through">{property.originalPrice}</div>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-2 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs font-semibold">{property.rating}</span>
                    </div>
                  </div>
                     
                  {/* Card Content */}
                  <div className='flex '>
                    
                        
                            
 <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {property.title}
                      </h3>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{property.location}</span>
                    </div>
                    {/* Property Type */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        {property.type}
                      </span>
                    </div>
                    </div>
                  
             
                       
                       <div>
                        
                         {/* CTA Button */}
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg">
                      View More
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                       </div>
                 
                 
                 
                 

                 
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: totalSlides }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentSlide === index 
                  ? 'bg-blue-600 w-8' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        {/* View All Properties CTA */}
        <div className={`text-center mt-16 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`} style={{ transitionDelay: '0.8s' }}>
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            View All Properties
            <ArrowRight className="inline-block w-5 h-5 ml-2" />
          </button>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default FeaturedListings;