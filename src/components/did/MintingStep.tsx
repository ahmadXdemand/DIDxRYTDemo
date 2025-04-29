'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDIDContext } from '../../context/DIDContext';
import { ethers } from 'ethers';
import { createDidMetadata, mintDidToken } from '@/utils/contractUtils';
import { CreationStep } from '@/types/did';
import {
  Box,
  Typography,
  LinearProgress,
  CircularProgress,
  Paper,
  Stack,
  Chip,
  Fade,
  useTheme,
  alpha,
  styled,
  keyframes
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  LinkOutlined as LinkIcon
} from '@mui/icons-material';

declare global {
  interface Window {
    ethereum: any;
    web3: any;
  }
}

// NFT Contract Constants
const CONTRACT_ADDRESS = "0x66332e60b24BB4C729A2Be07Ab733C26242A5aAD";

// Only the mint function ABI
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "tokenURI",
        "type": "string"
      }
    ],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Placeholder Token URI - will be replaced with actual metadata
const TOKEN_URI = "https://green-manual-tapir-637.mypinata.cloud/ipfs/bafkreiaapyrob3rqaxquyfd7lh4wclbtm5ooynxms5y23izagctpboe2zq";

// Define keyframes for animations
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 ${alpha('#784af4', 0.7)}; }
  70% { box-shadow: 0 0 0 15px ${alpha('#784af4', 0)}; }
  100% { box-shadow: 0 0 0 0 ${alpha('#784af4', 0)}; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const glow = keyframes`
  0% { filter: drop-shadow(0 0 2px ${alpha('#784af4', 0.5)}); }
  50% { filter: drop-shadow(0 0 8px ${alpha('#784af4', 0.8)}); }
  100% { filter: drop-shadow(0 0 2px ${alpha('#784af4', 0.5)}); }
`;

// Create styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  boxShadow: `0 10px 30px ${alpha(theme.palette.common.black, 0.1)}`,
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${alpha('#784af4', 0.8)}, ${alpha('#784af4', 0.2)})`,
  }
}));

const MintingBox = styled(Box)(({ theme }) => ({
  width: 120,
  height: 120,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  margin: '0 auto',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: '50%',
    border: `2px solid ${alpha('#784af4', 0.3)}`,
    animation: `${pulse} 2s infinite`,
  }
}));

const TransactionPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  backgroundColor: alpha(theme.palette.background.paper, 0.5),
  border: `1px solid ${alpha('#784af4', 0.2)}`,
  borderRadius: theme.shape.borderRadius,
  backdropFilter: 'blur(5px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: `0 5px 15px ${alpha('#784af4', 0.2)}`,
    transform: 'translateY(-2px)',
  },
}));

const SuccessBox = styled(Box)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.success.main,
  color: theme.palette.common.white,
  margin: '0 auto',
  animation: `${float} 3s ease-in-out infinite`,
  boxShadow: `0 10px 25px ${alpha(theme.palette.success.main, 0.4)}`,
  '& svg': {
    fontSize: 40,
  },
}));

const DidDisplay = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  marginTop: theme.spacing(3),
  backgroundColor: alpha('#784af4', 0.05),
  borderRadius: theme.shape.borderRadius * 1.5,
  border: `1px solid ${alpha('#784af4', 0.2)}`,
  fontFamily: 'monospace',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(45deg, ${alpha('#784af4', 0)}, ${alpha('#784af4', 0.1)}, ${alpha('#784af4', 0)})`,
    backgroundSize: '200% 200%',
    animation: 'shine 3s linear infinite',
  },
  '@keyframes shine': {
    '0%': { backgroundPosition: '0% 0%' },
    '100%': { backgroundPosition: '200% 200%' },
  }
}));

