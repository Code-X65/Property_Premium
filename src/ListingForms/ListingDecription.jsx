import { Plus, X } from 'lucide-react'
import React from 'react'

const ListingDecription = ({
    formData,
    handleInputChange,
    handleListChange,
    addListItem,
    removeListItem,
}) => {
  return (
    <>
    <div className="space-y-8">
            {/* Main Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Property Description</h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Detailed Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                  placeholder="Provide a detailed description of your property, including its unique features, condition, and any special amenities..."
                />
                <p className="text-sm text-gray-500">Be descriptive and highlight what makes your property special.</p>
              </div>
            </div>

            {/* Property Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Property Features</h3>
              <p className="text-sm text-gray-600">List the key features and amenities of your property.</p>
              
              <div className="space-y-3">
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleListChange('features', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Swimming pool, Parking space, Air conditioning"
                    />
                    {formData.features.length > 1 && (
                      <button
                        onClick={() => removeListItem('features', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addListItem('features')}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Feature
                </button>
              </div>
            </div>

            {/* Nearby Amenities */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Nearby Amenities</h3>
              <p className="text-sm text-gray-600">List nearby schools, hospitals, shopping centers, and other amenities.</p>
              
              <div className="space-y-3">
                {formData.nearbyAmenities.map((amenity, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={amenity}
                      onChange={(e) => handleListChange('nearbyAmenities', index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Shoprite Mall (5 mins), Lagos University Teaching Hospital (10 mins)"
                    />
                    {formData.nearbyAmenities.length > 1 && (
                      <button
                        onClick={() => removeListItem('nearbyAmenities', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addListItem('nearbyAmenities')}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Amenity
                </button>
              </div>
            </div>
          </div>
    </>
  )
}

export default ListingDecription