import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CameraIcon, CheckCircleIcon, UploadIcon, RefreshCwIcon } from './icons';

interface ImageCaptureProps {
  onCapture: (file: File) => void;
  promptText: string;
}

export const ImageCapture: React.FC<ImageCaptureProps> = ({ onCapture, promptText }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mobile detection hook
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobile(mobileRegex.test(userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFileChange = (file: File) => {
    setImageFile(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);
    onCapture(file);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        handleFileChange(file);
    } else if (file) {
        console.error("Invalid file type. Please select an image.");
    }
    // This allows re-uploading the same file name
    if (event.target) {
        event.target.value = '';
    }
  };

  const openGallery = () => {
    if (fileInputRef.current) {
      // For mobile, this will open the gallery/camera options
      fileInputRef.current.click();
    }
  };

  const stopCameraStream = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);
  
  const openCamera = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError("Camera is not supported on this device or browser.");
      return;
    }
    setCameraError(null);
    setIsCameraOpen(true);
  };

  const closeCamera = useCallback(() => {
    stopCameraStream();
    setIsCameraOpen(false);
  }, [stopCameraStream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
            handleFileChange(capturedFile);
          }
        }, 'image/jpeg');
      }
      closeCamera();
    }
  };

  useEffect(() => {
    if (isCameraOpen) {
      const startCamera = async () => {
        try {
          // Enhanced mobile camera constraints
          const constraints = {
            video: {
              facingMode: 'environment',
              width: { ideal: isMobile ? 1280 : 1920 },
              height: { ideal: isMobile ? 720 : 1080 },
              frameRate: { ideal: isMobile ? 30 : 60 },
              // Additional mobile optimizations
              ...(isMobile && {
                aspectRatio: { ideal: 16/9 },
                resizeMode: 'crop-and-scale'
              })
            }
          };
          
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            // Mobile-specific video settings
            if (isMobile) {
              videoRef.current.setAttribute('playsinline', 'true');
              videoRef.current.setAttribute('webkit-playsinline', 'true');
            }
          }
        } catch (err) {
          console.error("Error accessing camera:", err);
          const errorMessage = isMobile 
            ? "Could not access camera. Please ensure camera permissions are granted and no other app is using the camera."
            : "Could not access camera. Please ensure permissions are granted.";
          setCameraError(errorMessage);
          setIsCameraOpen(false);
        }
      };
      startCamera();
    }
    return () => {
      stopCameraStream();
    };
  }, [isCameraOpen, stopCameraStream, isMobile]);
  
  return (
    <div className="w-full">
      <div className="w-full aspect-video bg-gradient-to-br from-base-300 to-base-400/60 rounded-xl flex items-center justify-center flex-col text-contrast-300 border-2 border-dashed border-base-400/50 p-4">
        {previewUrl ? (
          <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
        ) : (
          <>
            <CameraIcon className="w-16 h-16 text-slate-400" />
            <p className="mt-2 font-semibold">{promptText}</p>
          </>
        )}
      </div>

      {previewUrl ? (
        <>
          <div className="mt-4 flex items-center justify-center text-lg font-medium text-brand-primary-light animate-pulse">
            <CheckCircleIcon className="w-6 h-6 mr-2" />
            Image Ready for Analysis
          </div>
          
          {/* Retake Button */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => {
                if (previewUrl) {
                  URL.revokeObjectURL(previewUrl);
                }
                setPreviewUrl(null);
                setImageFile(null);
              }}
              className={`bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400 flex items-center justify-center transition-all duration-300 ${isMobile ? 'py-4 px-6 text-base min-h-[56px] active:scale-95' : 'py-3 px-5 transform hover:-translate-y-0.5'}`}
            >
              <RefreshCwIcon className={`mr-2 ${isMobile ? 'w-6 h-6' : 'w-5 h-5'}`} />
              {isMobile ? '🔄 Retake Photo' : 'Retake Image'}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className={`mt-4 grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
            <button
              type="button"
              onClick={openCamera}
              className={`w-full bg-gradient-to-br from-contrast-100 to-contrast-200 text-white font-bold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-contrast-200 flex items-center justify-center transition-all duration-300 ${isMobile ? 'py-5 px-6 text-lg min-h-[64px] active:scale-95' : 'py-3 px-4 transform hover:-translate-y-0.5'}`}
            >
              <CameraIcon className={`mr-3 ${isMobile ? 'w-7 h-7' : 'w-5 h-5'}`} />
              {isMobile ? '📸 Take Photo' : 'Start Camera'}
            </button>
            <button
              type="button"
              onClick={openGallery}
              className={`w-full bg-gradient-to-br from-brand-secondary to-slate-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary flex items-center justify-center transition-all duration-300 ${isMobile ? 'py-5 px-6 text-lg min-h-[64px] active:scale-95' : 'py-3 px-4 transform hover:-translate-y-0.5'}`}
            >
              <UploadIcon className={`mr-3 ${isMobile ? 'w-7 h-7' : 'w-5 h-5'}`} />
              {isMobile ? '🖼️ Choose from Gallery' : 'Upload Image'}
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/*"
            className="hidden"
            aria-hidden="true"
          />
        </>
      )}

      {isCameraOpen && (
        <div 
          className="fixed inset-0 bg-black z-50" 
          aria-modal="true" 
          role="dialog" 
          style={{ 
            height: '100dvh', // Dynamic viewport height for mobile
            overflow: 'hidden',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
        >
            {/* Mobile-optimized camera interface */}
            {isMobile ? (
              // Mobile Layout - Reduced height to ensure controls are always visible
              <>
                {/* Camera video with significantly reduced height */}
                <video 
                  ref={videoRef} 
                  autoPlay 
                  playsInline 
                  muted 
                  className="w-full object-cover"
                  style={{ 
                    width: '100vw',
                    height: '60vh', // Much smaller - only 60% of viewport height
                    objectFit: 'cover',
                    position: 'absolute',
                    top: 0,
                    left: 0
                  }}
                />
                <canvas ref={canvasRef} className="hidden" />
                
                {/* Mobile camera overlay guidelines */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center" style={{ height: '60vh' }}>
                  <div className="border-2 border-white/40 rounded-2xl w-4/5 aspect-video flex items-center justify-center">
                    <div className="text-white/90 text-center bg-black/50 rounded-xl p-3 backdrop-blur-sm">
                      <p className="text-sm font-medium">Position animal in frame</p>
                      <p className="text-xs mt-1 opacity-80">पशु को फ्रेम में रखें</p>
                    </div>
                  </div>
                </div>
                
                {/* Error message overlay */}
                {cameraError && (
                  <div className="absolute top-4 left-4 right-4 text-white bg-red-600/95 p-3 rounded-xl text-center z-20 backdrop-blur-sm">
                    <p className="font-medium text-sm">{cameraError}</p>
                  </div>
                )}
                
                {/* Camera controls positioned below the video area */}
                <div className="absolute left-0 right-0 bg-gradient-to-t from-black/95 to-black/40 backdrop-blur-lg" style={{ top: '60vh', height: '40vh' }}>
                  <div className="h-full flex items-center justify-center px-6">
                    <div className="flex items-center justify-between w-full max-w-sm">
                      {/* Cancel button */}
                      <button 
                        type="button"
                        onClick={closeCamera} 
                        className="bg-white/20 backdrop-blur-md text-white font-semibold rounded-xl px-4 py-3 text-sm border border-white/30 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-white/50 min-h-[48px]"
                        aria-label="Close camera"
                      >
                        ✕ Cancel
                      </button>
                      
                      {/* Large capture button - Always visible */}
                      <button 
                        type="button"
                        onClick={capturePhoto} 
                        disabled={!!cameraError}
                        className="bg-white rounded-full p-1 focus:outline-none focus:ring-4 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed group transition-all active:scale-90 shadow-2xl"
                        aria-label="Capture photo"
                      >
                        <div className="w-16 h-16 bg-red-500 rounded-full border-3 border-white group-hover:bg-red-400 transition-colors group-active:scale-95 flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                      </button>
                      
                      {/* Help text */}
                      <div className="w-[64px] text-center">
                        <p className="text-white/70 text-xs">Tap to capture</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Desktop Layout - Keep existing behavior
              <div className="h-full flex items-center justify-center p-4">
                <div className="relative bg-black rounded-lg overflow-hidden w-full max-w-3xl aspect-video shadow-2xl">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  
                  {/* Error message overlay */}
                  {cameraError && (
                    <div className="absolute top-4 left-4 right-4 text-white bg-red-600/90 p-3 rounded-lg text-center z-10">
                      <p className="font-medium text-sm">{cameraError}</p>
                    </div>
                  )}
                </div>
                
                {/* Desktop camera controls */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center space-x-8">
                    <button 
                      type="button"
                      onClick={closeCamera} 
                      className="bg-gray-700/80 text-white font-semibold rounded-lg px-8 py-3 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
                      aria-label="Close camera"
                    >
                      Cancel
                    </button>
                    
                    <button 
                      type="button"
                      onClick={capturePhoto} 
                      disabled={!!cameraError}
                      className="bg-white rounded-full p-3 focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
                      aria-label="Capture photo"
                    >
                      <div className="w-12 h-12 bg-brand-primary-light rounded-full border-4 border-white group-hover:bg-brand-primary transition-colors"></div>
                    </button>
                  </div>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};