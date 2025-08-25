import React from 'react'
import { 
    Building2, 
    Plus, 
    CreditCard, 
    Globe, 
    BarChart3, 
    User, 
    FileText, 
    HelpCircle,
    Bell,
    Mail,
    Settings,
    LogOut,
    X,
    Phone,
    MessageCircle,
    Save,
    ChevronRight,
    Menu,
    Home,
    List,
    User2,
  } from 'lucide-react';
import { Link } from 'react-router-dom';

const MainDashboad = ({user}) => {
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
        <h4 className="font-medium text-gray-800">Upadet Profile</h4>
      </div>
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-6 h-6 text-green-600" />
        </div>
        <h4 className="font-medium text-gray-800">Manage Subcription</h4>
      </div>
    </div>

    {/* Recent Listings */}
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-medium text-gray-800">Your Recent Listings</h4>
        <button className="text-blue-600 text-sm hover:underline">See more...</button>
      </div>
      <div className="text-center py-8">
        <p className="text-gray-600">
          You do not have any recent listing. 
          <button className="text-blue-600 hover:underline ml-1">
            Click here to Post a Listing
          </button>
        </p>
      </div>
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