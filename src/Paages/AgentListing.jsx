import React, { useState, useEffect } from 'react';
import { 
  User, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Building, 
  Star, 
  Filter,
  Search,
  CheckCircle,
  ExternalLink,
  Loader2,
  Home
} from 'lucide-react';
import { 
  collection, 
  getDocs, 
  query, 
  where,
  orderBy,
  limit,
  startAfter,
  getFirestore
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AgentsList = () => {
    const navigate = useNavigate();
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  
  const AGENTS_PER_PAGE = 12;

  // Nigerian states for filtering
  const nigerianStates = [
    'Lagos', 'Abuja', 'Rivers', 'Ogun', 'Kano', 'Kaduna', 'Oyo', 'Delta', 'Edo', 'Anambra'
  ];

  // Real estate categories
  const categories = [
    'real-estate-agent',
    'real-estate-organization', 
    'estate-surverying-firm',
    'developer',
    'property-manager',
    'broker'
  ];

  const formatCategoryName = (category) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const fetchAgents = async (resetList = false) => {
  try {
    setLoading(true);
    setError('');
    
    const db = getFirestore();
    
    // Simple query - just get all users without any where clauses or orderBy
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const allAgents = [];
    
    // Process each user document
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      
      try {
        // Get all profiles for this user
        const profilesRef = collection(db, 'users', userId, 'profiles');
        const profilesSnapshot = await getDocs(profilesRef);
        
        for (const profileDoc of profilesSnapshot.docs) {
          const profileData = profileDoc.data();
          
          // Client-side filtering - no indexes needed
         if (profileData.isRealEstateProfessional === true) {
            
            allAgents.push({
              id: userId,
              ...userData,
              ...profileData,
              profileId: profileDoc.id,
              searchableText: `${profileData.firstName || ''} ${profileData.lastName || ''} ${profileData.companyName || ''} ${profileData.city || ''}`.toLowerCase()
            });
          }
        }
      } catch (profileError) {
        console.error(`Error fetching profiles for user ${userId}:`, profileError);
      }
    }
    
   // Shuffle the agents list
  const shuffledAgents = shuffleArray(allAgents);
    
    // Apply filters
    let filteredAgents = shuffledAgents;
    
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filteredAgents = filteredAgents.filter(agent =>
        agent.searchableText.includes(searchLower)
      );
    }
    
    if (selectedState) {
      filteredAgents = filteredAgents.filter(agent => 
        agent.state === selectedState
      );
    }
    
    if (selectedCategory) {
      filteredAgents = filteredAgents.filter(agent => 
        agent.category === selectedCategory
      );
    }
    
    // Implement client-side pagination
    const startIndex = resetList ? 0 : agents.length;
    const endIndex = startIndex + AGENTS_PER_PAGE;
    const paginatedAgents = filteredAgents.slice(startIndex, endIndex);
    
    if (resetList) {
      setAgents(paginatedAgents);
    } else {
      setAgents(prev => [...prev, ...paginatedAgents]);
    }
    
    // Check if there are more agents to load
    setHasMore(endIndex < filteredAgents.length);
    
  } catch (error) {
    console.error('Error fetching agents:', error);
    setError('Failed to load agents. Please try again.');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchAgents(true);
  }, []);

  useEffect(() => {
    // Reset and refetch when filters change
    setCurrentPage(1);
    setLastDoc(null);
    setHasMore(true);
    fetchAgents(true);
  }, [searchTerm, selectedState, selectedCategory]);

