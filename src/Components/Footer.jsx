// Footer.js - Updated with newsletter backend integration
import React, { useState } from 'react';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Youtube,
  Mail,
  Phone,
  MapPin,
  Send,
  Heart,
  Home,
  Users,
  Shield,
  Award,
  ArrowRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useNewsletter } from './Newsletterhook'; // Adjust path as needed

const Footer = () => {
  const [email, setEmail] = useState('');
  const { loading, error, success, subscribe, clearError } = useNewsletter();

  const handleNewsletterSubmit = async () => {
    if (!email.trim()) {
      return;
    }

    // Clear any previous errors when user tries again
    if (error) clearError();

    const result = await subscribe(email.trim(), 'footer');
    
    if (result.success) {
      setEmail(''); // Clear email on success
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleNewsletterSubmit();
    }
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook', color: 'hover:text-blue-600' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram', color: 'hover:text-pink-600' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn', color: 'hover:text-blue-700' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube', color: 'hover:text-red-600' }
  ];

  const quickLinks = [
    'Buy Properties',
    'Rent Properties',
    'Sell Property',
    'Property Management',
    'Market Analysis',
    'Investment Properties'
  ];

  const companyLinks = [
    'About Us',
    'Our Team',
    'Careers',
    'Press',
    'Blog',
    'Contact'
  ];

  const supportLinks = [
    'Help Center',
    'Safety Tips',
    'Community Guidelines',
    'Terms of Service'
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Home className="w-8 h-8 text-blue-400" />
                <span className="text-2xl font-bold">Property Premium</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Your trusted partner in finding the perfect property. We connect buyers, sellers, and renters with premium real estate opportunities.
              </p>
            </div>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>123 Real Estate St, Property City, PC 12345</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Phone className="w-5 h-5 text-blue-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="w-5 h-5 text-blue-400" />
                <span>hello@propertypremium.com</span>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="font-semibold mb-3">Follow Us</h4>
              <div className="flex gap-3">
                {socialLinks.map(({ icon: Icon, href, label, color }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 bg-gray-800 rounded-full transition-colors ${color} hover:bg-gray-700`}
                    aria-label={label}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Support */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Newsletter</h3>
            
            {/* Mini Newsletter Form */}
            <div className="mb-8">
              <p className="text-gray-400 text-sm mb-4">
                Get property updates and market insights delivered weekly.
              </p>
              
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter your email"
                    className={`w-full px-3 py-2 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 text-sm transition-all ${
                      error 
                        ? 'border-2 border-red-500 focus:ring-red-400' 
                        : success 
                        ? 'border-2 border-green-500 focus:ring-green-400'
                        : 'focus:ring-blue-400'
                    }`}
                    disabled={loading}
                  />
                  {error && (
                    <AlertCircle className="absolute right-3 top-2.5 w-4 h-4 text-red-500" />
                  )}
                  {success && (
                    <CheckCircle className="absolute right-3 top-2.5 w-4 h-4 text-green-500" />
                  )}
                </div>

                <button
                  onClick={handleNewsletterSubmit}
                  disabled={loading || success || !email.trim()}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : success ? (
                    <>Subscribed! <CheckCircle className="w-3 h-3" /></>
                  ) : (
                    <>Subscribe <Send className="w-3 h-3" /></>
                  )}
                </button>
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="mt-2 p-2 bg-red-900/30 border border-red-700 rounded text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mt-2 p-2 bg-green-900/30 border border-green-700 rounded text-green-400 text-xs flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 flex-shrink-0" />
                  <span>Check your email for confirmation!</span>
                </div>
              )}
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-semibold mb-3">Support</h4>
              <ul className="space-y-2">
                {supportLinks.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 space-y-3">
              <h4 className="font-semibold text-sm">Why Choose Us</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span>Verified Properties</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Trusted Agents</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span>Award Winning Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-gray-400 text-sm">
              © 2025 Property Premiumb. All rights reserved. Made with ❤️ for property seekers.
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Unsubscribe</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;