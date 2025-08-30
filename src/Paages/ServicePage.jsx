import React from 'react'
import { Home, Search, Calculator, Users, Shield, TrendingUp } from 'lucide-react'

const ServicesPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section id="hero">
        <div className="bg-[url('https://img.freepik.com/free-photo/analog-landscape-city-with-buildings_23-2149661456.jpg?t=st=1756123910~exp=1756127510~hmac=6c244a93b8833948fcf8f1caa7809e43a6561a27790ad324d0d31652125ba684&w=1060')] bg-no-repeat bg-center bg-cover w-full h-screen flex items-center justify-center relative">
          
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/[0.4]"></div>
          
          {/* Hero Content */}
          <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Buy & Sell Properties 
              <span className="text-blue-400 block mt-2">Online</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
              Connect directly with property buyers and sellers on our digital platform. 
              List your property or find your dream home with ease.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-300 shadow-lg hover:shadow-xl">
                List Your Property
              </button>
              
              <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300">
                Browse Properties
              </button>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-gray-300">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Digital Platform</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Direct Buyer-Seller Connection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>Secure Transactions</span>
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

      {/* Services Grid Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How Our Platform Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our user-friendly website connects property buyers and sellers directly, 
              making real estate transactions simple, transparent, and efficient.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* List Your Property */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 group">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                <Home className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">List Your Property</h3>
              <p className="text-gray-600 mb-6">
                Create detailed property listings with photos, descriptions, and pricing. 
                Reach thousands of potential buyers instantly.
              </p>
              <ul className="text-sm text-gray-500 space-y-2 mb-6">
                <li>• Easy listing creation</li>
                <li>• Photo upload & galleries</li>
                <li>• Pricing tools & suggestions</li>
                <li>• Instant online visibility</li>
              </ul>
              <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors duration-300">
                Start Listing →
              </button>
            </div>

            {/* Browse Properties */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 group">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-600 transition-colors duration-300">
                <Search className="w-8 h-8 text-green-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Browse Properties</h3>
              <p className="text-gray-600 mb-6">
                Search through thousands of properties with advanced filters. 
                Find your perfect home or investment opportunity.
              </p>
              <ul className="text-sm text-gray-500 space-y-2 mb-6">
                <li>• Advanced search filters</li>
                <li>• Interactive property maps</li>
                <li>• High-quality photo galleries</li>
                <li>• Detailed property information</li>
              </ul>
              <button className="text-green-600 font-semibold hover:text-green-700 transition-colors duration-300">
                Start Searching →
              </button>
            </div>

            {/* User Profiles & Verification */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 group">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors duration-300">
                <Users className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">User Profiles</h3>
              <p className="text-gray-600 mb-6">
                Create trusted profiles with verification badges. 
                Build credibility and connect with serious buyers and sellers.
              </p>
              <ul className="text-sm text-gray-500 space-y-2 mb-6">
                <li>• Profile creation & verification</li>
                <li>• Rating & review system</li>
                <li>• Transaction history</li>
                <li>• Identity verification badges</li>
              </ul>
              <button className="text-purple-600 font-semibold hover:text-purple-700 transition-colors duration-300">
                Create Profile →
              </button>
            </div>

            {/* Secure Transactions */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 group">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors duration-300">
                <Shield className="w-8 h-8 text-orange-600 group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Secure Platform</h3>
              <p className="text-gray-600 mb-6">
                Safe and secure transactions with built-in protection, 
                encrypted communications, and fraud prevention.
              </p>
              <ul className="text-sm text-gray-500 space-y-2 mb-6">
                <li>• Secure messaging system</li>
                <li>• Payment protection</li>
                <li>• Document verification</li>
                <li>• 24/7 platform monitoring</li>
              </ul>
              <button className="text-orange-600 font-semibold hover:text-orange-700 transition-colors duration-300">
                Learn More →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Simple 4-Step Process</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Whether you're buying or selling, our platform makes it easy to get started
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Sign Up</h3>
              <p className="text-gray-300">
                Create your free account and verify your profile for trusted transactions
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">List or Search</h3>
              <p className="text-gray-300">
                Upload your property details or browse available properties
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Connect</h3>
              <p className="text-gray-300">
                Message interested buyers or sellers directly through our secure platform
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Complete Deal</h3>
              <p className="text-gray-300">
                Finalize your transaction with our secure tools and support
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">Join Our Property Community</h2>
          <p className="text-xl text-blue-100 mb-8">
            Start buying or selling properties today on our trusted platform. Join thousands of users who have successfully completed their property transactions with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg text-lg transition-colors duration-300">
              Create Free Account
            </button>
            <button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 font-semibold py-4 px-8 rounded-lg text-lg transition-all duration-300">
              Browse Properties
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ServicesPage