const loadMore = () => {
  if (!loading && hasMore) {
    fetchAgents(false); // This will load the next batch
  }
};

  const AgentCard = ({ agent }) => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header with Profile Image */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="relative">
          {agent.profileImage ? (
            <img
              src={agent.profileImage}
              alt={`${agent.firstName} ${agent.lastName}`}
              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className={`absolute -top-1 -right-1 rounded-full p-1 ${
  agent.validation ? 'bg-green-500' : 'bg-yellow-500'
}`}>
  <CheckCircle className="w-4 h-4 text-white" />
</div>
        </div>
        
        <div className="flex-1">
          <h3 
  onClick={() => navigate(`Property_Premium/profile/${agent.id}`)}
  className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
>
  {agent.firstName} {agent.lastName}
</h3>
          {agent.companyName && (
            <p className="text-sm text-blue-600 font-medium">{agent.companyName}</p>
          )}
          <p className="text-sm text-gray-500 capitalize">
            {formatCategoryName(agent.category || 'real-estate-agent')}
          </p>
        </div>
      </div>

      {/* Location */}
      <div className="flex items-center text-gray-600 mb-3">
        <MapPin className="w-4 h-4 mr-2" />
        <span className="text-sm">{agent.city}, {agent.state}</span>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        {agent.primaryPhone && (
          <div className="flex items-center text-gray-600">
            <Phone className="w-4 h-4 mr-2" />
            <span className="text-sm">{agent.primaryPhone}</span>
          </div>
        )}
        {agent.email && (
          <div className="flex items-center text-gray-600">
            <Mail className="w-4 h-4 mr-2" />
            <span className="text-sm">{agent.email}</span>
          </div>
        )}
        {agent.website && (
          <div className="flex items-center text-gray-600">
            <Globe className="w-4 h-4 mr-2" />
            <a 
              href={agent.website.startsWith('http') ? agent.website : `https://${agent.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              Visit Website <ExternalLink className="w-3 h-3 inline ml-1" />
            </a>
          </div>
        )}
      </div>

      {/* About */}
      {agent.aboutUs && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 line-clamp-3">
            {agent.aboutUs.length > 120 
              ? `${agent.aboutUs.substring(0, 120)}...` 
              : agent.aboutUs
            }
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
          Contact Agent
        </button>
      <button 
  onClick={() => navigate(`/Property_Premium/profile/${agent.id}`)}
  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
>
  View Profile
</button>
      </div>
    </div>
  );

  const FilterSection = () => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
      <div className="flex items-center mb-4">
        <Filter className="w-5 h-5 text-gray-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">Filter Agents</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* State Filter */}
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All States</option>
          {nigerianStates.map(state => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {formatCategoryName(category)}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {(searchTerm || selectedState || selectedCategory) && (
        <div className="mt-4">
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedState('');
              setSelectedCategory('');
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Real Estate Professionals
        </h1>
        <p className="text-gray-600">
          Connect with verified real estate agents, brokers, and professionals
        </p>
      </div>

      {/* Filters */}
      <FilterSection />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => fetchAgents(true)}
            className="mt-2 text-red-600 hover:text-red-700 font-medium text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results Count */}
      {!loading && (
        <div className="mb-6">
          <p className="text-gray-600">
            {agents.length === 0 ? 'No agents found' : 
             agents.length === 1 ? '1 agent found' : 
             `${agents.length} agents found`}
          </p>
        </div>
      )}

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {/* Loading State */}
      {loading && agents.length === 0 && (
        <div className="flex flex-col items-center justify-center max-h-lg">
      <div className="relative flex items-center justify-center">
        {/* Static House */}
        <Home className="text-blue-600 h-10 w-10 z-10" />

        {/* Spinning Circle Around House */}
        <div className="absolute animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
      </div>

      {/* Loading Text */}
      <span className="mt-4 text-gray-600 text-lg font-medium">
        Property Premium
      </span>
    </div>
      )}

      {/* Load More Button */}
      {!loading && hasMore && agents.length > 0 && (
        <div className="text-center">
          <button
            onClick={loadMore}
            className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Load More Agents
          </button>
        </div>
      )}

      {/* End of Results */}
      {!loading && !hasMore && agents.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">You've reached the end of the list</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && agents.length === 0 && !error && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No agents found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedState || selectedCategory
              ? 'Try adjusting your filters to see more results.'
              : 'No verified real estate professionals available at the moment.'}
          </p>
          {(searchTerm || selectedState || selectedCategory) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedState('');
                setSelectedCategory('');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AgentsList;