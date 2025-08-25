import React, { useState, useEffect, useRef } from 'react';
import { MapPin, TrendingUp, Home, ArrowRight, Star, Users, DollarSign, Building2 } from 'lucide-react';

const LocationHighlights = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const sectionRef = useRef(null);
  const cardsRef = useRef([]);

  // Nigerian cities data
  const locations = [
    {
      id: 1,
      name: "Lagos",
      state: "Lagos State",
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop&q=80",
      averagePrice: "₦85,000,000",
      priceRange: "₦25M - ₦500M",
      listings: 2840,
      growth: "+15%",
      description: "Nigeria's commercial hub with luxury waterfront properties",
      highlights: ["Victoria Island", "Ikoyi", "Lekki"],
      propertyTypes: ["Luxury Apartments", "Penthouses", "Commercial"],
      trending: true,
      popular: true
    },
    {
      id: 2,
      name: "Abuja",
      state: "Federal Capital Territory",
      image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=600&h=400&fit=crop&q=80",
      averagePrice: "₦65,000,000",
      priceRange: "₦20M - ₦300M",
      listings: 1650,
      growth: "+22%",
      description: "Federal capital with modern planned developments",
      highlights: ["Maitama", "Asokoro", "Wuse 2"],
      propertyTypes: ["Diplomatic Housing", "Estates", "Villas"],
      trending: true,
      popular: false
    },
    {
      id: 3,
      name: "Ibadan",
      state: "Oyo State",
      image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=400&fit=crop&q=80",
      averagePrice: "₦35,000,000",
      priceRange: "₦8M - ₦150M",
      listings: 980,
      growth: "+12%",
      description: "Historic city with affordable family homes",
      highlights: ["GRA", "Bodija", "UI Area"],
      propertyTypes: ["Family Homes", "Apartments", "Land"],
      trending: false,
      popular: true
    },
    {
      id: 4,
      name: "Port Harcourt",
      state: "Rivers State",
      image: "https://images.unsplash.com/photo-1566813558810-2c2b5cb62600?w=600&h=400&fit=crop&q=80",
      averagePrice: "₦45,000,000",
      priceRange: "₦12M - ₦200M",
      listings: 740,
      growth: "+8%",
      description: "Oil city with growing real estate market",
      highlights: ["GRA", "D-Line", "Trans Amadi"],
      propertyTypes: ["Executive Homes", "Apartments", "Industrial"],
      trending: false,
      popular: false
    },
    {
      id: 5,
      name: "Kano",
      state: "Kano State",
      image: "https://images.unsplash.com/photo-1570939274851-b6172e45834e?w=600&h=400&fit=crop&q=80",
      averagePrice: "₦28,000,000",
      priceRange: "₦5M - ₦120M",
      listings: 650,
      growth: "+18%",
      description: "Northern commercial center with emerging opportunities",
      highlights: ["Nassarawa", "Fagge", "Kano Municipal"],
      propertyTypes: ["Traditional Homes", "Modern Estates", "Commercial"],
      trending: true,
      popular: false
    },
    {
      id: 6,
      name: "Kaduna",
      state: "Kaduna State",
      image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=600&h=400&fit=crop&q=80",
      averagePrice: "₦32,000,000",
      priceRange: "₦7M - ₦180M",
      listings: 520,
      growth: "+14%",
      description: "Strategic location with growing infrastructure",
      highlights: ["GRA", "Barnawa", "Ungwan Rimi"],
      propertyTypes: ["Residential", "Government Housing", "New Developments"],
      trending: false,
      popular: false
    }
  ];

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

  const formatNumber = (num) => {
    return num.toLocaleString();
  };

  return (
    <section 
      ref={sectionRef}
      className="py-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">
        {/* Section Header */}
        <div className={`text-center mb-16 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <MapPin className="w-4 h-4" />
            Top Locations in Nigeria
          </div>
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Explore Prime <span className="text-green-600">Locations</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the most sought-after cities across Nigeria. From bustling Lagos to the capital Abuja, 
            find your perfect property in these thriving locations.
          </p>
        </div>

        {/* Main Featured Cities Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {locations.slice(0, 3).map((location, index) => (
            <div
              key={location.id}
              ref={el => cardsRef.current[index] = el}
              className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-700 overflow-hidden transform hover:-translate-y-3 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
              }`}
              style={{ 
                transitionDelay: `${0.2 + index * 0.15}s`,
              }}
              onMouseEnter={() => setHoveredLocation(location.id)}
              onMouseLeave={() => setHoveredLocation(null)}
            >
              {/* Image Container */}
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={location.image}
                  alt={location.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {location.trending && (
                    <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Trending
                    </div>
                  )}
                  {location.popular && (
                    <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" />
                      Popular
                    </div>
                  )}
                </div>

                {/* Location Title */}
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-2xl font-bold mb-1">{location.name}</h3>
                  <p className="text-sm text-gray-200">{location.state}</p>
                </div>

                {/* Growth Indicator */}
                <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                  {location.growth}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-6">
                <p className="text-gray-600 mb-4 text-sm">{location.description}</p>
                
                {/* Statistics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900">{location.averagePrice}</div>
                    <div className="text-xs text-gray-500">Avg. Price</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Home className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                    <div className="text-lg font-bold text-gray-900">{formatNumber(location.listings)}</div>
                    <div className="text-xs text-gray-500">Properties</div>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mb-4">
                  <div className="text-sm text-gray-500 mb-2">Popular Areas:</div>
                  <div className="flex flex-wrap gap-1">
                    {location.highlights.map((area, idx) => (
                      <span key={idx} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA Button */}
                <button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg transform hover:scale-105">
                  Explore Properties
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Hover Overlay with Additional Info */}
              <div className={`absolute inset-0 bg-white bg-opacity-95 backdrop-blur-sm p-6 flex flex-col justify-center transition-all duration-500 ${
                hoveredLocation === location.id ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}>
                <h4 className="text-xl font-bold text-gray-900 mb-3">Property Types</h4>
                <div className="space-y-2 mb-4">
                  {location.propertyTypes.map((type, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-700">{type}</span>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <strong>Price Range:</strong> {location.priceRange}
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  View All Listings
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Secondary Cities Grid */}
        <div className={`grid md:grid-cols-3 gap-6 mb-12 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`} style={{ transitionDelay: '0.8s' }}>
          {locations.slice(3).map((location, index) => (
            <div
              key={location.id}
              className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-500 overflow-hidden transform hover:-translate-y-1"
            >
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={location.image}
                  alt={location.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-2 left-3 text-white">
                  <h4 className="text-lg font-bold">{location.name}</h4>
                  <p className="text-xs text-gray-200">{location.state}</p>
                </div>
                {location.trending && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {location.growth}
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-900">{location.averagePrice}</div>
                    <div className="text-xs text-gray-500">Avg. Price</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-gray-900">{formatNumber(location.listings)}</div>
                    <div className="text-xs text-gray-500">Listings</div>
                  </div>
                </div>
                
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                  Explore Properties
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className={`text-center transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`} style={{ transitionDelay: '1s' }}>
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <Users className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Can't Find Your Preferred Location?
            </h3>
            <p className="text-gray-600 mb-6">
              We cover properties across all 36 states in Nigeria. Let us help you find the perfect property in your desired location.
            </p>
            <button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              Request Custom Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LocationHighlights;