'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ethers } from 'ethers';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress, 
  Chip,
  keyframes,
  alpha,
  styled
} from '@mui/material';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NetworkWifiIcon from '@mui/icons-material/NetworkWifi';

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

// Add window.ethereum type declaration
declare global {
  interface Window {
    ethereum: any;
  }
}

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

const rotateGradient = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

const WalletButton = styled(Button)(({ theme }) => ({
  backgroundColor: alpha('#ffffff', 0.2),
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
  boxShadow: '0 10px 20px rgba(255, 255, 255, 0.15)',
  '&:hover': {
    backgroundColor: alpha('#ffffff', 0.3),
    transform: 'translateY(-3px)',
    boxShadow: '0 15px 30px rgba(255, 255, 255, 0.2)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-50%',
    left: '-50%',
    width: '200%',
    height: '200%',
    background: `conic-gradient(
      transparent, 
      transparent, 
      transparent, 
      ${alpha('#ffffff', 0.4)}
    )`,
    animation: `${rotateGradient} 4s linear infinite`,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: '3px',
    borderRadius: '30px',
    background: alpha('#000000', 0.2),
    zIndex: -1,
  },
}));

const AddressChip = styled(Chip)(({ theme }) => ({
  backgroundColor: alpha('#ffffff', 0.1),
  color: 'white',
  borderRadius: '16px',
  fontFamily: 'monospace',
  fontWeight: 600,
  border: `1px solid ${alpha('#ffffff', 0.3)}`,
  boxShadow: `0 0 15px ${alpha('#ffffff', 0.15)}`,
  '& .MuiChip-icon': {
    color: '#8bff8a',
  }
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  width: '240px',
  height: '4px',
  margin: '1.5rem auto',
  borderRadius: '4px',
  background: alpha('#ffffff', 0.1),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '30%',
    background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.7)}, transparent)`,
    animation: `${shimmer} 1.5s infinite ease-in-out`,
  }
}));

// Main component
export default function ConnectWalletPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [country, setCountry] = useState<string>('default');
  const [loadingWallet, setLoadingWallet] = useState<boolean>(false);
  const [redirecting, setRedirecting] = useState<boolean>(false);
  const router = useRouter();
  
  // Check for selected country from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const selectedCountry = localStorage.getItem('selectedCountry') || 'default';
      setCountry(selectedCountry);
    }
  }, []);
  
  // Check if wallet is already connected on page load
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          // Check if already connected
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            setAccount(accounts[0]);
            setRedirecting(true);
            // Redirect to createDID page after a short delay
            setTimeout(() => {
              router.push('/createDID');
            }, 1500);
          }
        } catch (err) {
          console.error("Error checking wallet connection:", err);
        } finally {
          setIsChecking(false);
        }
      } else {
        setIsChecking(false);
      }
    };
    
    checkWalletConnection();
  }, [router]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoadingWallet(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []); // Popup MetaMask
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        setLoadingWallet(false);
        setRedirecting(true);
        
        // Redirect to createDID page after successful connection
        setTimeout(() => {
          router.push('/createDID');
        }, 1500);
      } catch (err) {
        console.error("User denied wallet connection", err);
        setLoadingWallet(false);
      }
    } else {
      alert("MetaMask not detected. Install the extension first.");
    }
  };
  
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

      {/* Network lines animation */}
      <Box sx={{
        position: 'absolute',
        inset: 0,
        background: 'url(/assets/network-lines.svg)',
        backgroundSize: 'cover',
        opacity: 0.07,
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
              Connect Your Wallet
            </Typography>
            
            <Typography 
              variant="h5"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                marginBottom: 6,
                fontWeight: 300,
                maxWidth: '650px',
                mx: 'auto',
                animation: `${fadeIn} 1s ease-out 0.5s both, ${slideUp} 1s ease-out 0.5s both`,
                fontSize: { xs: '1.25rem', md: '1.5rem' }
              }}
            >
              To begin the DID creation process in <span style={{ color: '#ffffff', fontWeight: 500 }}>{countryNames[country]}</span>, please connect your wallet
            </Typography>
          </Box>
          
          <Box sx={{
            animation: `${fadeIn} 1s ease-out 1s both, ${slideUp} 1s ease-out 1s both`,
            marginTop: 4,
            display: 'flex',
            justifyContent: 'center',
          }}>
            <Paper elevation={10} sx={{
              padding: '2.5rem',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              width: { xs: '90%', sm: '450px' },
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))',
                animation: `${shimmer} 3s infinite linear`,
              }
            }}>
              {isChecking ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: 2
                }}>
                  <CircularProgress 
                    size={60} 
                    thickness={4}
                    sx={{ 
                      color: '#ffffff',
                      marginBottom: 2,
                    }}
                  />
                  <Typography 
                    variant="body1"
                    sx={{ 
                      color: alpha('#fff', 0.9),
                      fontWeight: 500,
                      marginTop: 2,
                    }}
                  >
                    Checking wallet connection...
                  </Typography>
                  <Box sx={{
                    mt: 3,
                    position: 'relative',
                    width: '100%',
                    height: '3px',
                    background: alpha('#ffffff', 0.1),
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        height: '100%',
                        width: '30%',
                        borderRadius: '4px',
                        background: `linear-gradient(90deg, transparent, ${alpha('#ffffff', 0.9)}, transparent)`,
                        animation: `${shimmer} 1.5s infinite`,
                      }}
                    />
                  </Box>
                </Box>
              ) : !account ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{
                    width: '100px',
                    height: '100px',
                    margin: '0 auto 24px',
                    borderRadius: '50%',
                    backgroundColor: alpha('#ffffff', 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: `${pulse} 3s infinite`,
                  }}>
                    <AccountBalanceWalletOutlinedIcon 
                      sx={{ 
                        fontSize: '50px', 
                        color: '#ffffff' 
                      }} 
                    />
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: 'white',
                      marginBottom: 3,
                      fontWeight: 500,
                    }}
                  >
                    Connect to start your DID journey
                  </Typography>
                  
                  <WalletButton 
                    variant="contained"
                    onClick={connectWallet}
                    disabled={loadingWallet}
                    startIcon={
                      loadingWallet ? (
                        <CircularProgress size={20} sx={{ color: 'white' }} />
                      ) : (
                        <NetworkWifiIcon />
                      )
                    }
                    sx={{ 
                      minWidth: '220px', 
                      opacity: loadingWallet ? 0.8 : 1
                    }}
                  >
                    {loadingWallet ? 'Connecting...' : 'Connect RYT Wallet'}
                  </WalletButton>
                </Box>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 2 
                }}>
                  <Box 
                    sx={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      background: `radial-gradient(circle at center, ${alpha('#ffffff', 0.6)} 0%, ${alpha('#ffffff', 0.1)} 70%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 2,
                      animation: `${pulse} 2s infinite`,
                    }}
                  >
                    <CheckCircleOutlineIcon sx={{ fontSize: 60, color: '#8bff8a' }} />
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 500,
                      color: '#8bff8a',
                      marginBottom: 2,
                    }}
                  >
                    Wallet Connected
                  </Typography>
                  
                  <AddressChip
                    icon={<CheckCircleOutlineIcon />}
                    label={`${account.slice(0, 6)}...${account.slice(-4)}`}
                    sx={{ 
                      marginBottom: 4,
                      fontSize: '1rem',
                      py: 1.5,
                      px: 2,
                    }}
                  />
                  
                  <Typography sx={{ color: alpha('#fff', 0.8) }}>
                    Redirecting to DID creation...
                  </Typography>
                  
                  <ProgressContainer />
                </Box>
              )}
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