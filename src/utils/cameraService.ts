/**
 * Starts the camera with basic video access
 */
export const startCameraStream = async (): Promise<MediaStream> => {
  console.log("Starting camera...");
  
  try {
    // Try with simpler camera configuration first
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: true // Request basic video permissions without specifying cameras
    });
    
    console.log("Camera access granted");
    return stream;
  } catch (error) {
    console.error("Error accessing camera:", error);
    
    if (error instanceof DOMException) {
      if (error.name === 'NotAllowedError') {
        throw new Error("Camera access was denied. Please allow camera access in your browser permissions.");
      } else if (error.name === 'NotFoundError') {
        throw new Error("No camera found on your device.");
      } else if (error.name === 'NotReadableError') {
        throw new Error("Your camera is in use by another application.");
      } else {
        throw new Error(`Camera error: ${error.name}`);
      }
    }
    
    throw new Error("Could not access camera. Please check your browser permissions.");
  }
};

/**
 * Stops all tracks in a media stream
 */
export const stopCameraStream = (stream: MediaStream | null): void => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
};

/**
 * Captures an image from a video element onto a canvas and returns a File
 */
export const captureImageFromVideo = (
  videoElement: HTMLVideoElement, 
  canvasElement: HTMLCanvasElement
): Promise<File> => {
  return new Promise((resolve, reject) => {
    try {
      console.log("Capturing image from camera...");
      
      // Set canvas size to match video
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      
      // Draw video frame to canvas
      const context = canvasElement.getContext('2d');
      if (!context) {
        reject(new Error("Failed to get canvas context"));
        return;
      }
      
      context.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
      console.log("Image drawn to canvas");
      
      // Convert canvas to blob and create File
      canvasElement.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob from canvas"));
          return;
        }
        
        console.log("Image blob created successfully", blob.size);
        
        // Create a file from the blob
        const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
        resolve(file);
      }, "image/jpeg", 0.95);
    } catch (error) {
      console.error("Error capturing image:", error);
      reject(error);
    }
  });
}; 