import React, { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Play, Quote, Users, Award, TrendingUp } from 'lucide-react';

const TestimonialsSuccessStories = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeVideoTestimonial, setActiveVideoTestimonial] = useState(null);

  // Written testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      title: "First-time Buyer",
      location: "Seattle, WA",
      profilePic: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      quote: "The video tours saved me so much time! I was able to narrow down my choices before visiting in person. Found my dream home in just 3 weeks.",
      rating: 5,
      propertyType: "Condo",
      saleAmount: "$450,000"
    },
    {
      id: 2,
      name: "Michael Chen",
      title: "Property Investor",
      location: "Austin, TX",
      profilePic: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      quote: "This platform revolutionized how I evaluate investment properties. The detailed video tours and analytics helped me make better decisions faster.",
      rating: 5,
      propertyType: "Multi-family",
      saleAmount: "$1.2M"
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      title: "Real Estate Agent",
      location: "Miami, FL",
      profilePic: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      quote: "My listings get 3x more engagement with these video tours. Clients love the immersive experience, and I'm closing deals 40% faster!",
      rating: 5,
      propertyType: "Luxury Homes",
      saleAmount: "$2.8M"
    },
    {
      id: 4,
      name: "David Thompson",
      title: "Home Seller",
      location: "Denver, CO",
      profilePic: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      quote: "Sold our family home 2 weeks faster than expected! The video tour attracted serious buyers who were already pre-qualified when they visited.",
      rating: 5,
      propertyType: "Family Home",
      saleAmount: "$680,000"
    },
    {
      id: 5,
      name: "Lisa Park",
      title: "Relocating Professional",
      location: "San Francisco, CA",
      profilePic: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      quote: "Moving across the country was stressful, but the video tours let me house-hunt remotely. Made an offer sight unseen and couldn't be happier!",
      rating: 5,
      propertyType: "Townhouse",
      saleAmount: "$950,000"
    },
    {
      id: 6,
      name: "Robert Martinez",
      title: "Property Developer",
      location: "Phoenix, AZ",
      profilePic: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      quote: "The platform's video capabilities helped us showcase our new development beautifully. Pre-sales exceeded expectations by 200%!",
      rating: 5,
      propertyType: "New Construction",
      saleAmount: "$15M"
    }
  ];

  // Video testimonials data
  const videoTestimonials = [
    {
      id: 1,
      name: "Jennifer Walsh",
      title: "Happy Homeowner",
      location: "Portland, OR",
      thumbnailUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=300&fit=crop",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: "1:45",
      propertyType: "Modern Loft"
    },
    {
      id: 2,
      name: "Carlos Mendez",
      title: "Real Estate Broker",
      location: "Los Angeles, CA",
      thumbnailUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: "2:10",
      propertyType: "Commercial Space"
    },
    {
      id: 3,
      name: "Amanda Foster",
      title: "First-time Seller",
      location: "Nashville, TN",
      thumbnailUrl: "https://images.unsplash.com/photo-1551836022-8b2858c9c69b?w=400&h=300&fit=crop",
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      duration: "1:30",
      propertyType: "Suburban Home"
    }
  ];

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const StarRating = ({ rating }) => (
    <div className="flex items-center space-x-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ))}
    </div>
  );

  const TestimonialCard = ({ testimonial, isActive }) => (
    <div className={`transition-all duration-500 ${isActive ? 'opacity-100 scale-100' : 'opacity-70 scale-95'}`}>
      <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
        <div className="flex items-start space-x-6">
          <div className="relative flex-shrink-0">
            <img
              src={testimonial.profilePic}
              alt={testimonial.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-purple-100"
            />
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full p-1">
              <Award className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{testimonial.name}</h3>
                <p className="text-purple-600 font-medium">{testimonial.title}</p>
                <p className="text-sm text-gray-500">{testimonial.location}</p>
              </div>
              <StarRating rating={testimonial.rating} />
            </div>
            
            <div className="relative">
              <Quote className="absolute -top-2 -left-2 w-8 h-8 text-purple-200" />
              <p className="text-gray-700 text-lg leading-relaxed italic pl-6">
                "{testimonial.quote}"
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                  {testimonial.propertyType}
                </span>
                <span className="font-bold text-green-600">{testimonial.saleAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const VideoTestimonialCard = ({ video }) => (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative">
        {activeVideoTestimonial === video.id ? (
          <div className="aspect-video">
            <iframe
              src={video.videoUrl}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="relative aspect-video overflow-hidden cursor-pointer" 
               onClick={() => setActiveVideoTestimonial(video.id)}>
            <img
              src={video.thumbnailUrl}
              alt={`${video.name} testimonial`}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
              <div className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-4 transform hover:scale-110 transition-all duration-300">
                <Play className="w-8 h-8 text-purple-600 ml-1" />
              </div>
            </div>
            <div className="absolute bottom-4 right-4 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
              {video.duration}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-1">{video.name}</h4>
        <p className="text-purple-600 font-medium mb-1">{video.title}</p>
        <p className="text-sm text-gray-500 mb-3">{video.location}</p>
        <span className="inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
          {video.propertyType}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Success Stories
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Real stories from real people who found their perfect properties and achieved their real estate goals
          </p>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-purple-600 mr-2" />
                <span className="text-3xl font-bold text-gray-900">50K+</span>
              </div>
              <p className="text-gray-600">Happy Customers</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-8 h-8 text-purple-600 mr-2" />
                <span className="text-3xl font-bold text-gray-900">4.9/5</span>
              </div>
              <p className="text-gray-600">Average Rating</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-8 h-8 text-purple-600 mr-2" />
                <span className="text-3xl font-bold text-gray-900">40%</span>
              </div>
              <p className="text-gray-600">Faster Sales</p>
            </div>
          </div>
        </div>

        {/* Main Testimonial Carousel */}
        <div className="relative mb-20">
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <TestimonialCard 
                    testimonial={testimonial} 
                    isActive={index === currentSlide}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-purple-50 p-3 rounded-full shadow-lg transition-all duration-300 z-10"
          >
            <ChevronLeft className="w-6 h-6 text-purple-600" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-purple-50 p-3 rounded-full shadow-lg transition-all duration-300 z-10"
          >
            <ChevronRight className="w-6 h-6 text-purple-600" />
          </button>
          
          {/* Dots Indicator */}
          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-purple-600 w-8' : 'bg-purple-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Video Testimonials Section */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Video Testimonials</h2>
            <p className="text-lg text-gray-600">
              Hear directly from our customers about their experiences
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videoTestimonials.map((video) => (
              <VideoTestimonialCard key={video.id} video={video} />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Create Your Success Story?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of satisfied customers who've found their perfect properties with our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-purple-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Start Your Journey
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105">
                View All Properties
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSuccessStories;  