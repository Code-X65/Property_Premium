import React, { useState, useEffect, useRef } from 'react';
import { Home, Menu, X, LogOut, User, ChevronDown, Settings, BarChart3, UserCircle, DoorOpen, DoorOpenIcon, Heart, Search } from 'lucide-react';
import { collection, query, where, orderBy, getDocs, getFirestore, onSnapshot, collectionGroup, limit, doc, getDoc } from 'firebase/firestore';
import { signOutUser, subscribeToAuthChanges, getCurrentUser } from '../Firebase Auth/Firebase'; // Adjust path to your firebase config


const Navbar = () => {
  const [profileData, setProfileData] = useState(null);
  const [hoveredService, setHoveredService] = useState(null);
const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
const [searchFocused, setSearchFocused] = useState(false);
const [searchSuggestions, setSearchSuggestions] = useState([]);
const [showSuggestions, setShowSuggestions] = useState(false);
const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
const [suggestionLoading, setSuggestionLoading] = useState(false);
const searchRef = useRef(null);

  const dropdownRef = useRef(null);

  const service_1 = [
    { name: "Buy", a: "/property_for_sale" },
    { name: "Rent", a: "/rent-property" },
    { name: "Estate Agent", a: "/Agents" }
  ];

  const service_2 = [
    { name: "Shortlet", a: "/shortlet-property" },
    { name: "Services", a: "/services" },
    { name: "Blog", a: "/blogPage" }
  ];

  const service_1_dropdown = {
  "Buy": [
    { name: "Houses for Sale", href: "/houses-for-sale", icon: "🏠" },
    { name: "Apartments for Sale", href: "/apartments-for-sale", icon: "🏢" },
    { name: "Commercial Properties", href: "/commercial-sale", icon: "🏪" },
    { name: "Land for Sale", href: "/land-for-sale", icon: "🏞️" },
    { name: "New Developments", href: "/new-developments", icon: "🏗️" }
  ],
  "Rent": [
    { name: "Houses for Rent", href: "/houses-for-rent", icon: "🏡" },
    { name: "Apartments for Rent", href: "/apartments-for-rent", icon: "🏢" },
    { name: "Office Spaces", href: "/office-rent", icon: "🏢" },
    { name: "Student Housing", href: "/student-housing", icon: "🎓" },
    { name: "Furnished Rentals", href: "/furnished-rentals", icon: "🛏️" }
  ],
  "Estate Agent": [
    { name: "Find an Agent", href: "/find-agent", icon: "👨‍💼" },
    { name: "Agent Services", href: "/agent-services", icon: "🤝" },
    { name: "Property Valuation", href: "/property-valuation", icon: "💰" },
    { name: "Market Reports", href: "/market-reports", icon: "📊" },
    { name: "Become an Agent", href: "/become-agent", icon: "💼" }
  ]
};

  const navButtons = [
    {
      name: "Sign up",
      className: " font-medium text-[#306] rounded-md hover:bg-blue-700 hover:text-white transition-colors text-sm px-3 py-1",
      a: "/signup"
    },
    {
      name: "Log in",
      className: " font-medium text-[#306] rounded-md hover:bg-blue-700 hover:text-white transition-colors text-sm px-3 py-1",
      a: "/login"
    }
  ];

  // Profile dropdown menu items
  const profileMenuItems = [
    {
      name: "Dashboard",
      icon: BarChart3,
      href: "/dashboard",
      description: "View your dashboard"
    },
    {
    name: "Wishlist",
    icon: Heart,
    href: "/wishlist",
    description: `${wishlistCount} saved properties`,
    badge: wishlistCount > 0 ? wishlistCount : null
  },
    {
      name: "Profile",
      icon: UserCircle,
      href: "/profile",
      description: "Manage your profile"
    },
    {
      name: "Settings",
      icon: Settings,
      href: "/settings",
      description: "Account settings"
    }
  ];

  const allServices = [...service_1, ...service_2];
// Add this function after the getDisplayName function
const fetchUserProfile = async (userId) => {
  try {
    const db = getFirestore();
    // First try to get from profiles subcollection (new structure)
    const profileRef = doc(db, 'users', userId, 'profiles', 'userProfile');
    const profileDoc = await getDoc(profileRef);
    
    if (profileDoc.exists()) {
      const profileData = profileDoc.data();
      setProfileData(profileData);
      setWishlistCount(profileData.wishlist?.length || 0);
    } else {
      // Fallback to main user document (old structure)
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setProfileData(userData);
        setWishlistCount(userData.wishlist?.length || 0);
      }
    }
  } catch (error) {
    console.error('Error fetching profile from Firestore:', error);
  }
};
const fetchSearchSuggestions = async (searchTerm) => {
  if (!searchTerm.trim() || searchTerm.length < 2) return [];
  
  try {
    const db = getFirestore();
    const suggestions = new Set(); // Use Set to avoid duplicates
    
    // Search in properties collection for titles, locations, cities, states
    const propertiesQuery = query(
      collection(db, 'properties'),
      where('status', '==', 'active'),
      limit(20)
    );
    
    const querySnapshot = await getDocs(propertiesQuery);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const searchTermLower = searchTerm.toLowerCase();
      
      // Add matching titles
      if (data.title && data.title.toLowerCase().includes(searchTermLower)) {
        suggestions.add(data.title);
      }
      
      // Add matching locations
      if (data.city && data.city.toLowerCase().includes(searchTermLower)) {
        suggestions.add(`${data.city}, ${data.state}`);
        suggestions.add(data.city);
      }
      
      if (data.state && data.state.toLowerCase().includes(searchTermLower)) {
        suggestions.add(data.state);
      }
      
      if (data.country && data.country.toLowerCase().includes(searchTermLower)) {
        suggestions.add(data.country);
      }
      
      // Add property type combinations
      if (data.propertyType && data.propertyType.toLowerCase().includes(searchTermLower)) {
        suggestions.add(`${data.propertyType} for ${data.advertisingFor}`);
        suggestions.add(data.propertyType);
      }
      
      // Add bedroom combinations
      if (data.bedroom && searchTermLower.includes('bedroom')) {
        suggestions.add(`${data.bedroom} bedroom ${data.propertyType}`);
      }
      
      // Add address if showAddress is true
      if (data.showAddress && data.address && data.address.toLowerCase().includes(searchTermLower)) {
        suggestions.add(data.address);
      }
    });
    
    // Also try collection group query for user properties
    try {
      const userPropertiesQuery = query(
        collectionGroup(db, 'properties'),
        where('status', '==', 'active'),
        limit(10)
      );
      
      const userQuerySnapshot = await getDocs(userPropertiesQuery);
      
      userQuerySnapshot.forEach((doc) => {
        const data = doc.data();
        const searchTermLower = searchTerm.toLowerCase();
        
        if (data.title && data.title.toLowerCase().includes(searchTermLower)) {
          suggestions.add(data.title);
        }
        
        if (data.city && data.city.toLowerCase().includes(searchTermLower)) {
          suggestions.add(`${data.city}, ${data.state}`);
        }
      });
    } catch (error) {
      console.log('Collection group query not available:', error);
    }
    
    // Convert Set to Array and return first 8 suggestions
    return Array.from(suggestions).slice(0, 8);
    
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    return [];
  }
};
const handleSearch = (e) => {
  e.preventDefault();
  if (searchQuery.trim()) {
    // Navigate to search results page with query
    window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    // Or use your router: navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  }
};

const handleSearchInputChange = (e) => {
  const value = e.target.value;
  setSearchQuery(value);
  setSelectedSuggestionIndex(-1);
  
  if (!value.trim()) {
    setShowSuggestions(false);
    setSearchSuggestions([]);
  }
};
const handleSearchKeyDown = (e) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    setSelectedSuggestionIndex(prev => 
      prev < searchSuggestions.length - 1 ? prev + 1 : prev
    );
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    setSelectedSuggestionIndex(prev => prev > -1 ? prev - 1 : -1);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (selectedSuggestionIndex >= 0 && searchSuggestions[selectedSuggestionIndex]) {
      setSearchQuery(searchSuggestions[selectedSuggestionIndex]);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
      // Navigate with selected suggestion
      window.location.href = `/search?q=${encodeURIComponent(searchSuggestions[selectedSuggestionIndex])}`;
    } else if (searchQuery.trim()) {
      handleSearch(e);
    }
  } else if (e.key === 'Escape') {
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  }
};
const handleSuggestionClick = (suggestion) => {
  setSearchQuery(suggestion);
  setShowSuggestions(false);
  setSelectedSuggestionIndex(-1);
  window.location.href = `/search?q=${encodeURIComponent(suggestion)}`;
};
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};
const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOutUser();
      
      // Clear all localStorage items
      localStorage.removeItem("Status");
      localStorage.removeItem("userToken");
      localStorage.removeItem("userData");
      
      console.log('User signed out successfully');
      
      // Close dropdown
      setProfileDropdownOpen(false);
      
      // Redirect to home page
      window.location.href = '/';
      // Alternative: use your router's navigation
      // navigate('/');
      
    } catch (error) {
      console.error('Error signing out:', error);
      alert('Error signing out. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };
const getDisplayName = () => {
  // First try to get from Firestore profile data
  if (profileData?.firstName && profileData?.lastName) {
    return `${profileData.firstName} ${profileData.lastName}`;
  }
  if (profileData?.firstName) {
    return profileData.firstName;
  }
  
  // Fallback to Firebase Auth data
  if (user?.displayName) {
    return user.displayName;
  }
  if (user?.email || profileData?.email) {
    return (user?.email || profileData?.email).split('@')[0];
  }
  return 'User';
};



// Remove the static searchSuggestions array and replace with this function




// Debounce hook for search suggestions

const debouncedSearchQuery = useDebounce(searchQuery, 300);


// Fetch suggestions when debounced search query changes
// Fetch suggestions when debounced search query changes
useEffect(() => {
  const fetchSuggestions = async () => {
    if (debouncedSearchQuery.trim() && debouncedSearchQuery.length >= 2) {
      setSuggestionLoading(true);
      try {
        const suggestions = await fetchSearchSuggestions(debouncedSearchQuery);
        setSearchSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSearchSuggestions([]);
        setShowSuggestions(false);
      } finally {
        setSuggestionLoading(false);
      }
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };
  
  fetchSuggestions();
}, [debouncedSearchQuery]);
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Set up Firebase auth state listener
// Replace the existing auth useEffect with this updated version
useEffect(() => {
  const unsubscribe = subscribeToAuthChanges((user) => {
    setUser(user);
    setIsAuthenticated(!!user);
    
    if (user) {
      localStorage.setItem("Status", "Authenticated");
      localStorage.setItem("userData", JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      }));
      
      // Fetch complete profile data from Firestore
      fetchUserProfile(user.uid);
    } else {
      localStorage.removeItem("Status");
      localStorage.removeItem("userData");
      localStorage.removeItem("userToken");
      setWishlistCount(0);
      setProfileData(null);
    }
  });

  return () => unsubscribe();
}, []);

useEffect(() => {
  return () => {
    if (dropdownTimeout) {
      clearTimeout(dropdownTimeout);
    }
  };
}, [dropdownTimeout]);

  // Firebase logout function using your custom signOutUser
 

  // Get display name for the user


  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
     <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
       <div className="flex justify-between items-center h-14 sm:h-16">
          
          {/* Logo */}
          <div className="flex items-center">
            <Home className="h-7 w-7 text-blue-600" />
            <a href="/" className="ml-2 text-xl font-bold text-gray-800">
             Property Premium
            </a>
          </div>

          {/* Desktop Menu */}
   <div className="hidden md:flex items-center space-x-8">

  {service_1.map((item, index) => (
    <div
      key={index}
      className="relative group"
      onMouseEnter={() => {
        if (dropdownTimeout) {
          clearTimeout(dropdownTimeout);
          setDropdownTimeout(null);
        }
        setHoveredService(item.name);
      }}
      onMouseLeave={() => {
        const timeout = setTimeout(() => {
          setHoveredService(null);
        }, 150);
        setDropdownTimeout(timeout);
      }}
    >
      <a 
        href={item.a} 
        className="relative text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 group py-2 flex items-center"
      >
        <span className="relative z-10">{item.name}</span>
        <ChevronDown className={`ml-1 h-3 w-3 transition-transform duration-200 ${hoveredService === item.name ? 'rotate-180' : ''}`} />
        <div className="absolute inset-0 bg-blue-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 origin-center"></div>
        <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
      </a>
      
      {/* Dropdown Menu */}
      {hoveredService === item.name && service_1_dropdown[item.name] && (
        <div 
          className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 transform animate-in slide-in-from-top-2 duration-200 z-50"
          onMouseEnter={() => {
            if (dropdownTimeout) {
              clearTimeout(dropdownTimeout);
              setDropdownTimeout(null);
            }
          }}
          onMouseLeave={() => {
            const timeout = setTimeout(() => {
              setHoveredService(null);
            }, 150);
            setDropdownTimeout(timeout);
          }}
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800 flex items-center">
              <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
              {item.name} Options
            </h3>
          </div>
          <div className="py-2">
            {service_1_dropdown[item.name].map((dropdownItem, idx) => (
              <a
                key={idx}
                href={dropdownItem.href}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 hover:translate-x-1 group"
                onClick={() => setHoveredService(null)}
              >
                <span className="text-lg">{dropdownItem.icon}</span>
                <div className="flex-1">
                  <p className="font-medium group-hover:text-blue-600 transition-colors duration-200">
                    {dropdownItem.name}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
          
          {/* View All Link */}
          <div className="border-t border-gray-100 pt-2">
            <a
              href={item.a}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-lg mx-2"
              onClick={() => setHoveredService(null)}
            >
              View All {item.name}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  ))}
  
  <span className="text-gray-300 mx-2">|</span>
  
  {service_2.map((item, index) => (
    <a 
      key={index} 
      href={item.a} 
      className="relative text-sm font-medium text-gray-700 hover:text-blue-600 transition-all duration-300 group py-2"
    >
      <span className="relative z-10">{item.name}</span>
      <div className="absolute inset-0 bg-blue-50 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-200 origin-center"></div>
      <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></div>
    </a>
  ))}

     {/* Search Box - Desktop */}
<div className="relative">
  <form onSubmit={handleSearch} className="relative">
    <input
      ref={searchRef}
      type="text"
      value={searchQuery}
      onChange={handleSearchInputChange}
      onKeyDown={handleSearchKeyDown}
      onFocus={() => {
        if (searchQuery.trim() && searchSuggestions.length > 0) {
          setShowSuggestions(true);
        }
      }}
      onBlur={() => {
        setTimeout(() => {
          setShowSuggestions(false);
          setSelectedSuggestionIndex(-1);
        }, 200);
      }}
      placeholder="Search properties..."
      className={`w-64 pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ${searchFocused ? 'w-72 bg-white shadow-lg' : ''}`}
    />
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    {searchQuery && !suggestionLoading && (
      <button
        type="button"
        onClick={() => {
          setSearchQuery('');
          setShowSuggestions(false);
          setSearchSuggestions([]);
        }}
        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
      >
        <X className="h-3 w-3" />
      </button>
    )}
    {suggestionLoading && (
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        <div className="animate-spin h-3 w-3 border border-gray-400 border-t-transparent rounded-full"></div>
      </div>
    )}
  </form>
  
  {/* Search Suggestions Dropdown */}
  {showSuggestions && (
    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-2xl border border-gray-100 py-2 z-50 max-h-80 overflow-y-auto">
      <div className="px-3 py-2 text-xs text-gray-500 font-medium border-b border-gray-100 flex items-center gap-2">
        <Search className="w-3 h-3" />
        Search Suggestions
        {suggestionLoading && (
          <div className="animate-spin h-3 w-3 border border-gray-400 border-t-transparent rounded-full ml-auto"></div>
        )}
      </div>
      {searchSuggestions.length > 0 ? (
        searchSuggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors duration-150 flex items-center gap-3 ${
              selectedSuggestionIndex === index ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
            }`}
          >
            <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <span className="flex-1">{suggestion}</span>
            {selectedSuggestionIndex === index && (
              <div className="text-xs text-blue-600 font-medium">↵</div>
            )}
          </button>
        ))
      ) : !suggestionLoading && searchQuery.length >= 2 && (
        <div className="px-4 py-3 text-sm text-gray-500 flex items-center gap-3">
          <Search className="w-4 h-4 text-gray-400" />
          No suggestions found
        </div>
      )}
    </div>
  )}
</div>
</div>

          {/* Login/Signup Buttons - Show when NOT authenticated */}
       <div className={`hidden md:flex items-center gap-3 ${isAuthenticated ? 'md:hidden' : ''}`}>
  {navButtons.map((btn, idx) => (
    <a 
      key={idx} 
      href={btn.a} 
      className="relative overflow-hidden px-4 py-2 font-medium text-sm rounded-md border-1 border-blue-600 text-blue-600 hover:text-white transition-all duration-300 group"
    >
      <span className="relative z-10">{btn.name}</span>
      <div className="absolute inset-0 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </a>
  ))}
</div>
          {/* User Profile Dropdown - Show when authenticated */}
<div className={`relative hidden md:flex ${isAuthenticated ? 'md:flex' : 'md:hidden'}`} ref={dropdownRef}>
           <button
  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
  className="flex items-center p-2 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 transform hover:scale-105 border-2 border-transparent hover:border-blue-200"
>
              {/* User Avatar */}
            {/* User Avatar */}
 {profileData?.profileImage || user?.photoURL ? (
    <img 
      src={profileData?.profileImage || user.photoURL} 
      alt="User Avatar" 
      className="h-9 w-9 rounded-full border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 shadow-md hover:shadow-lg"
    />
  ) : (
    <div className="h-9 w-9 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center hover:from-blue-200 hover:to-purple-200 transition-all duration-300 shadow-md hover:shadow-lg">
      <User className="h-5 w-5 text-blue-600" />
    </div>
  )}
  <ChevronDown className={`ml-1 h-4 w-4 text-gray-500 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
</button>

            {/* Dropdown Menu */}
          {profileDropdownOpen && (
  <div className="absolute right-0 top-full mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 transform animate-in slide-in-from-top-2 duration-200">
    {/* User Info Header */}
    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
      <div className="flex items-center gap-3">
        {profileData?.profileImage || user?.photoURL ? (
          <img 
            src={profileData?.profileImage || user.photoURL} 
            alt="User Avatar" 
            className="h-12 w-12 rounded-full border-3 border-white shadow-md"
          />
        ) : (
          <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-md">
            <User className="h-6 w-6 text-blue-600" />
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-gray-800">{getDisplayName()}</p>
          {(profileData?.email || user?.email) && (
            <p className="text-xs text-gray-600">{profileData?.email || user.email}</p>
          )}
        </div>
      </div>
    </div>

    {/* Menu Items */}
    <div className="py-2">
      {profileMenuItems.map((item, index) => (
        <a
          key={index}
          href={item.href}
          className="flex items-center gap-4 px-6 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 hover:translate-x-1 group"
          onClick={() => setProfileDropdownOpen(false)}
        >
          <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors duration-200">
            <item.icon className="h-4 w-4 text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{item.name}</p>
            <p className="text-xs text-gray-500">{item.description}</p>
          </div>
          {item.badge && (
            <span className="bg-gradient-to-r from-red-100 to-pink-100 text-red-600 text-xs px-2 py-1 rounded-full font-medium shadow-sm">
              {item.badge}
            </span>
          )}
        </a>
      ))}
    </div>

    {/* Logout Button */}
    <div className="border-t border-gray-100 pt-2">
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className="flex items-center gap-4 px-6 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 w-full text-left disabled:opacity-50 disabled:cursor-not-allowed hover:translate-x-1 group"
      >
        <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors duration-200">
          <LogOut className="h-4 w-4 text-red-600" />
        </div>
        <div>
          <p className="font-medium">{isLoggingOut ? 'Logging out...' : 'Logout'}</p>
          <p className="text-xs text-red-500">Sign out of your account</p>
        </div>
      </button>
    </div>
  </div>
)}
          </div>

          {/* Mobile Menu Toggle */}
      
<div className="flex md:hidden">
  <button 
    onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
    className="text-gray-700 focus:outline-none hover:text-blue-600 transition-colors p-2"
  >
    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
  </button>
</div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 space-y-3 bg-white border-t border-gray-100">
          {/* Mobile User Info - Show when authenticated */}
          {isAuthenticated && (
            <div className="py-3 border-b border-gray-100">
              <div className="flex items-center gap-3 mb-3">
               {profileData?.profileImage || user?.photoURL ? (
  <img 
    src={profileData?.profileImage || user.photoURL} 
    alt="User Avatar" 
    className="h-10 w-10 rounded-full border-2 border-gray-200"
  />
) : (
  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
    <User className="h-5 w-5 text-blue-600" />
  </div>
)}
                <div>
                  <p className="text-sm font-medium text-gray-800">{getDisplayName()}</p>
                 {profileData?.email || user?.email && (
  <p className="text-xs text-gray-500">{profileData?.email || user.email}</p>
)}
                </div>
              </div>
              
              {/* Mobile Profile Menu Items */}
              <div className="space-y-2">
                {profileMenuItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="flex items-center gap-3 text-sm text-gray-700 hover:text-blue-700 transition-colors duration-200 py-1"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4 text-gray-500" />
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          )}

            {/* Mobile Search Box */}
<div className="py-3 border-b border-gray-100">
  <form onSubmit={handleSearch} className="relative">
    <input
      type="text"
      value={searchQuery}
      onChange={handleSearchInputChange}
      placeholder="Search properties..."
      className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    />
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
    {searchQuery && (
      <button
        type="button"
        onClick={() => setSearchQuery('')}
        className="absolute right-3 top-1/2 transform -translate-y-1/2"
      >
        <X className="h-3 w-3 text-gray-400" />
      </button>
    )}
  </form>
</div>

          {/* Navigation Links */}
       {allServices.map((item, i) => (
  <a
    key={i}
    href={item.a}
    className="block text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:translate-x-2 transition-all duration-300 py-3 px-2 rounded-lg font-medium"
    onClick={() => setMobileMenuOpen(false)}
  >
    <span className="flex items-center">
      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3 opacity-0 hover:opacity-100 transition-opacity duration-200"></span>
      {item.name}
    </span>
  </a>
))}
          
          <hr className="border-gray-100" />
          
          {/* Mobile - Show login/signup when not authenticated */}
        {!isAuthenticated && navButtons.map((btn, idx) => (
  <a
    key={idx}
    href={btn.a}
    className="block text-sm font-semibold text-blue-600 hover:text-white hover:bg-blue-600 border-2 border-blue-600 rounded-lg py-2 px-4 text-center transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
    onClick={() => setMobileMenuOpen(false)}
  >
    {btn.name}
  </a>
))}
          
          {/* Mobile - Show logout when authenticated */}
       {isAuthenticated && (
  <button
    onClick={() => {
      handleLogout();
      setMobileMenuOpen(false);
    }}
    disabled={isLoggingOut}
    className="flex items-center gap-3 text-red-600 hover:text-white hover:bg-red-600 transition-all duration-300 text-sm w-full text-left py-3 px-4 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg border-2 border-red-200 hover:border-red-600 transform hover:scale-105"
  >
    <LogOut className="h-4 w-4" />
    {isLoggingOut ? 'Logging out...' : 'Logout'}
  </button>
)}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;