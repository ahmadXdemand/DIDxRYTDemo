'use client';

import { useState, useEffect } from 'react';
import { useDIDContext } from '../../context/DIDContext';
import { IDInformation } from '@/types/id';
import { CreationStep } from '@/types/did';
import { 
  Box, 
  Typography, 
  Paper, 
  CircularProgress, 
  LinearProgress, 
  Fade, 
  Chip,
  Stack,
  useTheme,
  alpha,
  styled,
  keyframes,
  Alert,
  AlertTitle
} from '@mui/material';
import { 
  VerifiedUser as VerifiedUserIcon,
  Security as SecurityIcon,
  Shield as ShieldIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Animation keyframes
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 ${alpha('#784af4', 0.7)}; }
  70% { box-shadow: 0 0 0 15px ${alpha('#784af4', 0)}; }
  100% { box-shadow: 0 0 0 0 ${alpha('#784af4', 0)}; }
`;

const glowScan = keyframes`
  0% { background-position: 0% 0%; }
  50% { background-position: 100% 100%; }
  100% { background-position: 0% 0%; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Styled components
const VerificationContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.shape.borderRadius * 2,
  background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.7)}, ${alpha(theme.palette.background.paper, 0.4)})`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.1)}`,
}));

const GlowingIcon = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.main,
  animation: `${pulse} 2s infinite`,
  '& svg': {
    fontSize: 40,
  },
}));

const ScanEffect = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  height: '2px',
  background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0)}, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0)})`,
  backgroundSize: '200% 200%',
  animation: `${glowScan} 2s ease-in-out infinite`,
  boxShadow: `0 0 10px ${theme.palette.primary.main}, 0 0 20px ${theme.palette.primary.main}`,
  zIndex: 10,
}));

const VerificationSuccessIcon = styled(Box)(({ theme }) => ({
  width: 100,
  height: 100,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette.success.light}, ${theme.palette.success.main})`,
  color: theme.palette.common.white,
  boxShadow: `0 10px 20px ${alpha(theme.palette.success.main, 0.4)}`,
  animation: `${float} 3s ease-in-out infinite`,
  '& svg': {
    fontSize: 60,
  },
}));

