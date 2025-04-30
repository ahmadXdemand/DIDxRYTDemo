import React, { useState } from 'react';
import { 
  Box, 
  Typography,
  Button,
  alpha,
  styled,
  Paper,
  CircularProgress
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ReCAPTCHA from "react-google-recaptcha";
import { CreationStep } from '@/types/did';
import { useDIDContext } from '../../context/DIDContext';

// Styled components
const ContinueButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#5e35b1', // Purple theme color
  color: 'white',
  padding: '12px 32px',
  borderRadius: '32px',
  fontSize: '1.1rem',
  fontWeight: 600,
  letterSpacing: '0.5px',
  textTransform: 'none',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s ease',
  boxShadow: '0 10px 20px rgba(94, 53, 177, 0.3)',
  '&:hover': {
    backgroundColor: '#4527a0',
    transform: 'translateY(-3px)',
    boxShadow: '0 15px 30px rgba(94, 53, 177, 0.4)',
  },
  '&:disabled': {
    backgroundColor: alpha('#5e35b1', 0.5),
    color: alpha('#ffffff', 0.7),
  }
}));

const SecurityContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2rem',
  borderRadius: '16px',
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  maxWidth: '600px',
  margin: '0 auto',
}));

interface RecaptchaStepProps {
  onComplete: () => void;
  isLoading?: boolean;
}

const RecaptchaStep: React.FC<RecaptchaStepProps> = ({ onComplete, isLoading = false }) => {
  const [captchaVerified, setCaptchaVerified] = useState<boolean>(false);
  const { updateVerificationScore } = useDIDContext();

  const handleCaptchaVerification = (value: string | null) => {
    if (value) {
      setCaptchaVerified(true);
      // Set verification score to 15 for recaptcha completion
      updateVerificationScore(15);
      // Update context by calling onComplete automatically
      onComplete();
    }
  };

  return (
    <SecurityContainer>
      <Box sx={{ 
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: `radial-gradient(circle at center, ${alpha('#5e35b1', 1)} 0%, ${alpha('#5e35b1', 0.1)} 90%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 3,
      }}>
        <SecurityIcon sx={{ fontSize: 60, color: '#fff' }} />
      </Box>
      
      <Typography 
        variant="h4" 
        component="h2" 
        sx={{ 
          fontWeight: 700, 
          marginBottom: 1,
          color: '#5e35b1',
          textAlign: 'center'
        }}
      >
        Security Verification
      </Typography>
      
      <Typography 
        variant="body1" 
        sx={{ 
          color: alpha('#5e35b1', 0.9),
          textAlign: 'center',
          marginBottom: 4,
          maxWidth: '450px'
        }}
      >
        Please complete the security check below to proceed with your DID creation
      </Typography>
      
      <Paper elevation={4} sx={{ 
        background: alpha('#5e35b1', 0.1), 
        padding: 3, 
        borderRadius: 3,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        marginBottom: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        <Box sx={{ marginBottom: 2 }}>
          <ReCAPTCHA
            sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Replace with your actual site key
            onChange={handleCaptchaVerification}
            theme="dark"
          />
        </Box>
      </Paper>
      
      {captchaVerified && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          marginBottom: 3,
          color: '#8bff8a',
          fontWeight: 500
        }}>
          <VerifiedUserIcon />
          <Typography>Verification successful! Please use the Next button to continue.</Typography>
        </Box>
      )}
      
      {/* <ContinueButton
        variant="contained"
        onClick={onComplete}
        disabled={!captchaVerified || isLoading}
        startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <SecurityIcon />}
        sx={{ minWidth: '220px' }}
      >
        {isLoading ? 'Processing...' : 'Continue'}
      </ContinueButton> */}
    </SecurityContainer>
  );
};

export default RecaptchaStep; 