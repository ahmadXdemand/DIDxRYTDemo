'use client';

import { useState, useRef, useEffect } from 'react';
import { useDIDContext } from '../../context/DIDContext';
import CameraCapture from '@/components/ui/CameraCapture';
import { startCameraStream, stopCameraStream, captureImageFromVideo } from '@/utils/cameraService';
import { uploadImageToPinata } from '@/utils/pinata';

export default function LivenessVerificationStep() {
  const { state, updateDIDData, markStepAsCompleted } = useDIDContext();
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(state.didData.livenessData || null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Check if we already have liveness data and mark step as completed
  useEffect(() => {
    if (capturedImage && !state.isStepCompleted) {
      markStepAsCompleted(true);
    }
  }, [capturedImage, state.isStepCompleted, markStepAsCompleted]);
  
  // Clean up camera stream when component unmounts
  useEffect(() => {
    return () => {
      if (cameraStream) {
        stopCameraStream(cameraStream);
      }
    };
  }, [cameraStream]);
  
  // Start camera and show the camera UI
  const startVerification = async () => {
    try {
      setError(null);
      const stream = await startCameraStream();
      setCameraStream(stream);
      setShowCamera(true);
    } catch (error) {
      console.error('Error starting camera:', error);
      setError(error instanceof Error ? error.message : 'Could not access camera');
    }
  };
  
  // Handle photo capture
  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !cameraStream) return;
    
    try {
      // Capture image from video
      const file = await captureImageFromVideo(videoRef.current, canvasRef.current);
      
      // Create a URL for the captured image
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
      
      // Upload to Pinata if needed
      setIsUploading(true);
      const ipfsUrl = await uploadImageToPinata(file);
      
      // Update the DID context with liveness data
      updateDIDData({ 
        livenessData: imageUrl,
        livenessVerified: true,
        livenessTimestamp: new Date().toISOString(),
        livenessIpfsUrl: ipfsUrl
      });
      
      // Mark step as completed
      markStepAsCompleted(true);
      
      // Close camera UI
      setShowCamera(false);
      stopCameraStream(cameraStream);
      setCameraStream(null);
    } catch (error) {
      console.error('Error capturing or uploading image:', error);
      setError('Failed to capture or upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle cancel from camera UI
  const handleCancelCapture = () => {
    setShowCamera(false);
    if (cameraStream) {
      stopCameraStream(cameraStream);
      setCameraStream(null);
    }
  };
  
  // Handle retaking the photo
  const handleRetake = () => {
    setCapturedImage(null);
    updateDIDData({ 
      livenessData: null,
      livenessVerified: false,
      livenessTimestamp: null,
      livenessIpfsUrl: null
    });
    markStepAsCompleted(false);
    startVerification();
  };
  
  return (
    <div className="space-y-6 text-center">
      <p className="text-gray-600 dark:text-gray-300">
        We need to verify that you're a real person. Please look at the camera and follow the instructions.
      </p>
      
      <div className="flex flex-col items-center justify-center">
        {capturedImage ? (
          <div className="relative">
            <img 
              src={capturedImage} 
              alt="Captured" 
              className="w-80 h-60 object-cover rounded-lg" 
            />
            <button
              onClick={handleRetake}
              className="absolute bottom-2 right-2 bg-gray-800 bg-opacity-70 text-white text-xs px-2 py-1 rounded"
            >
              Retake
            </button>
          </div>
        ) : (
          <div className="w-80 h-60 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Camera feed will appear here</p>
          </div>
        )}
        
        {error && (
          <p className="mt-2 text-red-500 text-sm">{error}</p>
        )}
        
        {isUploading && (
          <div className="mt-2 flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
            <p className="text-blue-500 text-sm">Uploading verification data...</p>
          </div>
        )}
        
        {!showCamera && !capturedImage && !isUploading && (
          <button
            onClick={startVerification}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors"
          >
            Start Verification
          </button>
        )}
      </div>
      
      {/* Camera Capture UI */}
      <CameraCapture
        showCamera={showCamera}
        cameraStream={cameraStream}
        onCapture={handleCapture}
        onCancel={handleCancelCapture}
        videoRef={videoRef}
        canvasRef={canvasRef}
      />
      
      {/* Hidden video and canvas elements for capturing */}
      <div className="hidden">
        <video ref={videoRef} autoPlay playsInline />
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
} 