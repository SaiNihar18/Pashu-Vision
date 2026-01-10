import React, { useState, useRef, useCallback } from 'react';
import { UploadIcon, CameraIcon, XIcon } from './icons';
import { LoadingSpinner } from './LoadingSpinner';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  currentImage?: string;
  isProcessing?: boolean;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  showPreview?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelect,
  currentImage,
  isProcessing = false,
  maxSizeMB = 10,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  showPreview = true
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    setError('');
    
    // Check file type
    if (!acceptedFormats.includes(file.type)) {
      setError(`Unsupported format. Please use: ${acceptedFormats.map(f => f.split('/')[1]).join(', ')}`);
      return false;
    }

    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setError(`File too large. Maximum size: ${maxSizeMB}MB`);
      return false;
    }

    return true;
  };

  const handleFile = useCallback((file: File) => {
    if (validateFile(file)) {
      onImageSelect(file);
    }
  }, [onImageSelect, maxSizeMB, acceptedFormats]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const clearImage = () => {
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-brand-primary bg-brand-primary/5' 
            : 'border-base-400/50 hover:border-brand-primary/50 hover:bg-base-100/50'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleChange}
          className="hidden"
          disabled={isProcessing}
        />
        
        {isProcessing ? (
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-contrast-300">Processing image...</p>
            <p className="text-sm text-contrast-300">छवि प्रसंस्करण में...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-primary-light rounded-full flex items-center justify-center text-white">
                <UploadIcon className="w-8 h-8" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-contrast-100 mb-2">
                Upload Animal Image
              </h3>
              <p className="text-sm text-contrast-300 mb-1">
                पशु की छवि अपलोड करें
              </p>
              <p className="text-xs text-contrast-300">
                Drag & drop or click to select • Max {maxSizeMB}MB
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={openFileDialog}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-brand-primary text-white rounded-lg hover:bg-brand-primary-light transition-colors font-medium"
              >
                <UploadIcon className="w-5 h-5" />
                <span>Choose File</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Image Preview */}
      {showPreview && currentImage && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-contrast-100">Selected Image</h4>
            <button
              onClick={clearImage}
              className="p-1 text-contrast-300 hover:text-red-500 transition-colors"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <img
              src={currentImage}
              alt="Selected animal"
              className="w-full max-w-md mx-auto rounded-lg shadow-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;