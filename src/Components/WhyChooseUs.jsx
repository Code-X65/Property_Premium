import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Zap, 
  DollarSign, 
  Users, 
  Award, 
  Clock, 
  CheckCircle, 
  Star,
  ArrowRight,
  TrendingUp,
  Lock,
  Heart
} from 'lucide-react';

const WhyChooseUs = () => {
  const [visibleCards, setVisibleCards] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  const valuePropositions = [
    {
      id: 1,
      icon: Users,
      emoji: "💼",
      title: "Trusted Agents",
      description: "Verified professionals with proven track records and stellar client reviews",
      stats: "500+ Certified Agents",
      color: "from-blue-500 to-blue-600",
      bgColor: "from-blue-50 to-blue-100",
      delay: 0
    },
    {
      id: 2,
      icon: Zap,
      emoji: "⚡",
      title: "Fast Transactions",
      description: "Streamlined processes that close deals 40% faster than industry average",
      stats: "24-48 Hour Response",
      color: "from-yellow-500 to-orange-500",
      bgColor: "from-yellow-50 to-orange-100",
      delay: 200
    },
    {
      id: 3,
      icon: DollarSign,
      emoji: "💵",
      title: "No Hidden Charges",
      description: "Transparent pricing with all costs disclosed upfront - no surprises",
      stats: "100% Transparent Fees",
      color: "from-green-500 to-green-600",
      bgColor: "from-green-50 to-green-100",
      delay: 400
    },
    {
      id: 4,
      icon: Shield,
      emoji: "🛡️",
      title: "Secure Listings",
      description: "Bank-level security with verified properties and protected transactions",
      stats: "256-bit SSL Encryption",
      color: "from-purple-500 to-purple-600",
      bgColor: "from-purple-50 to-purple-100",
      delay: 600
    }
  ];

  const additionalFeatures = [
    {
      icon: Award,
      title: "Industry Recognition",
      description: "Winner of 2024 Best Real Estate Platform Award"
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Round-the-clock customer service and assistance"
    },
    {
      icon: TrendingUp,
      title: "Market Insights",
      description: "Real-time analytics and market trend reports"
    },
    {
      icon: Heart,
      title: "Client Satisfaction",
      description: "98% customer satisfaction rate and growing"
    }
  ];

  // Animate cards on mount
  useEffect(() => {
    valuePropositions.forEach((card, index) => {
      setTimeout(() => {
        setVisibleCards(prev => [...prev, card.id]);
      }, card.delay);
    });
  }, []);

  const ValueCard = ({ item, isVisible }) => {
    const IconComponent = item.icon;
    
    return (
      <div 
        className={`relative group cursor-pointer transition-all duration-700 transform ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        } ${hoveredCard === item.id ? 'scale-105 -translate-y-2' : ''}`}
        onMouseEnter={() => setHoveredCard(item.id)}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div className="relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 overflow-hidden">
          {/* Background Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-br ${item.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
          
          {/* Floating Elements */}
          <div className="absolute top-4 right-4">
            <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-500 group-hover:animate-pulse`} />
          </div>
          
          <div className="relative z-10">
            {/* Icon Section */}
            <div className="flex items-center justify-between mb-6">
              <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${item.color} shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                <IconComponent className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
                  {item.emoji}
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>

            {/* Content */}
            <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gray-800 transition-colors">
              {item.title}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              {item.description}
            </p>

            {/* Stats Badge */}
            <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r ${item.color} text-white text-sm font-semibold shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
              <CheckCircle className="w-4 h-4" />
              <span>{item.stats}</span>
            </div>

            {/* Hover Arrow */}
            <div className={`absolute bottom-6 right-6 transform transition-all duration-300 ${
              hoveredCard === item.id ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
            }`}>
              <ArrowRight className="w-6 h-6 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FeatureItem = ({ feature, index }) => {
    const IconComponent = feature.icon;
    
    return (
      <div 
        className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-300 group"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <div className="flex-shrink-0 p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
          <IconComponent className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">{feature.title}</h4>
          <p className="text-sm text-gray-600">{feature.description}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 via-white to-purple-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Award className="w-4 h-4" />
            <span>Why Choose Our Platform</span>
          </div>
          
          <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Your Success is Our Priority
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We've revolutionized real estate with cutting-edge technology, trusted partnerships, 
            and unwavering commitment to transparency
          </p>
        </div>

        {/* Main Value Propositions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {valuePropositions.map((item) => (
            <ValueCard 
              key={item.id} 
              item={item} 
              isVisible={visibleCards.includes(item.id)}
            />
          ))}
        </div>

        {/* Additional Features Section */}
        <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                More Reasons to Choose Us
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Beyond our core promises, we offer additional benefits that set us apart 
                from the competition and ensure your real estate journey is smooth and successful.
              </p>
              
              <div className="space-y-4">
                {additionalFeatures.map((feature, index) => (
                  <FeatureItem key={feature.title} feature={feature} index={index} />
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Stats Display */}
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12" />
                
                <div className="relative z-10">
                  <h4 className="text-2xl font-bold mb-8">Our Track Record</h4>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">50K+</div>
                      <div className="text-sm opacity-90">Happy Clients</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">98%</div>
                      <div className="text-sm opacity-90">Satisfaction Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">₦50B+</div>
                      <div className="text-sm opacity-90">Properties Sold</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold mb-2">24/7</div>
                      <div className="text-sm opacity-90">Support Available</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-col sm:flex-row gap-4">
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2">
              <span>Get Started Today</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border-2 border-purple-200 hover:border-purple-400 text-purple-600 hover:text-purple-700 font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:bg-purple-50">
              Learn More About Us
            </button>
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Join thousands of satisfied customers who made the smart choice
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;