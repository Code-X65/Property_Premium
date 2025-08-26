import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Link } from 'react-router-dom';
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
  User2Icon,
} from 'lucide-react';

import { subscribeToAuthChanges } from '../Firebase Auth/Firebase'; 
import MainDashboad from './MainDashboad';
import PostListing from './PostListing';
import Listing from './Listing';
import ListingFeed from './ListingFeed';
import Reporting from './Reporting';
import ManageSubcribtion from './AccountManagement';
import PropertyRequest from './PropertyRequest';
import { Navigate,  } from 'react-router-dom';
import PropertyPreviewPopup from './PropertyPreviewpopup';
import ManageSubscription from './AccountManagement';

const handleEditProperty = (property) => {
  // Your edit logic
};

const handleCreateListing = () => {
  // Your create listing logic
};

// Built-in route components
const DashboardRoute = ({user}) => (
  <div>
    {/* Welcome Message */}
    <div className="mb-8">
      <h3 className="text-lg text-gray-700">Welcome back {user}</h3>
    </div>

    {/* Action Cards */}

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    <a href='/Property_Premium/post_a_listing'>
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Plus className="w-6 h-6 text-green-600" />
        </div>
        <h4 className="font-medium text-gray-800">Post a Listing</h4>
      </div>
      </a>


      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-6 h-6 text-green-600" />
        </div>
        <h4 className="font-medium text-gray-800">Manage Subscription</h4>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <Globe className="w-6 h-6 text-green-600" />
        </div>
        <h4 className="font-medium text-gray-800">Manage Website</h4>
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
        <Link to='/Property_Premium/post_a_listing'>  <button className="text-blue-600 hover:underline ml-1">
            Click here to Post a Listing
          </button></Link>
        </p>
      </div>
    </div>

    {/* Latest from Service Areas */}
    <div className="bg-white rounded-lg border border-gray-200 p-6">
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
);

const PostListingRoute = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-8">
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
        <Plus className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Create New Listing</h3>
      <p className="text-gray-600 mb-6">Start posting your property to reach potential buyers and renters.</p>
      <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
        Start Creating Listing
      </button>
    </div>
  </div>
);

const MyListingsRoute = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-8">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-2xl font-semibold text-gray-800">My Listings</h3>
      <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
        <Plus className="w-4 h-4 inline mr-2" />
        New Listing
      </button>
    </div>
    <div className="text-center py-12">
      <List className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-600">You don't have any listings yet.</p>
      <p className="text-gray-500 text-sm mt-2">Create your first listing to get started.</p>
    </div>
  </div>
);

const ListingFeedRoute = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-8">
    <h3 className="text-2xl font-semibold text-gray-800 mb-6">Listing Feed</h3>
    <div className="text-center py-12">
      <p className="text-gray-600">Browse the latest property listings in your area.</p>
      <p className="text-gray-500 text-sm mt-2">Stay updated with new properties and market trends.</p>
    </div>
  </div>
);

const ReportingRoute = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-8">
    <div className="text-center py-12">
      <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Reporting</h3>
      <p className="text-gray-600 mb-4">Advanced analytics and reporting features.</p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
        <p className="text-blue-800 text-sm">🚀 Coming Soon!</p>
      </div>
    </div>
  </div>
);

const MyAccountRoute = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-8">
    <h3 className="text-2xl font-semibold text-gray-800 mb-6">My Account</h3>
    <div className="space-y-6">
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
          <User2 className="w-8 h-8 text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-800">Omolaye Amoss</h4>
          <p className="text-gray-600">Individual Account</p>
          <span className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mt-1">
            Free Plan
          </span>
        </div>
      </div>
      <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
        Upgrade Account
      </button>
    </div>
  </div>
);

const PropertyRequestsRoute = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-8">
    <div className="text-center py-12">
      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Property Requests</h3>
      <p className="text-gray-600 mb-4">Manage incoming property requests from potential clients.</p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 inline-block">
        <p className="text-green-800 text-sm">💎 Pro Feature</p>
      </div>
    </div>
  </div>
);

const HelpSupportRoute = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-8">
    <h3 className="text-2xl font-semibold text-gray-800 mb-6">Help & Support</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="p-6 border border-gray-200 rounded-lg">
        <HelpCircle className="w-8 h-8 text-blue-600 mb-4" />
        <h4 className="font-semibold text-gray-800 mb-2">FAQ</h4>
        <p className="text-gray-600 text-sm">Find answers to commonly asked questions.</p>
      </div>
      <div className="p-6 border border-gray-200 rounded-lg">
        <MessageCircle className="w-8 h-8 text-green-600 mb-4" />
        <h4 className="font-semibold text-gray-800 mb-2">Contact Support</h4>
        <p className="text-gray-600 text-sm">Get help from our support team.</p>
      </div>
    </div>
  </div>
);

// Default component for unknown routes
const NotFoundRoute = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-8">
    <div className="text-center py-12">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h3>
      <p className="text-gray-600">The requested page could not be found.</p>
    </div>
  </div>
);

