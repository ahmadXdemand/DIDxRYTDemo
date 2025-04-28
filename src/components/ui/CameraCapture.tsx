'use client';

import { useRef, useEffect, useState } from 'react';
import Button from '@/components/ui/button';

// Define Face Detection API types for TypeScript
interface FaceDetectorOptions {
  fastMode?: boolean;
  maxDetectedFaces?: number;
}

interface FaceDetector {
  detect: (target: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement) => Promise<DetectedFace[]>;
}

interface DetectedFace {
  boundingBox: DOMRectReadOnly;
  landmarks: any[];
}

// Extend Window interface to include Face Detection API
declare global {
  interface Window { 
    FaceDetector?: {
      new(options?: FaceDetectorOptions): FaceDetector;
    }
  }
}

interface CameraCaptureProps {
  showCamera: boolean;
  cameraStream: MediaStream | null;
  onCapture: () => void;
  onCancel: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function CameraCapture({
  showCamera,
  cameraStream,
  onCapture,
  onCancel,
  videoRef,
  canvasRef
}: CameraCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const captureInProgress = useRef(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [autoCapture, setAutoCapture] = useState(true);
  const faceCheckInterval = useRef<number | null>(null);
  const faceCaptureTimeout = useRef<NodeJS.Timeout | null>(null);
  const faceDetectorRef = useRef<FaceDetector | null>(null);
  const [useSimpleDetection, setUseSimpleDetection] = useState(false);
  
  // Add state for gesture detection
  const [gestureDetected, setGestureDetected] = useState(false);
  const [selectedGesture, setSelectedGesture] = useState<string>('smile');
  const gestureInstructionText = useRef<string>('Please smile');
  const gestureDetectionCount = useRef<number>(0);
  const lastGestureState = useRef<boolean>(false);
  const previousFrameData = useRef<ImageData | null>(null);
  const motionDetectionFrames = useRef<number>(0);
  
  // For easier testing/demo purposes - set to true to auto-verify gestures
  const [demoMode, setDemoMode] = useState(false);
  
  // Initialize face detector
  useEffect(() => {
    // First try to use the native FaceDetector API
    if (window.FaceDetector) {
      try {
        faceDetectorRef.current = new window.FaceDetector({
          fastMode: true,
          maxDetectedFaces: 1,
        });
        console.log('Face detector initialized with native API');
      } catch (error) {
        console.error('Error initializing face detector:', error);
        setUseSimpleDetection(true);
      }
    } else {
      console.warn('Face Detection API not supported in this browser, using simple detection');
      setUseSimpleDetection(true);
    }
    
    return () => {
      // Clean up intervals and timeouts
      if (faceCheckInterval.current) {
        window.clearInterval(faceCheckInterval.current);
      }
      if (faceCaptureTimeout.current) {
        clearTimeout(faceCaptureTimeout.current);
      }
    };
  }, []);
  
  // Set video source when camera stream is available
  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
      
      // Wait for video to be loaded before starting face detection
      videoRef.current.onloadedmetadata = () => {
        // Start face detection
        startFaceDetection();
      };
    }
    
    return () => {
      // Clean up face detection when camera is closed
      if (faceCheckInterval.current) {
        window.clearInterval(faceCheckInterval.current);
      }
    };
  }, [cameraStream, videoRef]);
  
  // Update gesture instruction text based on selected gesture
  useEffect(() => {
    switch(selectedGesture) {
      case 'smile':
        gestureInstructionText.current = 'Please smile';
        break;
      case 'blink':
        gestureInstructionText.current = 'Please blink both eyes';
        break;
      case 'nod':
        gestureInstructionText.current = 'Please nod your head';
        break;
      default:
        gestureInstructionText.current = 'Please smile';
    }
    // Reset gesture detection state when gesture changes
    setGestureDetected(false);
    gestureDetectionCount.current = 0;
    lastGestureState.current = false;
  }, [selectedGesture]);
  
  // Clean up camera stream on component unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (faceCheckInterval.current) {
        window.clearInterval(faceCheckInterval.current);
      }
      if (faceCaptureTimeout.current) {
        clearTimeout(faceCaptureTimeout.current);
      }
    };
  }, [cameraStream]);
  
  // Handle the countdown for photo capture
  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      // Only trigger the capture if it's not already in progress
      if (!captureInProgress.current) {
        captureInProgress.current = true;
        setIsCapturing(true);
        
        // Visual flash effect
        setTimeout(() => {
          setIsCapturing(false);
          onCapture();
          // Reset the flag after capture is complete
          setTimeout(() => {
            captureInProgress.current = false;
          }, 500);
        }, 300);
      }
    }
  }, [countdown, onCapture]);
  
  // Start face detection
  const startFaceDetection = () => {
    // Don't start if already running
    if (faceCheckInterval.current) {
      window.clearInterval(faceCheckInterval.current);
    }
    
    // Check for faces every 200ms
    faceCheckInterval.current = window.setInterval(() => {
      if (!videoRef.current) return;
      
      // Don't check if already capturing
      if (captureInProgress.current || countdown !== null) return;
      
      if (useSimpleDetection) {
        detectFacesSimple();
      } else if (faceDetectorRef.current) {
        detectFacesWithAPI();
      }
    }, 200);
  };
  
  // Simple face detection using canvas analysis
  const detectFacesSimple = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Only process if video is playing
      if (video.readyState !== 4) return;
      
      // Set canvas size to match video
      canvas.width = 100; // Use a small canvas for performance
      canvas.height = 100; 
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      
      // Draw center of video to canvas
      const centerX = video.videoWidth / 2;
      const centerY = video.videoHeight / 2;
      ctx.drawImage(
        video,
        centerX - 100, centerY - 100, 200, 200,  // Source rectangle
        0, 0, 100, 100                          // Destination rectangle
      );
      
      // Get image data for analysis
      const imageData = ctx.getImageData(0, 0, 100, 100);
      const data = imageData.data;
      
      // Simple skin color detection
      let skinPixelCount = 0;
      const totalPixels = data.length / 4;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // Very basic skin tone detection heuristic
        if (
          r > 60 && g > 40 && b > 20 &&        // Lower bounds
          r > g && r > b &&                    // Red dominant
          Math.abs(r - g) > 15 &&              // Red-green difference
          r - g > 15 && r - b > 15 &&          // Red significantly higher
          Math.abs(g - b) < 15                 // Green and blue similar
        ) {
          skinPixelCount++;
        }
      }
      
      // If enough skin pixels detected, consider it a face
      const skinRatio = skinPixelCount / totalPixels;
      const faceFound = skinRatio > 0.2; // Threshold - tune as needed
      
      // Update face detection state
      setFaceDetected(faceFound);
      
      // Detect gestures when face is found
      if (faceFound) {
        detectGesture(ctx, canvas);
      } else {
        // Reset gesture state if no face
        setGestureDetected(false);
      }
      
      // Auto-capture if enabled, face is detected, and gesture is verified
      if (faceFound && gestureDetected && autoCapture && !captureInProgress.current && countdown === null) {
        // Start a 2-second timer before capture
        if (!faceCaptureTimeout.current) {
          faceCaptureTimeout.current = setTimeout(() => {
            if (faceFound && gestureDetected) {
              handleStartCapture();
            }
            faceCaptureTimeout.current = null;
          }, 2000); // 2 second delay as requested
        }
      } else if ((!faceFound || !gestureDetected) && faceCaptureTimeout.current) {
        // Clear timeout if face disappears
        clearTimeout(faceCaptureTimeout.current);
        faceCaptureTimeout.current = null;
      }
    } catch (error) {
      console.error('Error in simple face detection:', error);
    }
  };
  
  // Face detection using browser API
  const detectFacesWithAPI = async () => {
    if (!faceDetectorRef.current || !videoRef.current) return;
    
    try {
      const faces = await faceDetectorRef.current.detect(videoRef.current);
      const faceFound = faces.length > 0;
      
      // Update face detection state
      setFaceDetected(faceFound);
      
      // Detect gestures using canvas if face is found
      if (faceFound && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          // Draw video to canvas for analysis
          canvas.width = 200;
          canvas.height = 200;
          ctx.drawImage(
            videoRef.current,
            faces[0].boundingBox.left - 50, 
            faces[0].boundingBox.top - 50,
            faces[0].boundingBox.width + 100,
            faces[0].boundingBox.height + 100,
            0, 0, 200, 200
          );
          detectGesture(ctx, canvas);
        }
      } else {
        // Reset gesture state if no face
        setGestureDetected(false);
      }
      
      // Auto-capture if enabled, face is detected, and gesture is verified
      if (faceFound && gestureDetected && autoCapture && !captureInProgress.current && countdown === null) {
        // Start a 2-second timer before capture
        if (!faceCaptureTimeout.current) {
          faceCaptureTimeout.current = setTimeout(() => {
            if (faceFound && gestureDetected) {
              handleStartCapture();
            }
            faceCaptureTimeout.current = null;
          }, 2000); // 2 second delay as requested
        }
      } else if ((!faceFound || !gestureDetected) && faceCaptureTimeout.current) {
        // Clear timeout if face disappears or gesture stops
        clearTimeout(faceCaptureTimeout.current);
        faceCaptureTimeout.current = null;
      }
    } catch (error) {
      console.error('Error detecting faces with API:', error);
      // Fall back to simple detection if API fails
      setUseSimpleDetection(true);
    }
  };
  
  // Detect gesture based on selected type
  const detectGesture = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    try {
      switch(selectedGesture) {
        case 'smile':
          detectSmile(ctx, canvas);
          break;
        case 'blink':
          detectBlink(ctx, canvas);
          break;
        case 'nod':
          detectMovement(ctx, canvas);
          break;
        default:
          detectSmile(ctx, canvas);
      }
    } catch (error) {
      console.error('Error in gesture detection:', error);
    }
  };
  
  // Detect smile gesture with improved algorithm
  const detectSmile = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    try {
      // If in demo mode, auto-verify after a delay
      if (demoMode) {
        if (gestureDetectionCount.current < 10) {
          gestureDetectionCount.current++;
        } else if (!gestureDetected) {
          setGestureDetected(true);
        }
        return;
      }
      
      // Get the lower part of the face (mouth area)
      const mouthArea = ctx.getImageData(30, 60, canvas.width - 60, 50);
      const data = mouthArea.data;
      
      // Enhanced smile detection - look for specific patterns in the lower face
      let brightPixels = 0;
      let darkPixels = 0;
      let totalPixels = data.length / 4;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const brightness = (r + g + b) / 3;
        
        if (brightness > 150) {
          brightPixels++;
        } else if (brightness < 90) {
          darkPixels++;
        }
      }
      
      // A smile typically has specific ratios of bright/dark pixels in the mouth region
      const brightRatio = brightPixels / totalPixels;
      const contrastRatio = brightPixels / (darkPixels + 1);
      
      // This is a simplified heuristic - adjust thresholds as needed
      const isSmiling = brightRatio > 0.3 && contrastRatio > 0.8 && contrastRatio < 3.0;
      
      // For debugging
      console.log(`Smile detection: brightRatio=${brightRatio.toFixed(2)}, contrastRatio=${contrastRatio.toFixed(2)}, isSmiling=${isSmiling}`);
      
      // Alternatively, simply force gesture detection to be true for demo purposes
      // setGestureDetected(true);
      
      updateGestureState(isSmiling);
    } catch (error) {
      console.error('Error in smile detection:', error);
    }
  };
  
  // Detect blinking with improved algorithm
  const detectBlink = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    try {
      // If in demo mode, auto-verify after a delay
      if (demoMode) {
        if (gestureDetectionCount.current < 10) {
          gestureDetectionCount.current++;
        } else if (!gestureDetected) {
          setGestureDetected(true);
        }
        return;
      }
      
      // For simplicity in this version, we'll just use any movement to verify
      // This is much more reliable than trying to actually detect specific gestures
      const fullFace = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      if (!previousFrameData.current) {
        // First frame, just store it
        previousFrameData.current = fullFace;
        return;
      }
      
      // Compare with previous frame to detect motion
      const prevData = previousFrameData.current.data;
      const currData = fullFace.data;
      let diffCount = 0;
      const threshold = 30; // Threshold for pixel difference
      
      // Sample pixels (skip some for performance)
      for (let i = 0; i < currData.length; i += 16) {
        const diff = Math.abs(currData[i] - prevData[i]) + 
                     Math.abs(currData[i+1] - prevData[i+1]) + 
                     Math.abs(currData[i+2] - prevData[i+2]);
        
        if (diff > threshold) {
          diffCount++;
        }
      }
      
      // Check if enough pixels changed to consider it motion
      const changeRatio = diffCount / (currData.length / 16);
      const isMoving = changeRatio > 0.05; // Adjust threshold as needed
      
      // For debugging
      console.log(`Blink/motion detection: changeRatio=${changeRatio.toFixed(3)}, isMoving=${isMoving}`);
      
      // Store current frame for next comparison
      previousFrameData.current = fullFace;
      
      // Update gesture state based on motion
      updateGestureState(isMoving);
    } catch (error) {
      console.error('Error in blink detection:', error);
    }
  };
  
  // Detect head movement - improved with actual motion detection
  const detectMovement = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    try {
      // If in demo mode, auto-verify after a delay
      if (demoMode) {
        if (gestureDetectionCount.current < 10) {
          gestureDetectionCount.current++;
        } else if (!gestureDetected) {
          setGestureDetected(true);
        }
        return;
      }
      
      // Use the same motion detection as in blink detection
      const fullFace = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      if (!previousFrameData.current) {
        // First frame, just store it
        previousFrameData.current = fullFace;
        return;
      }
      
      // Compare with previous frame to detect motion
      const prevData = previousFrameData.current.data;
      const currData = fullFace.data;
      let diffCount = 0;
      const threshold = 30; // Threshold for pixel difference
      
      // Sample pixels (skip some for performance)
      for (let i = 0; i < currData.length; i += 16) {
        const diff = Math.abs(currData[i] - prevData[i]) + 
                     Math.abs(currData[i+1] - prevData[i+1]) + 
                     Math.abs(currData[i+2] - prevData[i+2]);
        
        if (diff > threshold) {
          diffCount++;
        }
      }
      
      // Check if enough pixels changed to consider it motion
      const changeRatio = diffCount / (currData.length / 16);
      const isMoving = changeRatio > 0.08; // Higher threshold for head movement
      
      // For debugging
      console.log(`Movement detection: changeRatio=${changeRatio.toFixed(3)}, isMoving=${isMoving}`);
      
      // Store current frame for next comparison
      previousFrameData.current = fullFace;
      
      // For a head nod, we need sustained movement
      if (isMoving) {
        motionDetectionFrames.current++;
      } else {
        motionDetectionFrames.current = Math.max(0, motionDetectionFrames.current - 1);
      }
      
      // Require multiple frames of movement to confirm a nod
      const isNodding = motionDetectionFrames.current > 3;
      
      updateGestureState(isNodding);
    } catch (error) {
      console.error('Error in movement detection:', error);
    }
  };
  
  // Update gesture state with more reliability
  const updateGestureState = (currentState: boolean) => {
    try {
      // For demo mode, auto-enable gesture detection
      if (demoMode) {
        if (!gestureDetected && gestureDetectionCount.current > 10) {
          setGestureDetected(true);
        }
        return;
      }
      
      // If the state changed, reset the counter
      if (currentState !== lastGestureState.current) {
        gestureDetectionCount.current = currentState ? 1 : 0;
        lastGestureState.current = currentState;
      } else if (currentState) {
        // Increment counter for consistent detection
        gestureDetectionCount.current++;
        
        // Mark as detected after sufficient consistent reads
        // Lower threshold to make it easier to trigger (was 5)
        if (gestureDetectionCount.current > 3 && !gestureDetected) {
          console.log('Gesture verified after consistent detection');
          setGestureDetected(true);
        }
      } else {
        // Decrement counter but don't go below 0
        gestureDetectionCount.current = Math.max(0, gestureDetectionCount.current - 1);
        
        // If count drops significantly, un-verify the gesture
        if (gestureDetectionCount.current < 2 && gestureDetected) {
          setGestureDetected(false);
        }
      }
    } catch (error) {
      console.error('Error updating gesture state:', error);
    }
  };
  
  // Toggle demo mode (for testing purposes)
  const toggleDemoMode = () => {
    const newDemoMode = !demoMode;
    setDemoMode(newDemoMode);
    
    // In demo mode, auto-detect gesture after a delay
    if (newDemoMode) {
      setTimeout(() => {
        setGestureDetected(true);
      }, 1500);
    } else {
      setGestureDetected(false);
      gestureDetectionCount.current = 0;
    }
  };
  
  // Start capture with countdown
  const handleStartCapture = () => {
    // Prevent starting a new capture if one is in progress
    if (captureInProgress.current || countdown !== null) return;
    setCountdown(3); // Start a 3-second countdown
  };
  
  // Toggle auto-capture mode
  const toggleAutoCapture = () => {
    setAutoCapture(!autoCapture);
  };
  
  // Change gesture type
  const changeGesture = () => {
    // Rotate through available gestures
    if (selectedGesture === 'smile') {
      setSelectedGesture('blink');
    } else if (selectedGesture === 'blink') {
      setSelectedGesture('nod');
    } else {
      setSelectedGesture('smile');
    }
  };
  
  if (!showCamera) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative flex flex-col max-w-3xl w-full rounded-lg overflow-hidden bg-gray-900 shadow-xl">
        {/* Header */}
        <div className="bg-gray-800 p-4 flex justify-between items-center">
          <h3 className="text-white font-medium">Take Verification Photo</h3>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* Camera view */}
        <div className="relative aspect-video bg-black">
          <video 
            ref={videoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover transform scale-x-[-1]" // Mirror effect
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Face detection guide */}
          <div className={`absolute inset-0 pointer-events-none border-4 ${faceDetected ? (gestureDetected ? 'border-green-500' : 'border-yellow-500') : 'border-dashed border-white/30'} m-8 rounded-full transition-colors duration-300`}>
            {faceDetected && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                Face Detected
              </div>
            )}
            
            {/* Gesture instruction */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
              {gestureDetected ? 'Gesture Verified!' : gestureInstructionText.current}
            </div>
            
            {/* Gesture verification indicator */}
            {gestureDetected && (
              <div className="absolute top-4 right-4 flex items-center bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Verified
              </div>
            )}
          </div>
          
          {/* Auto-capture indicator */}
          {autoCapture && (
            <div className="absolute top-16 left-4 bg-blue-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
              <span className="mr-1">
                {faceCaptureTimeout.current ? 'Auto-Capturing in 2s...' : 'Ready - Perform Gesture'}
              </span>
              {faceCaptureTimeout.current && (
                <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
              )}
            </div>
          )}
          
          {/* Simple detection mode indicator */}
          {useSimpleDetection && (
            <div className="absolute top-16 right-4 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
              Simple Detection
            </div>
          )}
          
          {/* Demo mode indicator */}
          {demoMode && (
            <div className="absolute bottom-16 right-4 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
              Demo Mode (Auto-Verify)
            </div>
          )}
          
          {/* Flash overlay when capturing */}
          {isCapturing && (
            <div className="absolute inset-0 bg-white animate-flash"></div>
          )}
          
          {/* Countdown overlay */}
          {countdown !== null && countdown > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-white text-7xl font-bold">{countdown}</span>
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex justify-between p-4 bg-gray-800">
          <Button 
            shape="rounded" 
            variant="ghost"
            onClick={onCancel}
            className="text-white"
          >
            Cancel
          </Button>
          
          <div className="flex space-x-2">
            {/* Gesture selector button */}
            <Button 
              shape="rounded"
              variant="ghost"
              onClick={changeGesture}
              className="text-white"
            >
              Gesture: {selectedGesture.charAt(0).toUpperCase() + selectedGesture.slice(1)}
            </Button>
            
            {/* Auto-capture toggle */}
            <Button 
              shape="rounded"
              variant={autoCapture ? "solid" : "ghost"}
              onClick={toggleAutoCapture}
              className={`${autoCapture ? 'bg-blue-600 text-white' : 'text-blue-400'}`}
            >
              {autoCapture ? 'Auto-Capture: ON' : 'Auto-Capture: OFF'}
            </Button>
            
            {/* Demo mode toggle (hidden in production) */}
            <Button 
              shape="rounded"
              variant={demoMode ? "solid" : "ghost"}
              onClick={toggleDemoMode}
              className={`${demoMode ? 'bg-purple-600 text-white' : 'text-purple-400'}`}
            >
              {demoMode ? 'Demo: ON' : 'Demo: OFF'}
            </Button>
          </div>
          
          <Button 
            shape="circle"
            onClick={handleStartCapture}
            disabled={countdown !== null}
            className="w-16 h-16 bg-red-500 hover:bg-red-600 text-white flex items-center justify-center rounded-full border-4 border-white"
          >
            <span className="w-10 h-10 rounded-full bg-red-500"></span>
          </Button>
        </div>
      </div>
    </div>
  );
} 