import React, { useState } from 'react';
import { Upload, X, Camera, Loader2, AlertCircle } from 'lucide-react';

const PropertyMedia = ({
  formData,
  handleInputChange,
  handleDrop,
  handleDragOver,
  handleDragLeave,
  handleImageUpload,
  uploadedImages,
  removeImage,
  dragOver,
  disabled = false,
}) => {
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUploadWithValidation = async (files) => {
    if (!files || files.length === 0) return;
    
    setUploadError('');
    setIsUploading(true);
    
    try {
      // Check if adding these files would exceed reasonable limits
      const totalImages = uploadedImages.length + files.length;
      if (totalImages > 20) {
        setUploadError('Maximum 20 images allowed per property');
        setIsUploading(false);
        return;
      }

      // Validate each file before processing
      const validFiles = [];
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          setUploadError(`${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }
        if (!file.type.startsWith('image/')) {
          setUploadError(`${file.name} is not a valid image file.`);
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        await handleImageUpload(validFiles);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const clearError = () => {
    setUploadError('');
  };

  return (
    <>
      <div className="space-y-8">
        {/* Upload Area */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Property Images</h3>
          <p className="text-sm text-gray-600">
            Upload high-quality images of your property. First image will be used as the main photo.
            Images will be automatically compressed to optimize storage.
          </p>
          
          {/* Upload Error */}
          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-700 text-sm">{uploadError}</p>
                </div>
                <button
                  onClick={clearError}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
          
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver 
                ? 'border-blue-500 bg-blue-50' 
                : disabled 
                  ? 'border-gray-200 bg-gray-50' 
                  : 'border-gray-300 hover:border-blue-400'
            } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUploadWithValidation(e.target.files)}
              className="hidden"
              id="image-upload"
              disabled={disabled || isUploading}
            />
            <div className="space-y-4">
              <div className="flex justify-center">
                {isUploading ? (
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                ) : (
                  <Upload className={`w-12 h-12 ${disabled ? 'text-gray-300' : 'text-gray-400'}`} />
                )}
              </div>
              <div>
                <p className={`text-lg font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                  {isUploading ? 'Processing images...' : 'Drop images here or'}
                </p>
                <label
                  htmlFor="image-upload"
                  className={`inline-block mt-2 px-6 py-2 rounded-md transition-colors ${
                    disabled || isUploading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                  }`}
                >
                  {isUploading ? 'Uploading...' : 'Browse Files'}
                </label>
              </div>
              <p className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
                Supports: JPG, PNG, WebP (Max 10MB each, 20 images total)
              </p>
            </div>
          </div>
        </div>

        {/* Image Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">📸 Image Guidelines</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Upload clear, well-lit photos</li>
            <li>• Include exterior, interior, and key features</li>
            <li>• First image becomes your main listing photo</li>
            <li>• Images are automatically compressed for optimal performance</li>
            <li>• Avoid blurry or low-quality images</li>
          </ul>
        </div>

        {/* Uploaded Images Grid */}
        {uploadedImages.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-800">
                Uploaded Images ({uploadedImages.length}/20)
              </h4>
              <p className="text-sm text-gray-500">
                Drag images to reorder • First image is main photo
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                    <img
                      src={image.preview || image.url}
                      alt={`Property ${index + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTkgMTJMMTEgMTRMMTUgMTBNMjEgMTJDMjEgMTYuOTcwNiAxNi45NzA2IDIxIDEyIDIxQzcuMDI5NDQgMjEgMyAxNi45NzA2IDMgMTJDMyA3LjAyOTQ0IDcuMDI5NDQgMyAxMiAzQzE2Ljk3MDYgMyAyMSA3LjAyOTQ0IDIxIDEyWiIgc3Ryb2tlPSIjOTk5IiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K';
                      }}
                    />
                  </div>
                  
                  {/* Main Image Badge */}
                  {index === 0 && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-sm">
                      Main
                    </div>
                  )}
                  
                  {/* Image Info */}
                  <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-60 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="truncate">{image.name}</p>
                    <p>{(image.size / 1024 / 1024).toFixed(1)}MB</p>
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => removeImage(image.id)}
                    disabled={disabled}
                    className={`absolute top-2 right-2 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                      disabled 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                    title="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  
                  {/* Loading Overlay for New Images */}
                  {isUploading && !image.isExisting && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Add More Images Button */}
            {uploadedImages.length < 20 && (
              <div className="flex justify-center">
                <label
                  htmlFor="image-upload"
                  className={`flex items-center gap-2 px-4 py-2 border-2 border-dashed rounded-lg transition-colors ${
                    disabled
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  Add More Images
                </label>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {uploadedImages.length === 0 && (
          <div className="text-center py-8">
            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No images uploaded yet</p>
            <p className="text-sm text-gray-400">Upload some high-quality photos to showcase your property</p>
          </div>
        )}
      </div>
    </>
  );
};

export default PropertyMedia;