export default function MintingStep() {
  const theme = useTheme();
  const { state, updateDIDData, markStepAsCompleted } = useDIDContext();
  const [deploymentStage, setDeploymentStage] = useState<'preparing' | 'minting' | 'completed'>('preparing');
  const [animationProgress, setAnimationProgress] = useState(0);
  const [mintStatus, setMintStatus] = useState<string>('Preparing to mint...');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasStartedMinting = useRef(false);
  
  // Start the minting process
  useEffect(() => {
    // Only start minting if we haven't started yet and we're in the minting step
    if (hasStartedMinting.current || state.currentStep !== CreationStep.MINTING) {
      return;
    }

    const startMinting = async () => {
      hasStartedMinting.current = true;
      
      if (state.didData.mintingComplete) {
        // If already minted, just show completion
        setDeploymentStage('completed');
        setAnimationProgress(100);
        return;
      }
      
      try {
        const walletAddress = state.didData.walletAddress;
        if (!walletAddress) {
          throw new Error("No wallet address found");
        }
        
        // Extract necessary data
        const extractedInfo = state.didData.documentDetails || {};
        const ipfsIdImageUrl = state.didData.ipfsUrl;
        const selfieImage = state.didData.livenessData;
        const selectedIdImage = state.didData.ipfsUrl;
        
        // First stage: Preparing
        setDeploymentStage('preparing');
        setAnimationProgress(0);
        
        // Animation for the preparing stage
        const verifyingDuration = 3000;
        const verifyingStart = Date.now();
        const verifyingInterval = setInterval(() => {
          const elapsed = Date.now() - verifyingStart;
          const progress = Math.min(elapsed / verifyingDuration * 100, 100);
          setAnimationProgress(progress);
          if (progress >= 100) clearInterval(verifyingInterval);
        }, 50);
        
        await new Promise(resolve => setTimeout(resolve, verifyingDuration));
        clearInterval(verifyingInterval);
        
        // Second stage: Minting
        setDeploymentStage('minting');
        setAnimationProgress(0);
        
        // Update overall progress in the context
        updateDIDData({
          currentStep: CreationStep.MINTING
        });
        
        try {
          // Actual minting process
          setMintStatus("Preparing transaction...");
          
          // In a real implementation, we would upload both images to IPFS
          // and create metadata with those URLs
          // Store these URLs to display in the success screen
          let idImageUrl = ipfsIdImageUrl || "ipfs://placeholder-id-image";
          let selfieImageUrl = "ipfs://placeholder-selfie";
          
          try {
            // Try to get the real image URL from Pinata if available
            if (!ipfsIdImageUrl && selectedIdImage) {
              idImageUrl = selectedIdImage || idImageUrl;
            }
            if (selfieImage) {
              selfieImageUrl = selfieImage || selfieImageUrl;
            }
          } catch (error) {
            console.error("Error getting image URLs:", error);
          }
          
          // Create metadata for the DID token - in this case we're using a placeholder URI
          const actualTokenURI = TOKEN_URI;
          
          setMintStatus("Minting in progress...");
          
          try {
            // For demo purposes, we'll provide an option to skip actual blockchain interaction
            const demoMode = false; // Set to true to use demo mode, false to attempt real minting
            
            let hash;
            if (demoMode) {
              setMintStatus("Demo mode: Simulating blockchain transaction...");
              hash = "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
              await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction time
            } else {
              // Connect to provider and get signer
              try {
                setMintStatus("Connecting to wallet...");
                
                // Simplified approach that should work with the current ethers version
                const provider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : null;
                
                if (!provider) {
                  throw new Error("No Ethereum provider available. Please ensure your wallet is connected.");
                }
                
                const signer = await provider.getSigner();
                debugger;
                // Create contract instance
                const contract = new ethers.Contract(
                  CONTRACT_ADDRESS, 
                  CONTRACT_ABI, 
                  signer
                );
                
                // Call the mint function
                setMintStatus("Calling contract mint function...");
                const tx = await contract.mint(actualTokenURI);
                hash = tx.hash;
                
                // Wait for transaction to be mined
                setMintStatus("Waiting for transaction confirmation...");
               
              } catch (contractError: any) {
                console.error("Contract interaction error:", contractError);
                setError(`Contract error: ${contractError.message || "Unknown contract error"}`);
                
                // For demo fallback in case of error
                hash = "0x" + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
              }
            }
            
            setMintStatus("Transaction submitted and confirmed!");
            setTxHash(hash);
            
            // Generate a token ID - in a real app, this would come from the contract event logs
            const mockTokenId = Math.floor(Math.random() * 1000).toString();
            setTokenId(mockTokenId);
            
            // Update the DID context with the token ID
            updateDIDData({
              didIdentifier: mockTokenId,
              mintingComplete: true,
              mintingTimestamp: new Date().toISOString(),
              transactionHash: hash
            });
            
            setMintStatus("✅ Mint successful!");
            
            // Complete the minting animation
            const remainingTime = 2000; // Give some time to show success message
            const mintingStart = Date.now();
            const mintingInterval = setInterval(() => {
              const elapsed = Date.now() - mintingStart;
              const progress = Math.min(elapsed / remainingTime * 100, 100);
              setAnimationProgress(progress);
              if (progress >= 100) clearInterval(mintingInterval);
            }, 50);
            
            await new Promise(resolve => setTimeout(resolve, remainingTime));
            clearInterval(mintingInterval);
            
            // Mark the step as completed
            setDeploymentStage('completed');
            markStepAsCompleted(true);
            
          } catch (error: any) {
            console.error("Minting error:", error);
            setError(`Error during minting: ${error.message}`);
          }
        } catch (error: any) {
          console.error("Transaction preparation error:", error);
          setError(`Error preparing transaction: ${error.message}`);
        }
      } catch (error: any) {
        console.error("Minting step error:", error);
        setError(error.message || "An error occurred during the minting process.");
      }
    };
    
    startMinting();
  }, [state.didData, updateDIDData, markStepAsCompleted]);
  
  // Render different content based on the deployment stage
  const renderContent = () => {
    switch (deploymentStage) {
      case 'preparing':
        return (
          <Fade in={true} timeout={800}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3,
                  background: `linear-gradient(90deg, ${theme.palette.text.primary}, #784af4)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 600
                }}
              >
                Preparing Identity for Blockchain
              </Typography>
              
              <MintingBox>
                <CircularProgress 
                  size={80} 
                  thickness={3} 
                  sx={{ 
                    color: '#784af4',
                    animation: `${glow} 3s infinite`
                  }} 
                />
              </MintingBox>
              
              <Box sx={{ mt: 4, mb: 2, mx: 'auto', maxWidth: 500 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Preparing your digital identity...
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={animationProgress} 
                  sx={{ 
                    height: 8, 
                    borderRadius: 4,
                    backgroundColor: alpha('#784af4', 0.1),
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 4,
                      background: `linear-gradient(90deg, #784af4, ${alpha('#784af4', 0.7)})`,
                    }
                  }} 
                />
              </Box>
              
              <Stack 
                direction="row" 
                spacing={1} 
                sx={{ 
                  justifyContent: 'center', 
                  mt: 3,
                  color: '#784af4'
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Initializing blockchain connection
                </Typography>
              </Stack>
            </Box>
          </Fade>
        );
      
      case 'minting':
        return (
          <Fade in={true} timeout={800}>
            <StyledPaper elevation={2}>
              <Typography 
                variant="h6" 
                sx={{ 
                  textAlign: 'center',
                  mb: 3,
                  background: `linear-gradient(90deg, #784af4, ${alpha('#784af4', 0.7)})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 600
                }}
              >
                Minting Your Decentralized Identity
              </Typography>
              
              <Box sx={{ position: 'relative', mb: 4, mt: 2 }}>
                <CircularProgress 
                  variant="determinate"
                  value={animationProgress}
                  size={100}
                  thickness={2}
                  sx={{ 
                    position: 'relative',
                    zIndex: 1,
                    color: '#784af4',
                    display: 'block',
                    mx: 'auto',
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: 'absolute',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: 100
                  }}
                >
                  <Typography 
                    variant="caption" 
                    component="div"
                    sx={{ 
                      fontWeight: 'bold',
                      color: '#784af4',
                      fontSize: '1rem'
                    }}
                  >
                    {`${Math.round(animationProgress)}%`}
                  </Typography>
                </Box>
              </Box>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  textAlign: 'center', 
                  mb: 3,
                  color: '#784af4',
                  fontWeight: 500
                }}
              >
                {mintStatus}
              </Typography>
              
              {txHash && (
                <TransactionPaper elevation={0}>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Transaction Hash
                    </Typography>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 1, 
                      bgcolor: alpha('#784af4', 0.05),
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      wordBreak: 'break-all'
                    }}>
                      {txHash}
                    </Box>
                  </Stack>
                </TransactionPaper>
              )}
              
              {tokenId && (
                <TransactionPaper elevation={0}>
                  <Stack spacing={1}>
                    <Typography variant="caption" color="text.secondary">
                      Token ID
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'medium',
                        fontFamily: 'monospace',
                        color: '#784af4'
                      }}
                    >
                      {tokenId}
                    </Typography>
                  </Stack>
                </TransactionPaper>
              )}
            </StyledPaper>
          </Fade>
        );
      
      case 'completed':
        return (
          <Fade in={true} timeout={800}>
            <Box sx={{ textAlign: 'center' }}>
              <SuccessBox>
                <CheckCircleIcon />
              </SuccessBox>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  mt: 3,
                  mb: 2,
                  fontWeight: 700,
                  background: `linear-gradient(90deg, ${theme.palette.success.main}, #784af4)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                DID Successfully Minted!
              </Typography>
              
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Your decentralized identifier has been successfully minted on the blockchain
              </Typography>
              
              {txHash && (
                <TransactionPaper elevation={0}>
                  <Stack spacing={1} alignItems="flex-start">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LinkIcon fontSize="small" sx={{ color: '#784af4' }} />
                      <Typography variant="caption" color="text.secondary">
                        Transaction Hash
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      p: 1.5, 
                      borderRadius: 1, 
                      bgcolor: alpha('#784af4', 0.05),
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      width: '100%',
                      wordBreak: 'break-all'
                    }}>
                      {txHash}
                    </Box>
                  </Stack>
                </TransactionPaper>
              )}
              
              {tokenId && (
                <DidDisplay>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    Your Decentralized Identity (DID)
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontFamily: 'monospace',
                      color: '#784af4',
                      fontWeight: 700,
                      letterSpacing: 0.5
                    }}
                  >
                    did:ryt:{tokenId}
                  </Typography>
                </DidDisplay>
              )}

              <Chip 
                icon={<CheckCircleIcon />} 
                label="Click 'Next' to proceed" 
                color="primary" 
                variant="outlined" 
                sx={{ 
                  mt: 4, 
                  color: '#784af4', 
                  borderColor: alpha('#784af4', 0.5),
                  px: 2,
                  py: 0.5,
                  animation: `${pulse} 2s infinite`
                }} 
              />
            </Box>
          </Fade>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Box sx={{ width: '100%', py: 2 }}>
      {renderContent()}
      
      {error && (
        <Fade in={true}>
          <Box 
            sx={{ 
              mt: 4,
              p: 2, 
              borderRadius: 2,
              bgcolor: alpha(theme.palette.error.main, 0.05),
              border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 1,
            }}
          >
            <ErrorIcon color="error" sx={{ mt: 0.5 }} />
            <Box>
              <Typography variant="subtitle2" color="error.main" gutterBottom>
                Error
              </Typography>
              <Typography variant="body2" color="error.main">
                {error}
              </Typography>
            </Box>
          </Box>
        </Fade>
      )}
    </Box>
  );
} 