export default function Dashboard({ 
  // Props for external components
  externalComponents = {},
  // Props for extending routes configuration
  additionalRoutes = {},
  // Props for extending sidebar items
  additionalSidebarItems = []
}) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Get current route from URL
  const currentRoute = location.pathname.replace('/Property_Premium/dashboard/', '') || 'overview';

  // These functions are now inside the component
  const handlePreviewProperty = (property) => {
    setSelectedProperty(property);
    setShowPreview(true);
  };

  useEffect(() => {
    subscribeToAuthChanges((user) => {
      console.log(user.displayName);
      setUser(user.displayName);
    });
  }, []);

  // Base routes configuration
  const baseRoutes = {
    'overview': { component: DashboardRoute, title: 'Your Dashboard', breadcrumb: 'Dashboard' },
    'post-listing': { component: PostListingRoute, title: 'Post a Listing', breadcrumb: 'Post Listing' },
    'my-listings': { component: MyListingsRoute, title: 'My Listings', breadcrumb: 'My Listings' },
    'listing-feed': { component: ListingFeedRoute, title: 'Listing Feed', breadcrumb: 'Listing Feed' },
    'reporting': { component: ReportingRoute, title: 'Reporting', breadcrumb: 'Reporting' },
    'my-account': { component: MyAccountRoute, title: 'My Account', breadcrumb: 'My Account' },
    'property-requests': { component: PropertyRequestsRoute, title: 'Property Requests', breadcrumb: 'Property Requests' },
    'help-support': { component: HelpSupportRoute, title: 'Help & Support', breadcrumb: 'Help & Support' }
  };

  // Merge base routes with additional routes and external components
  const routes = {
    ...baseRoutes,
    ...additionalRoutes,
    ...Object.keys(externalComponents).reduce((acc, key) => {
      acc[key] = {
        component: externalComponents[key].component,
        title: externalComponents[key].title || key,
        breadcrumb: externalComponents[key].breadcrumb || key
      };
      return acc;
    }, {})
  };

  // Base sidebar items
  const baseSidebarItems = [
    { id: 'post-listing', label: 'Post a Listing', icon: Plus, section: 'general' },
    { id: 'overview', label: 'Dashboard', icon: Home, section: 'general', hasSubmenu: false },
    { id: 'my-listings', label: 'My Listings', icon: FileText, section: 'general' },
    { id: 'listing-feed', label: 'Listing Feed', icon: Building2, section: 'general' },
    { id: 'my-account', label: 'My Account', icon: User, section: 'general', hasSubmenu: false },
    { id: 'reporting', label: 'Reporting', icon: BarChart3, section: 'general', badge: 'Soon' },
    { id: 'property-requests', label: 'Property Requests', icon: FileText, section: 'general', badge: 'Pro' },
    { id: 'help-support', label: 'Help and Support', icon: HelpCircle, section: 'extra' }
  ];

  // Merge base sidebar items with additional items
  const sidebarItems = [...baseSidebarItems, ...additionalSidebarItems];

  const generalItems = sidebarItems.filter(item => item.section === 'general');
  const extraItems = sidebarItems.filter(item => item.section === 'extra');

  // Route wrapper components with user prop
  const DashboardWrapper = () => <MainDashboad user={user} />;
  const PostListingWrapper = () => <PostListing />;
  const MyListingsWrapper = () => (
    <>
      <Listing onPreviewProperty={handlePreviewProperty} />
      <PropertyPreviewPopup 
        property={selectedProperty}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onEdit={handleEditProperty}
        onDelete={(property) => {
          // Handle delete - you can reuse existing delete logic
        }}
      />
    </>
  );
  const ListingFeedWrapper = () => <ListingFeed />;
  const ReportingWrapper = () => <Reporting />;
  const MyAccountWrapper = () => <ManageSubscription />;
  const PropertyRequestsWrapper = () => <PropertyRequest />;

  const currentRouteData = routes[currentRoute] || routes['overview'];

  const navigateToRoute = (routeId) => {
    navigate(`/Property_Premium/dashboard/${routeId}`);
    // Auto-close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/[0.2] z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed lg:relative  lg:translate-x-0 z-50 w-64 bg-gray-800 text-white flex flex-col transition-transform duration-300 ease-in-out`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold">Property Premium</h1>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden"
          >
            <X className="w-5 h-5 text-gray-400 hover:text-white" />
          </button>
        </div>

        {/* User Profile */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <User2Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-medium">{user}</h3>
              <p className="text-sm text-gray-400">(individual account)</p>
              <div className="flex items-center space-x-1 mt-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-400">Free Plan (upgrade)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          {/* General Section */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">General</h4>
            <nav className="space-y-1">
              {generalItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id}>
                    <button 
                      onClick={() => navigateToRoute(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                        currentRoute === item.id 
                          ? 'bg-gray-700 text-white' 
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.badge && (
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.badge === 'Pro' 
                              ? 'bg-green-600 text-white' 
                              : 'bg-blue-600 text-white'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        {item.hasSubmenu && <ChevronRight className="w-4 h-4" />}
                      </div>
                    </button>
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Extra Section */}
          <div className="p-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">Extra</h4>
            <nav className="space-y-1">
              {extraItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button 
                    key={item.id}
                    onClick={() => navigateToRoute(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors ${
                      currentRoute === item.id 
                        ? 'bg-gray-700 text-white' 
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>


      
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              
              <h2 className="text-2xl font-semibold text-gray-800">{currentRouteData.title}</h2>
            </div>
            
            <div className="md:flex items-center space-x-2 text-sm text-gray-600 hidden">
              <span>Help Line:</span>
              <MessageCircle className="w-4 h-4 text-green-600" />
              <span className="text-blue-600 font-medium">+234 806 193 6756</span>
            </div>
          </div>
        </div>

        {/* Route Content */}
        <div className="p-3 md:p-6">
          <Routes>
            <Route path="/" element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<DashboardWrapper />} />
            <Route path="post-listing" element={<PostListingWrapper />} />
            <Route path="my-listings" element={<MyListingsWrapper />} />
            <Route path="listing-feed" element={<ListingFeedWrapper />} />
            <Route path="reporting" element={<ReportingWrapper />} />
            <Route path="my-account" element={<MyAccountWrapper />} />
            <Route path="property-requests" element={<PropertyRequestsWrapper />} />
            <Route path="help-support" element={<HelpSupportRoute />} />
            <Route path="*" element={<NotFoundRoute />} />
          </Routes>
        </div>
      </div>  
    </div>
  );
}