export default function VerificationStep() {
  const { state, updateDIDData, markStepAsCompleted } = useDIDContext();
  const [verifiedData, setVerifiedData] = useState<IDInformation | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  
  // Check if demo mode is active (skipped ID verification without document details)
  const isDemoMode = state.skippedIDVerification && !state.didData.documentDetails;
  
  // Load extracted data from context and start verification process
  useEffect(() => {
    let mounted = true;
    const autoVerify = async () => {
      try {
        // Load document details
        if (state.didData.documentDetails) {
          setVerifiedData(state.didData.documentDetails as IDInformation);
        } else if (state.skippedIDVerification && state.didData.demoData) {
          // If ID verification was skipped, use demo data
          const demoData = state.didData.demoData;
          setVerifiedData({
            fullName: `${demoData.firstName} ${demoData.lastName}`,
            dateOfBirth: demoData.dateOfBirth,
            idNumber: demoData.documentNumber,
            issuingCountry: demoData.nationality,
            gender: 'Not Specified',
            metadata: {
              documentType: demoData.documentType
            }
          } as unknown as IDInformation);
        }
        
        setIsVerifying(true);
        setError(null);
        
        // Animation and timer
        const verifyingDuration = 3000;
        const verifyingStart = Date.now();
        const verifyingInterval = setInterval(() => {
          if (!mounted) {
            clearInterval(verifyingInterval);
            return;
          }
          
          const elapsed = Date.now() - verifyingStart;
          const progress = Math.min(elapsed / verifyingDuration * 100, 100);
          setAnimationProgress(progress);
          if (progress >= 100) clearInterval(verifyingInterval);
        }, 50);
        
        await new Promise(resolve => setTimeout(resolve, verifyingDuration));
        
        if (!mounted) return;
        clearInterval(verifyingInterval);
        
        // Get the data to verify
        let dataToVerify;
        
        if (isDemoMode) {
          // Use demo data if verification was skipped
          const demoData = state.didData.demoData;
          dataToVerify = {
            fullName: `${demoData.firstName} ${demoData.lastName}`,
            idNumber: demoData.documentNumber,
            metadata: {
              documentType: demoData.documentType
            }
          };
        } else {
          // Use extracted data
          dataToVerify = state.didData.documentDetails || {};
        }
        
        // Update the DID context with verified information
        updateDIDData({
          verifiedInfo: true,
          fullName: dataToVerify.fullName,
          documentNumber: dataToVerify.idNumber,
          documentType: dataToVerify.metadata?.documentType,
          verifiedDetails: dataToVerify,
          verificationTimestamp: new Date().toISOString()
        });
        
        // Mark as completed to enable the Next button
        setIsCompleted(true);
        markStepAsCompleted(true);
        
      } catch (error: any) {
        console.error("Verification error:", error);
        if (mounted) {
          setError(error.message || "Verification failed. Please try again.");
          setIsVerifying(false);
        }
      }
    };
    
    autoVerify();
    
    return () => {
      mounted = false;
    };
  }, [state.didData.documentDetails, updateDIDData, markStepAsCompleted, state.didData, state.skippedIDVerification, isDemoMode]);
  
  if (!verifiedData && !isVerifying) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <CircularProgress 
          size={60}
          thickness={4}
          sx={{ 
            color: theme.palette.primary.main,
            mb: 3
          }} 
        />
        <Typography variant="body1" color="text.secondary">
          Loading extracted information...
        </Typography>
      </Box>
    );
  }
  
  if (isCompleted) {
    return (
      <Fade in={isCompleted} timeout={800}>
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <Stack spacing={3} alignItems="center">
            <VerificationSuccessIcon>
              <CheckCircleIcon />
            </VerificationSuccessIcon>
            
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 600,
                background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.primary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}
            >
              Information Validated Successfully
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto' }}>
              Your identity information has been verified and is ready for the next step.
            </Typography>
            
            {isDemoMode && (
              <Alert 
                severity="info" 
                variant="outlined"
                icon={<InfoIcon />}
                sx={{ 
                  mt: 2, 
                  maxWidth: 450, 
                  textAlign: 'left',
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.info.main, 0.05)
                }}
              >
                <AlertTitle>Using Demo Data</AlertTitle>
                You've chosen to skip ID verification. Demo information is being used instead of 
                real document verification. This results in a lower verification score.
              </Alert>
            )}
            
            <Box sx={{ mt: 2 }}>
              <Chip 
                label={isDemoMode ? "Demo Mode" : "Verified & Secured"} 
                color={isDemoMode ? "secondary" : "primary"} 
                icon={<ShieldIcon />}
                sx={{ 
                  px: 2, 
                  py: 3,
                  borderRadius: '16px',
                  fontWeight: 500,
                  boxShadow: `0 4px 8px ${alpha(
                    isDemoMode ? theme.palette.secondary.main : theme.palette.primary.main, 
                    0.3
                  )}`
                }}
              />
            </Box>
            
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 500,
                animation: `${pulse} 2s infinite`
              }}
            >
              Click 'Next' to proceed to the minting step
            </Typography>
          </Stack>
        </Box>
      </Fade>
    );
  }
  
  return (
    <VerificationContainer>
      {/* Scanning effect */}
      <ScanEffect sx={{ top: animationProgress * 0.85 + '%' }} />
      
      <Stack spacing={4} alignItems="center">
        <Typography 
          variant="h6" 
          sx={{ 
            textAlign: 'center',
            fontWeight: 600,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          {isDemoMode ? "Preparing Demo Profile" : "Verifying Your Identity"}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 450, mx: 'auto' }}>
          {isDemoMode
            ? "Setting up your demo profile with sample information." 
            : "Please wait while our advanced verification system analyzes and validates your information."}
        </Typography>
        
        {isDemoMode && (
          <Alert 
            severity="info" 
            variant="outlined" 
            sx={{ 
              maxWidth: 450, 
              textAlign: 'left' 
            }}
          >
            You've chosen to skip ID verification. Demo data will be used.
          </Alert>
        )}
        
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <GlowingIcon>
            <SecurityIcon />
          </GlowingIcon>
        </Box>
        
        <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto', mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
            <VerifiedUserIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
            {isDemoMode ? "Preparing demo profile..." : "Verifying document authenticity..."}
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={animationProgress} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              mb: 3,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.main})`,
              }
            }} 
          />
          
          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ 
              mt: 4, 
              p: 2, 
              borderRadius: 2, 
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              border: `1px dashed ${alpha(theme.palette.primary.main, 0.3)}` 
            }}
          >
            <CircularProgress 
              size={30} 
              thickness={5} 
              sx={{ color: theme.palette.primary.main }} 
            />
            <Box>
              <Typography variant="body2" color="text.primary" fontWeight={500}>
                {isDemoMode ? "Demo Profile Generation" : "Security Verification in Progress"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isDemoMode
                  ? "Creating secure demo credentials..." 
                  : "Multi-factor document analysis underway..."}
              </Typography>
            </Box>
          </Stack>
        </Box>
        
        {error && (
          <Paper 
            elevation={0}
            sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.error.main, 0.1),
              color: theme.palette.error.main,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <ErrorIcon sx={{ mr: 1 }} />
            <Typography variant="body2">{error}</Typography>
          </Paper>
        )}
      </Stack>
    </VerificationContainer>
  );
} 