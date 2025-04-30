'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Box, 
  Container, 
  Typography, 
  keyframes, 
  LinearProgress, 
  Paper,
  alpha,
  styled
} from '@mui/material';

// Country flag mapping
const countryFlags: Record<string, string> = {
  pakistan: '/flags/pakistan-flag.svg',
  panama: '/flags/panama-flag.svg',
  costarica: '/flags/costa-rica-flag.svg',
  // Default
  default: '/pak.svg'
};

// Country name mapping
const countryNames: Record<string, string> = {
  pakistan: 'Pakistan',
  panama: 'Panama',
  costarica: 'Costa Rica',
  default: 'Global'
};

// Define animations
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { opacity: 0.8; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 0.8; transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
`;

// Styled components
const GradientBackdrop = styled(Box)(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e163c 100%)',
  zIndex: -2,
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  width: '220px',
  height: '220px',
  position: 'relative',
  marginBottom: '2rem',
  borderRadius: '50%',
}));

const ProgressBar = styled(LinearProgress)(({ theme }) => ({
  width: '240px',
  height: '4px',
  margin: '1.5rem auto',
  borderRadius: '4px',
  backgroundColor: alpha('#ffffff', 0.2),
  '& .MuiLinearProgress-bar': {
    borderRadius: '4px',
    background: `linear-gradient(90deg, #ffffff, ${alpha('#ffffff', 0.7)})`,
  }
}));

const GridLines = styled(Box)(({ theme }) => ({
  position: 'absolute',
  inset: 0,
  backgroundImage: 
    `linear-gradient(to right, ${alpha('#ffffff', 0.1)} 1px, transparent 1px),
    linear-gradient(to bottom, ${alpha('#ffffff', 0.1)} 1px, transparent 1px)`,
  backgroundSize: '40px 40px',
  zIndex: -1,
  opacity: 0.3,
}));

export default function WelcomePage() {
  const router = useRouter();
  const [country, setCountry] = useState<string>('default');
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Check for selected country from localStorage
    if (typeof window !== 'undefined') {
      const selectedCountry = localStorage.getItem('selectedCountry') || 'default';
      setCountry(selectedCountry);
    }
    
    // Animate progress bar to 100% over 5 seconds
    const timer = setInterval(() => {
      setProgress(oldProgress => {
        const newProgress = Math.min(oldProgress + 2, 100);
        return newProgress;
      });
    }, 100);
    
    // Redirect to wallet connection page after 5 seconds
    const redirectTimer = setTimeout(() => {
      router.push('/connect-wallet');
    }, 5000);
    
    return () => {
      clearTimeout(redirectTimer);
      clearInterval(timer);
    };
  }, [router]);
  
  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      color: 'white',
    }}>
      {/* Background */}
      <GradientBackdrop />
      <GridLines />
      
      {/* Flag background */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        zIndex: -1,
        opacity: 0.15,
        animation: `${pulse} 8s infinite ease-in-out`,
      }}>
        <Image 
          src={countryFlags[country] || countryFlags.default}
          alt={`${countryNames[country]} Flag Background`}
          fill
          style={{ objectFit: 'cover' }}
        />
      </Box>
      
      {/* Radial gradient overlay */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle at center, transparent 20%, rgba(0,0,0,0.6) 100%)',
        zIndex: -1,
      }} />
      
      {/* Content */}
      <Container maxWidth="md" sx={{ 
        textAlign: 'center',
        zIndex: 1,
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
      }}>
        <Box sx={{
          animation: `${slideUp} 1s ease-out`,
          width: '100%',
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <LogoContainer>
              <Image 
                src="/ryt-logo-white.svg"
                alt="RYT Logo"
                fill
                style={{ objectFit: 'contain' }}
              />
            </LogoContainer>
            
            <Typography 
              variant="h2" 
              component="h1"
              sx={{
                fontWeight: 800,
                marginBottom: 2,
                animation: `${fadeIn} 1s ease-out`,
                letterSpacing: '0.02em',
                textShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
                fontSize: { xs: '2.5rem', md: '4rem' }
              }}
            >
              Welcome to RYT DID Creation
            </Typography>
            
            <Typography 
              variant="h5"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                marginBottom: 4,
                fontWeight: 300,
                animation: `${fadeIn} 1s ease-out 0.5s both, ${slideUp} 1s ease-out 0.5s both`,
                fontSize: { xs: '1.25rem', md: '1.5rem' }
              }}
            >
              Securing Identity On Chain in <span style={{ color: '#ffffff', fontWeight: 500 }}>{countryNames[country]}</span>
            </Typography>
          </Box>
          
          <Box sx={{
            animation: `${fadeIn} 1s ease-out 1s both, ${slideUp} 1s ease-out 1s both`,
            position: 'relative',
            marginTop: 6,
            display: 'flex',
            justifyContent: 'center',
          }}>
            <Paper elevation={10} sx={{
              padding: '2rem',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              width: { xs: '100%', sm: '400px' },
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '2px',
                background: 'linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))',
                animation: `${shimmer} 3s infinite linear`,
              }
            }}>
              <Typography sx={{ 
                fontWeight: 400, 
                color: '#ffffff', 
                marginBottom: 2,
                fontSize: '1rem',
              }}>
                Redirecting to wallet connection...
              </Typography>
              
              <ProgressBar variant="determinate" value={progress} />
              
              <Typography variant="caption" sx={{ 
                opacity: 0.8,
                display: 'block',
                marginTop: 1,
                color: 'white'
              }}>
                {progress}% complete
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>
      
      {/* Decorative elements */}
      <Box sx={{
        position: 'absolute',
        top: { xs: 20, md: 40 },
        right: { xs: 20, md: 40 },
        width: { xs: 80, md: 120 },
        height: { xs: 80, md: 120 },
        borderRadius: '50%',
        background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.3) 0%, rgba(255, 255, 255, 0) 70%)',
        animation: `${pulse} 4s infinite ease-in-out`,
      }} />
      
      <Box sx={{
        position: 'absolute',
        bottom: { xs: 20, md: 40 },
        left: { xs: 20, md: 40 },
        width: { xs: 100, md: 150 },
        height: { xs: 100, md: 150 },
        borderRadius: '50%',
        background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 70%)',
        animation: `${pulse} 5s infinite ease-in-out`,
      }} />
    </Box>
  );
} 