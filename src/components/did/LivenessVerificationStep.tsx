'use client';

import { useState, useRef, useEffect } from 'react';
import { useDIDContext } from '../../context/DIDContext';

// Material UI imports
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert, 
  Fade, 
  Card,
  CardMedia,
  CardContent,
  Stack,
  IconButton,
  useTheme,
  alpha,
  styled,
  Tooltip,
  Backdrop,
  Divider
} from '@mui/material';
import { 
  CameraAlt as CameraIcon,
  RestartAlt as RetakeIcon,
  FaceRetouchingNatural as FaceIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  SkipNext as SkipNextIcon,
  InfoOutlined as InfoOutlinedIcon
} from '@mui/icons-material';

// Styled components
const CameraContainer = styled(Paper)(({ theme }) => ({
  width: 320,
  height: 240,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 15px 30px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
  },
}));

const PlaceholderContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  color: theme.palette.text.secondary,
}));

const CapturedImage = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: 320,
  height: 240,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
  border: `2px solid ${theme.palette.primary.main}`,
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  }
}));

const RetakeButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: alpha(theme.palette.common.black, 0.7),
  color: theme.palette.common.white,
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.black, 0.9),
  },
}));

const PulsingCircle = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  backgroundColor: alpha(theme.palette.primary.main, 0.2),
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: `2px solid ${theme.palette.primary.main}`,
    animation: 'pulse 2s infinite',
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(0.95)',
      boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.7)}`,
    },
    '70%': {
      transform: 'scale(1)',
      boxShadow: `0 0 0 10px ${alpha(theme.palette.primary.main, 0)}`,
    },
    '100%': {
      transform: 'scale(0.95)',
      boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}`,
    },
  },
}));

// Add a new styled component for the skip button
const SkipButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius * 4,
  backgroundColor: 'transparent',
  color: theme.palette.grey[600],
  border: `1px solid ${theme.palette.grey[300]}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.grey[500], 0.1),
    borderColor: theme.palette.grey[400],
  },
}));

export default function LivenessVerificationStep() {
  const { state, updateDIDData, markStepAsCompleted, skipIDVerification } = useDIDContext();
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(state.didData.livenessImage || null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();

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
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const startVerification = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" },
        audio: false 
      });
      setCameraStream(stream);
      setShowCamera(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Could not access camera. Please make sure you have granted camera permissions.');
    }
  };

  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setShowCamera(false);
    
    // Store the image in the DID context
    updateDIDData({
      livenessImage: imageSrc,
      livenessVerified: true,
      livenessTimestamp: new Date().toISOString()
    });
    
    // Simulate uploading and verification
    simulateVerification();
  };

  const handleCancelCapture = () => {
    setShowCamera(false);
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    // Clear the liveness data in the context
    updateDIDData({
      livenessImage: null,
      livenessVerified: false,
      livenessTimestamp: null
    });
    startVerification();
  };

  const simulateVerification = () => {
    setIsUploading(true);
    
    // Simulate API call for verification
    setTimeout(() => {
      setIsUploading(false);
      
      // Mark this step as completed
      markStepAsCompleted(true);
    }, 2000);
  };

  return (
    <Box sx={{ py: 3 }}>
      <Stack spacing={4} alignItems="center">
        <Typography 
          variant="h6" 
          align="center" 
          color="text.secondary"
          sx={{ maxWidth: 500, mx: 'auto', mb: 2 }}
        >
          We need to verify that you're a real person. Please look at the camera and follow the instructions.
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
          {capturedImage ? (
            <Fade in={!!capturedImage}>
              <CapturedImage>
                <img 
                  src={capturedImage} 
                  alt="Captured"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <RetakeButton
                  size="small"
                  onClick={handleRetake}
                  aria-label="Retake photo"
                >
                  <RetakeIcon fontSize="small" />
                </RetakeButton>
              </CapturedImage>
            </Fade>
          ) : (
            <CameraContainer elevation={3}>
              {showCamera ? (
                <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transform: 'scaleX(-1)' // Mirror effect for selfie mode
                    }}
                  />
                </Box>
              ) : (
                <PlaceholderContainer>
                  <PulsingCircle>
                    <FaceIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                  </PulsingCircle>
                  <Typography variant="caption" sx={{ mt: 2 }}>
                    Camera feed will appear here
                  </Typography>
                </PlaceholderContainer>
              )}
            </CameraContainer>
          )}
          
          {error && (
            <Alert 
              severity="error" 
              variant="filled" 
              sx={{ maxWidth: 320 }}
            >
              {error}
            </Alert>
          )}
          
          {!showCamera && !capturedImage && !isUploading && (
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<CameraIcon />}
              onClick={startVerification}
              sx={{ 
                mt: 2,
                minWidth: 200,
                py: 1.5,
              }}
            >
              Start Verification
            </Button>
          )}
          
          {/* Skip Verification option */}
          {!showCamera && !capturedImage && !isUploading && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3 }}>
              <Divider sx={{ width: '80%', mb: 3 }}>
                <Typography variant="caption" color="text.secondary">OR</Typography>
              </Divider>
              
              <Stack direction="column" spacing={1} alignItems="center">
                <Tooltip 
                  title="Skip liveness verification and use demo data. Your verification score will be lower." 
                  arrow
                  placement="top"
                >
                  <SkipButton
                    onClick={skipIDVerification}
                    startIcon={<SkipNextIcon />}
                    endIcon={<InfoOutlinedIcon fontSize="small" />}
                    size="large"
                  >
                    Skip Liveness Verification
                  </SkipButton>
                </Tooltip>
                <Typography variant="caption" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
                  Note: Skipping verification will result in a lower security score 
                  and will use demo data instead of your real information.
                </Typography>
              </Stack>
            </Box>
          )}
        </Box>
      </Stack>

      {/* Camera Capture UI */}
      {showCamera && (
        <Box 
          sx={{ 
            position: 'fixed',
            bottom: 16, 
            left: '50%', 
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 2,
            zIndex: 10,
          }}
        >
          <Tooltip title="Capture">
            <Button
              color="primary"
              variant="contained"
              onClick={() => {
                if (!canvasRef.current || !videoRef.current) return;
                
                const video = videoRef.current;
                const canvas = canvasRef.current;
                
                // Set canvas dimensions to match video
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                // Draw video frame to canvas
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Get image data URL
                const imageSrc = canvas.toDataURL('image/png');
                handleCapture(imageSrc);
              }}
              sx={{ 
                borderRadius: '50%', 
                minWidth: 'auto',
                width: 56,
                height: 56,
              }}
            >
              <CheckIcon />
            </Button>
          </Tooltip>
          
          <Tooltip title="Cancel">
            <Button
              color="error"
              variant="outlined"
              onClick={handleCancelCapture}
              sx={{ 
                borderRadius: '50%', 
                minWidth: 'auto',
                width: 56,
                height: 56,
              }}
            >
              <CancelIcon />
            </Button>
          </Tooltip>
        </Box>
      )}
      
      {/* Hidden elements for capture */}
      <Box sx={{ display: 'none' }}>
        <canvas ref={canvasRef} />
      </Box>
      
      {/* Loading backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: theme => theme.zIndex.drawer + 1 }}
        open={isUploading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress color="inherit" />
          <Typography>Verifying your identity...</Typography>
        </Box>
      </Backdrop>
    </Box>
  );
} 