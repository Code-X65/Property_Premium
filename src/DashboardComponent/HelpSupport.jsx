import React from 'react'
import { 

    HelpCircle,
    MessageCircle,
    
  } from 'lucide-react';
  
const HelpSupport = () => {
  return (
    <>
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
    </>
  )
}

export default HelpSupport