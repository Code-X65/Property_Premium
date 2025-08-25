import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Eye, MapPin, Home, BarChart3, PieChart, Activity, ArrowRight, Download } from 'lucide-react';

const MarketTrendsInsights = () => {
  const [animatedValues, setAnimatedValues] = useState({
    lagosPrice: 0,
    abujaSearches: 0,
    priceGrowth: 0,
    totalProperties: 0
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [hoveredCity, setHoveredCity] = useState(null);

  // Target values for animation
  const targetValues = {
    lagosPrice: 125000000, // ₦125M
    abujaSearches: 2847,
    priceGrowth: 15.7,
    totalProperties: 12840
  };

  // Animate numbers on component mount
  useEffect(() => {
    const animateValue = (key, target, duration = 2000) => {
      const increment = target / (duration / 16);
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimatedValues(prev => ({ ...prev, [key]: Math.floor(current) }));
      }, 16);
    };

    setTimeout(() => animateValue('lagosPrice', targetValues.lagosPrice), 200);
    setTimeout(() => animateValue('abujaSearches', targetValues.abujaSearches), 400);
    setTimeout(() => animateValue('priceGrowth', targetValues.priceGrowth * 10), 600);
    setTimeout(() => animateValue('totalProperties', targetValues.totalProperties), 800);
  }, []);

  // Market data for different timeframes
  const marketData = {
    '3months': {
      lagosAvg: 118000000,
      growth: 8.2,
      trend: 'up'
    },
    '6months': {
      lagosAvg: 125000000,
      growth: 15.7,
      trend: 'up'
    },
    '1year': {
      lagosAvg: 142000000,
      growth: 23.4,
      trend: 'up'
    }
  };

  // City search data
  const cityData = [
    { name: 'Abuja', searches: 2847, growth: 12.3, color: 'from-blue-500 to-blue-600' },
    { name: 'Lagos', searches: 2156, growth: 8.7, color: 'from-purple-500 to-purple-600' },
    { name: 'Port Harcourt', searches: 1834, growth: 15.2, color: 'from-green-500 to-green-600' },
    { name: 'Kano', searches: 1245, growth: 6.8, color: 'from-orange-500 to-orange-600' },
    { name: 'Ibadan', searches: 987, growth: 9.4, color: 'from-pink-500 to-pink-600' }
  ];

  // Property type trends
  const propertyTypes = [
    { type: 'Apartments', percentage: 35, trend: 'up', change: 5.2 },
    { type: 'Detached Houses', percentage: 28, trend: 'up', change: 3.8 },
    { type: 'Terraced Houses', percentage: 22, trend: 'down', change: -2.1 },
    { type: 'Commercial', percentage: 15, trend: 'up', change: 8.7 }
  ];

  // Price trend chart data (simplified visualization)
  const priceChartData = [
    { month: 'Jan', price: 105 },
    { month: 'Feb', price: 108 },
    { month: 'Mar', price: 112 },
    { month: 'Apr', price: 118 },
    { month: 'May', price: 122 },
    { month: 'Jun', price: 125 }
  ];

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `₦${(price / 1000000).toFixed(1)}M`;
    }
    return `₦${price.toLocaleString()}`;
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = "purple" }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-r from-${color}-100 to-${color}-200`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            <span>{trend === 'up' ? '+' : ''}{subtitle}</span>
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-600 text-sm">{title}</p>
    </div>
  );

  const CitySearchBar = ({ city, isHovered }) => {
    const maxSearches = Math.max(...cityData.map(c => c.searches));
    const percentage = (city.searches / maxSearches) * 100;
    
    return (
      <div 
        className="mb-4 cursor-pointer transition-all duration-300"
        onMouseEnter={() => setHoveredCity(city.name)}
        onMouseLeave={() => setHoveredCity(null)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-900">{city.name}</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm font-bold text-gray-700">{city.searches.toLocaleString()}</span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              city.growth > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {city.growth > 0 ? '+' : ''}{city.growth}%
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${city.color} rounded-full transition-all duration-1000 ease-out ${
              isHovered ? 'shadow-lg' : ''
            }`}
            style={{ 
              width: `${percentage}%`,
              transform: isHovered ? 'scaleY(1.2)' : 'scaleY(1)'
            }}
          />
        </div>
      </div>
    );
  };

  const PriceChart = () => (
    <div className="bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Price Trends (Lagos)</h3>
        <div className="flex space-x-2">
          {['3months', '6months', '1year'].map((period) => (
            <button
              key={period}
              onClick={() => setSelectedTimeframe(period)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTimeframe === period
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {period === '3months' ? '3M' : period === '6months' ? '6M' : '1Y'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="relative h-40 flex items-end justify-between space-x-2">
        {priceChartData.map((data, index) => (
          <div key={data.month} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t-lg transition-all duration-1000 ease-out hover:from-purple-600 hover:to-purple-500 cursor-pointer relative group"
              style={{ 
                height: `${(data.price / 125) * 100}%`,
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {formatPrice(data.price * 1000000)}
              </div>
            </div>
            <span className="text-xs text-gray-500 mt-2">{data.month}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Market Trends & Insights
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Stay informed with real-time data and comprehensive analysis of Nigeria's real estate market
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <Activity className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleDateString('en-NG')}</span>
          </div>
        </div>

        {/* Key Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={Home}
            title="Avg. House Price in Lagos"
            value={formatPrice(animatedValues.lagosPrice)}
            subtitle={`${(animatedValues.priceGrowth / 10).toFixed(1)}%`}
            trend="up"
            color="purple"
          />
          <StatCard
            icon={Eye}
            title="Most Searched Searches (Abuja)"
            value={animatedValues.abujaSearches.toLocaleString()}
            subtitle="12.3%"
            trend="up"
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            title="Market Growth (YoY)"
            value={`${(animatedValues.priceGrowth / 10).toFixed(1)}%`}
            subtitle="vs last year"
            trend="up"
            color="green"
          />
          <StatCard
            icon={BarChart3}
            title="Active Properties"
            value={animatedValues.totalProperties.toLocaleString()}
            subtitle="8.7%"
            trend="up"
            color="orange"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Price Chart */}
          <PriceChart />

          {/* City Search Rankings */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Top Searched Cities</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Eye className="w-4 h-4" />
                <span>Weekly searches</span>
              </div>
            </div>
            
            <div className="space-y-1">
              {cityData.map((city) => (
                <CitySearchBar 
                  key={city.name} 
                  city={city} 
                  isHovered={hoveredCity === city.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Property Types Trends */}
        <div className="bg-white rounded-2xl p-8 shadow-lg mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Property Type Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {propertyTypes.map((type, index) => (
              <div key={type.type} className="text-center group">
                <div className="relative mb-4">
                  <svg className="w-24 h-24 mx-auto transform -rotate-90 group-hover:scale-110 transition-transform duration-300">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="8"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      strokeDasharray={`${type.percentage * 2.51} 251`}
                      className="transition-all duration-1000 ease-out"
                      style={{ animationDelay: `${index * 200}ms` }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">{type.percentage}%</span>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{type.type}</h4>
                <div className={`flex items-center justify-center space-x-1 text-sm ${
                  type.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {type.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{type.change > 0 ? '+' : ''}{type.change}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Get Detailed Market Analysis</h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Access comprehensive reports, neighborhood insights, and investment opportunities tailored to your needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-purple-600 font-bold py-4 px-8 rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2">
                <span>See Full Report</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketTrendsInsights;