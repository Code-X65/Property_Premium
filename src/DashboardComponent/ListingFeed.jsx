import React, { useState, useEffect } from 'react';
import { Calendar, ExternalLink, AlertCircle, RefreshCw, Newspaper, Home } from 'lucide-react';

const ListingFeed = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Replace with your GNews API key
  const GNEWS_API_KEY = '963871356ba532833088d07c8e8d15c6';
  const GNEWS_BASE_URL = 'https://gnews.io/api/v4/search';

  const fetchPropertyNews = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Search terms for property/real estate news
      const searchQueries = [
        'real estate market',
        'property prices',
        'housing market',
        'property investment',
        'real estate trends'
      ];

      // Use a random search query or combine them
      const query = searchQueries.join(' OR ');

      const response = await fetch(
        `${GNEWS_BASE_URL}?q=${encodeURIComponent(query)}&token=${GNEWS_API_KEY}&lang=en&country=any&max=20&sortby=publishedAt`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.articles) {
        // Filter articles to ensure they're property-related
        const propertyArticles = data.articles.filter(article => {
          const content = (article.title + ' ' + article.description).toLowerCase();
          return content.includes('real estate') || 
                 content.includes('property') || 
                 content.includes('housing') ||
                 content.includes('market') ||
                 content.includes('investment');
        });

        setArticles(propertyArticles.slice(0, 12)); // Limit to 12 articles
      } else {
        throw new Error('No articles found');
      }
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPropertyNews();
  }, []);

  const handleRefresh = () => {
    fetchPropertyNews(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 120) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 flex items-center">
            <Newspaper className="h-6 w-6 mr-2 text-blue-600" />
            Property News Feed
          </h3>
        </div>
       <div className="flex flex-col items-center justify-center min-h-screen">
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
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold text-gray-800 flex items-center">
            <Newspaper className="h-6 w-6 mr-2 text-blue-600" />
            Property News Feed
          </h3>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-2">Failed to load property news</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <p className="text-gray-500 text-xs mt-2">Make sure your GNews API key is valid</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-semibold text-gray-800 flex items-center">
          <Newspaper className="h-6 w-6 mr-2 text-blue-600" />
          Property News Feed
        </h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12">
          <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No property news available at the moment.</p>
          <p className="text-gray-500 text-sm mt-2">Try refreshing to load the latest articles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {article.image && (
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              <div className="p-4">
                <div className="flex items-center text-xs text-gray-500 mb-2">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(article.publishedAt)}
                </div>
                
                <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
                  {article.title}
                </h4>
                
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                  {truncateText(article.description)}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {article.source.name}
                    </span>
                  </div>
                  
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center transition-colors"
                  >
                    Read more
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {articles.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            Showing latest property news • Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default ListingFeed;