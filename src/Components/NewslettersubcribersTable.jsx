import React, { useState, useEffect } from 'react';
import { Download, Mail, Calendar, MapPin } from 'lucide-react';
import newsletterService from './NewsletterService'; // Adjust path as needed


const NewsletterSubscribersTable = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch subscribers from Firestore
  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to get all subscribers first, then filter active ones
        const data = await newsletterService.getActiveSubscribers();
        console.log('Fetched subscribers:', data); // Debug log
        setSubscribers(data || []);
      } catch (err) {
        console.error('Detailed error:', err);
        setError(`Failed to load subscribers: ${err.message}`);
        
        // Fallback: try to get subscribers without the orderBy query
        try {
          console.log('Attempting fallback query...');
          // You can add a fallback method in your service or handle it here
          setSubscribers([]);
        } catch (fallbackErr) {
          console.error('Fallback also failed:', fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribers();
  }, []);

  const exportToExcel = async () => {
    try {
      const csvData = await newsletterService.exportSubscribers();
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Mail className="w-6 h-6 text-blue-600" />
            Newsletter Subscribers
          </h2>
          <p className="text-gray-600 mt-1">Total: {loading ? '...' : subscribers.length} subscribers</p>
        </div>
        
        <button
          onClick={exportToExcel}
          disabled={loading || subscribers.length === 0}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {loading && (
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
      )}

      {error && (
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
          <div className="text-red-600 mb-4">
            <Mail className="w-12 h-12 mx-auto mb-2 text-red-400" />
            <p className="font-semibold">Unable to load subscribers</p>
            <p className="text-sm mt-2 text-red-500">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-4 font-semibold text-gray-700 border-b">ID</th>
                <th className="text-left p-4 font-semibold text-gray-700 border-b">Email Address</th>
                <th className="text-left p-4 font-semibold text-gray-700 border-b">Subscription Date</th>
                <th className="text-left p-4 font-semibold text-gray-700 border-b">Source</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber, index) => (
                <tr 
                  key={subscriber.id}
                  className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                >
                  <td className="p-4 border-b text-gray-900 font-medium">#{index + 1}</td>
                  <td className="p-4 border-b text-gray-900">{subscriber.email}</td>
                  <td className="p-4 border-b text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    {subscriber.subscribeDate?.toDate ? 
                      subscriber.subscribeDate.toDate().toLocaleDateString() : 
                      'N/A'
                    }
                  </td>
                  <td className="p-4 border-b">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      subscriber.source === 'footer' ? 'bg-blue-100 text-blue-800' :
                      subscriber.source === 'popup' ? 'bg-purple-100 text-purple-800' :
                      subscriber.source === 'website' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {subscriber.source || 'unknown'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && subscribers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No subscribers found</p>
        </div>
      )}
    </div>
  );
};

export default NewsletterSubscribersTable;