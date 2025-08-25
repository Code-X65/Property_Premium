import React from 'react'
import { 
   
    FileText, 
   
  } from 'lucide-react';

const PropertyRequest = () => {
  return (
   <>
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
   </>
  )
}

export default PropertyRequest