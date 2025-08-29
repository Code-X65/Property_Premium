import React, { useState } from 'react';

// SelectField Component
const SelectField = ({ label, value, onChange, options, required, className = "", disabled = false, placeholder, availablePropertyTypes, }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700 ${
          disabled ? 'bg-gray-100 cursor-not-allowed' : ''
        }`}
        required={required}
      >
        <option value="">{placeholder || `Select ${label}`}</option>
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

const PropertyDetails = ({
  formData,
  handleInputChange,
  options,
  selectedOptions,
  handleCheckboxChange,
  addressViewer,
  priceViewer,
  locationData,
  availableStates,
  availableCities,
  getPriceDisplayText,
  disabled = false
}) => {
  return (
    <>
      <div className="gap-6">
        {/* Listing Info Section */}
        <section id='listing_info' className='grid md:grid-cols-2 gap-2'>
          {/* Listing Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Listing Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.listingTitle}
              onChange={(e) => handleInputChange('listingTitle', e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-500"
              placeholder="e.g, 4 Bedroom Serviced Duplex with BQ"
              required
            />
          </div>
          <div className='grid md:grid-cols-2 gap-2'>
            {/* SelectFields */}
            <SelectField
              label="Advertising For"
              value={formData.advertisingFor}
              onChange={(value) => handleInputChange('advertisingFor', value)}
              options={['Sale', 'Rent', 'Lease', 'Shortlet']}
              disabled={disabled}
              required
            />

            <SelectField
              label="Property Type"
              value={formData.propertyType}
              onChange={(value) => handleInputChange('propertyType', value)}
              options={['House', 'Apartment', 'Duplex', 'Bungalow', 'Commercial', 'Land', 'Penthouse', 'Studio', 'Warehouse', 'Office Space']}
              disabled={disabled}
              required
            />
          </div>
          <div className='grid md:grid-cols-2 gap-2 w-full'>
            <SelectField
              label="Use of Property"
              value={formData.useOfProperty}
              onChange={(value) => handleInputChange('useOfProperty', value)}
              options={['Residential', 'Commercial', 'Industrial', 'Mixed Use', 'Unspecified']}
              className='w-full'
              disabled={disabled}
              required
            />

            <SelectField
              label="Market Status"
              value={formData.marketStatus}
              onChange={(value) => handleInputChange('marketStatus', value)}
              options={['Available', 'Under Offer', 'Sold', 'Let', 'Withdrawn']}
              className="w-full"
              disabled={disabled}
              required
            />
          </div>
        </section>

        {/* Enhanced Property Details Section */}
        <section className="my-6">
          <h4 className='text-sm font-medium text-gray-900 my-4 border-b pb-3 border-gray-300'>
            Additional Property Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <SelectField
              label="Property Condition"
              value={formData.propertyCondition}
              onChange={(value) => handleInputChange('propertyCondition', value)}
              options={['Newly Built', 'Renovated', 'Good Condition', 'Fair Condition', 'Needs Renovation']}
              disabled={disabled}
            />
            
            <SelectField
              label="Furnishing Status"
              value={formData.furnishingStatus}
              onChange={(value) => handleInputChange('furnishingStatus', value)}
              options={['Fully Furnished', 'Semi Furnished', 'Unfurnished']}
              disabled={disabled}
            />
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Available From</label>
              <input
                type="date"
                value={formData.availableFrom}
                onChange={(e) => handleInputChange('availableFrom', e.target.value)}
                disabled={disabled}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            
            <SelectField
              label="Minimum Rent Period"
              value={formData.minimumRentPeriod}
              onChange={(value) => handleInputChange('minimumRentPeriod', value)}
              options={['6 Months', '1 Year', '2 Years', '3 Years', 'Negotiable']}
              disabled={disabled}
            />
          </div>
        </section>

        {/* Location Section with Dynamic Dropdowns */}
        <section>
          <h4 className='text-sm font-medium text-gray-900 my-4 border-b pb-3 border-gray-300'>
            Provide information on location of property
          </h4>
          
          {/* Country, State, City in one row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <SelectField
              label="Country"
              value={formData.country}
              onChange={(value) => handleInputChange('country', value)}
              options={Object.keys(locationData)}
              placeholder="Select Country"
              disabled={disabled}
              required
            />
            
            <SelectField
              label="State/Province"
              value={formData.state}
              onChange={(value) => handleInputChange('state', value)}
              options={availableStates}
              placeholder="Select State"
              disabled={!formData.country || disabled}
              required
            />
            
            <SelectField
              label="City"
              value={formData.city}
              onChange={(value) => handleInputChange('city', value)}
              options={availableCities}
              placeholder="Select City"
              disabled={!formData.state || disabled}
              required
            />
          </div>

          <div className='grid md:grid-cols-2 gap-4 items-start'>
            {/* Address */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Property Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-500"
                placeholder="e.g, 70 Maintain Close"
                required
              />
            </div>

            {/* Show Address to Viewer */}
            <div className='text-sm'>
              <p className='block text-sm font-medium text-gray-700 pb-2'>Show address to viewers?</p>
              {addressViewer.map((option, index) => (
                <label key={index} className="flex items-center mb-2 cursor-pointer">
                  <input
                    type="radio"
                    name="showAddress"
                    checked={formData.showAddress === option}
                    onChange={() => handleInputChange('showAddress', option)}
                    disabled={disabled}
                    className="mr-2"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="w-full my-4">
          <h4 className='text-sm font-medium text-gray-900 my-4 border-b pb-3 border-gray-300'>Pricing</h4>
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4 items-end'>
            {/* Currency */}
            <SelectField
              label="Currency"
              value={formData.currency}
              onChange={(value) => handleInputChange('currency', value)}
              options={['Nigeria Naira', 'US Dollar', 'British Pounds', 'Euro', 'South African Rand', 'Ghanaian Cedi']}
              disabled={disabled}
              required
            />

            {/* Price */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-500"
                placeholder="Eg. 7,000,000"
                required
              />
            </div>

            <SelectField
              label="Price Per What?"
              value={formData.price_per}
              onChange={(value) => handleInputChange('price_per', value)}
              options={['Not Applicable', 'Unit', 'Year', 'Half Year', 'Month', 'Week', 'Day', 'Night', 'Square meter', 'Plot', 'Hectare', 'Acre']}
              disabled={disabled}
              required
            />

            {/* Show Price to Viewer - Enhanced */}
            <div className='text-sm'>
              <p className='block text-sm font-medium text-gray-700 pb-2'>Show price to viewers?</p>
              {priceViewer.map((option, index) => (
                <label key={index} className="flex items-center mb-2 cursor-pointer">
                  <input
                    type="radio"
                    name="showPrice"
                    checked={formData.showPrice === option}
                    onChange={() => handleInputChange('showPrice', option)}
                    disabled={disabled}
                    className="mr-2"
                  />
                  <span className="text-xs">{option}</span>
                </label>
              ))}
              {/* Price Preview */}
              {formData.price && formData.price !== '0' && getPriceDisplayText && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                  <strong>Preview:</strong> {getPriceDisplayText(formData.showPrice, formData.price)}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Property Features */}
        <section>
          <h4 className='text-sm font-medium text-gray-900 my-4 border-b pb-3 border-gray-300'>Property Features</h4>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
            {/* Bedroom, Bathroom, Toilet, Year Built */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">No of Bedrooms</label>
              <input
                type="number"
                value={formData.bedroom}
                onChange={(e) => handleInputChange('bedroom', e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-500"
                placeholder="Number of Bedrooms"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">No of Bathrooms</label>
              <input
                type="number"
                value={formData.bathroom}
                onChange={(e) => handleInputChange('bathroom', e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-500"
                placeholder="Number of Bathrooms"
                min="0"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">No of Toilets</label>
              <input
                type="number"
                value={formData.toilet}
                onChange={(e) => handleInputChange('toilet', e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-500"
                placeholder="Number of Toilets"
                min="0"
                required
              />
            </div>

            {/* Year Built */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Year Built</label>
              <input
                type="number"
                value={formData.year_built}
                onChange={(e) => handleInputChange('year_built', e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-500"
                placeholder="Year Property was built"
                min="1900"
                max={new Date().getFullYear()}
                required
              />
            </div>
          </div>

          {/* Facility Options */}
          <div className="p-4 w-full justify-center">
            <h2 className="text-md mb-4 font-medium">Select Available facilities at this property</h2>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2'>
              {options.map((option, index) => (
                <label key={index} className="flex items-center mb-2 cursor-pointer p-2 hover:bg-gray-50 rounded">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option)}
                    onChange={() => handleCheckboxChange(option)}
                    disabled={disabled}
                    className="mr-2 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>

            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <strong className="text-green-800">Selected Amenities:</strong> 
              <span className="text-green-700 ml-2">
                {selectedOptions.length > 0 ? selectedOptions.join(', ') : 'None selected'}
              </span>
            </div>
          </div>
        </section>

        {/* Policies Section */}
        <section className="my-6">
          <h4 className='text-sm font-medium text-gray-900 my-4 border-b pb-3 border-gray-300'>
            Property Policies
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <SelectField
              label="Pet Policy"
              value={formData.petPolicy}
              onChange={(value) => handleInputChange('petPolicy', value)}
              options={['Allowed', 'Not Allowed', 'Cats Only', 'Dogs Only', 'Negotiable']}
              disabled={disabled}
            />
            
            <SelectField
              label="Smoking Policy"
              value={formData.smokingPolicy}
              onChange={(value) => handleInputChange('smokingPolicy', value)}
              options={['Not Allowed', 'Allowed', 'Outdoor Only', 'Designated Areas']}
              disabled={disabled}
            />
          </div>
        </section>

        {/* Utilities Section */}
        <section className="mb-6">
          <h4 className='text-sm font-medium text-gray-900 my-4 border-b pb-3 border-gray-300'>
            Utilities Included
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['Electricity', 'Water', 'Gas', 'Internet', 'Cable TV', 'Waste Management', 'Security', 'Maintenance'].map((utility) => (
              <label key={utility} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={formData.utilitiesIncluded?.includes(utility) || false}
                  onChange={(e) => {
                    const utilities = e.target.checked 
                      ? [...(formData.utilitiesIncluded || []), utility]
                      : (formData.utilitiesIncluded || []).filter(u => u !== utility);
                    handleInputChange('utilitiesIncluded', utilities);
                  }}
                  disabled={disabled}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">{utility}</span>
              </label>
            ))}
          </div>
          
          {formData.utilitiesIncluded && formData.utilitiesIncluded.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <strong className="text-blue-800">Utilities Included:</strong> 
              <span className="text-blue-700 ml-2">
                {formData.utilitiesIncluded.join(', ')}
              </span>
            </div>
          )}
        </section>

        {/* Measurement */}
        <section className='w-full'>
          <h4 className='text-sm font-medium text-gray-900 my-4 border-b pb-3 border-gray-300'>Property Measurements</h4>
          <div className='grid md:grid-cols-2 gap-6'>
            <div className='flex items-end gap-2'>
              {/* Total Area */}
              <div className='flex-1 space-y-2'>
                <label className="block text-sm font-medium text-gray-700">Total Area</label>
                <input
                  type="number"
                  value={formData.totalArea}
                  onChange={(e) => handleInputChange('totalArea', e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-500"
                  placeholder="Total Area"
                  min="0"
                  required
                />
              </div>

              {/* Total Area Unit */}
              <div className='flex-1'>
                <SelectField
                  label="Unit"
                  value={formData.totalAreaUnit}
                  onChange={(value) => handleInputChange('totalAreaUnit', value)}
                  options={['sqm', 'hectares', 'acres', 'plots', 'sqft']}
                  disabled={disabled}
                  required
                />
              </div>
            </div>

            <div className='flex items-end gap-2'>
              {/* Covered Area */}
              <div className='flex-1 space-y-2'>
                <label className="block text-sm font-medium text-gray-700">Covered Area</label>
                <input
                  type="number"
                  value={formData.coveredArea}
                  onChange={(e) => handleInputChange('coveredArea', e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-500"
                  placeholder="Covered Area"
                  min="0"
                  required
                />
              </div>

              {/* Covered Area Unit */}
              <div className='flex-1'>
                <SelectField
                  label="Unit"
                  value={formData.coveredAreaUnit}
                  onChange={(value) => handleInputChange('coveredAreaUnit', value)}
                  options={['sqm', 'hectares', 'acres', 'plots', 'sqft']}
                  disabled={disabled}
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Area Calculation Display */}
          {formData.totalArea && formData.coveredArea && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
              <div className="text-sm text-gray-600">
                <strong>Area Summary:</strong> 
                <span className="ml-2">
                  Total: {formData.totalArea} {formData.totalAreaUnit} | 
                  Covered: {formData.coveredArea} {formData.coveredAreaUnit} | 
                  Open: {(parseFloat(formData.totalArea) - parseFloat(formData.coveredArea)).toFixed(2)} {formData.totalAreaUnit}
                </span>
              </div>
            </div>
          )}
        </section>
      </div>
    </>
  );
};

export default PropertyDetails;