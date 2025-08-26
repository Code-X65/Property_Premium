import React from 'react'
import { Link } from 'react-router-dom'

const Hero = () => {
  return (
    <section id="hero">
      <div className="bg-[url('https://img.freepik.com/free-photo/analog-landscape-city-with-buildings_23-2149661456.jpg?t=st=1756123910~exp=1756127510~hmac=6c244a93b8833948fcf8f1caa7809e43a6561a27790ad324d0d31652125ba684&w=1060')] bg-no-repeat bg-center bg-cover w-full h-screen flex items-center justify-center relative">
        
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/[0.4]"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Sell Your Property with 
            <span className="text-blue-400 block mt-2">Confidence</span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Connect with serious buyers and get the best price for your property. 
            Fast, secure, and hassle-free selling experience.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
           <Link to="/dashboard/post_a_listing"> <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-300 shadow-lg hover:shadow-xl">
              List Your Property
            </button>
            </Link>
            
            <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300">
              Browse Properties
            </button>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-300">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>10,000+ Properties Sold</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Trusted by 50,000+ Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Average 30 Days to Sell</span>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero