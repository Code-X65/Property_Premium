import React from 'react'
import { 
    Plus, 
   
  } from 'lucide-react';

const PostListing = () => {
  return (
    <>
    <div className="bg-white rounded-lg border border-gray-200 p-8">
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
        <Plus className="w-8 h-8 text-green-600" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Create New Listing</h3>
      <p className="text-gray-600 mb-6">Start posting your property to reach potential buyers and renters.</p>
    <a href="/post_a_listing">  <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
        Start Creating Listing
      </button></a>
    </div>
  </div>
    </>
  )
}

export default PostListing