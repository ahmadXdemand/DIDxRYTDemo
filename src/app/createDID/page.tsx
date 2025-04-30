'use client';

import React, { useEffect, useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button, Box, Typography, Paper, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Add window.ethereum type declaration
declare global {
  interface Window {
    ethereum: any;
  }
}

// Import step components
import WalletConnectionStep from '../../components/did/WalletConnectionStep';
import ImageSelectionStep from '../../components/did/ImageSelectionStep';
import LivenessVerificationStep from '../../components/did/LivenessVerificationStep';
import ExtractionStep from '../../components/did/ExtractionStep';
import VerificationStep from '../../components/did/VerificationStep';
import MintingStep from '../../components/did/MintingStep';
import FinalizationStep from '../../components/did/FinalizationStep';
import DIDStepper from '../../components/did/DIDStepper';
import DIDProfileView from '../../components/did/DIDProfileView';
import RecaptchaStep from './RecaptchaStep';
import VerificationScoreDisplay from '../../components/did/VerificationScoreDisplay';

// Import DID context provider
import { DIDProvider, useDIDContext } from '../../context/DIDContext';

// Import shared types and constants
import { CreationStep, steps } from '../../types/did';

// Main content component that uses the context
function DIDCreationContent() {
  const router = useRouter();
  const { state, updateDIDData, markStepAsCompleted, goToNextStep, goToPreviousStep } = useDIDContext();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check if wallet is connected on page load
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        setIsLoading(true);
        // Check for wallet connection
        if (window.ethereum) {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts && accounts.length > 0) {
            // Wallet is connected, update state
            updateDIDData({ walletAddress: accounts[0] });
          } else {
            // No wallet connected, redirect to connect-wallet page
            router.replace('/connect-wallet');
          }
        } else {
          // No ethereum provider, redirect to connect-wallet page
          router.replace('/connect-wallet');
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
        router.replace('/connect-wallet');
      } finally {
        setIsLoading(false);
      }
    };

    checkWalletConnection();
  }, [router, updateDIDData]);

  // Render the current step component
  const renderStepContent = () => {
    switch (state.currentStep) {
      case CreationStep.WALLET_CONNECTION:
        return <WalletConnectionStep />;
      
      case CreationStep.RECAPTCHA:
        return (
          <RecaptchaStep 
            onComplete={() => {
              updateDIDData({ captchaCompleted: true });
              markStepAsCompleted(true);
            }} 
            isLoading={isLoading}
          />
        );
      
      case CreationStep.IMAGE_SELECTION:
        return <ImageSelectionStep />;
      
      case CreationStep.LIVENESS_VERIFICATION:
        return <LivenessVerificationStep />;
      
      case CreationStep.EXTRACTION:
        return <ExtractionStep />;
      
      case CreationStep.VERIFICATION:
        return <VerificationStep />;
      
      case CreationStep.MINTING:
        return <MintingStep />;
      
      case CreationStep.COMPLETED:
        return (
          <Box sx={{ width: '100%' }}>
            <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
              <Box sx={{ 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                p: 1,
                color: 'white'
              }}>
                <CheckCircleIcon fontSize="large" />
              </Box>
            </Box>
            <Typography variant="h5" fontWeight="medium" color="text.primary" gutterBottom align="center" sx={{ mb: 4 }}>
              DID Successfully Created!
            </Typography>
            
            {/* Display the comprehensive DID Profile */}
            <DIDProfileView />
          </Box>
        );
      
      default:
        return null;
    }
  };

  // Automatically complete the extraction and minting steps after a delay
  React.useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    
    // For extraction, we don't need the timer anymore since ExtractionStep handles its own state
    if (state.currentStep === CreationStep.MINTING && !state.didData.mintingComplete) {
      // We no longer need this timer as MintingStep handles its own state
    } else if (state.currentStep === CreationStep.COMPLETED && !state.didData.finalizationComplete) {
      // We no longer need this timer as FinalizationStep handles its own state
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [state.currentStep, state.didData, updateDIDData, markStepAsCompleted]);

  // If still loading, show a loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-black">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="h-12 w-36 relative">
            <Image 
              src="/ryt-logo-color.svg"
              alt="RYT Logo"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-center text-[#784af4] dark:text-white">Create Your DID</h1>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-8">Secure your digital identity on the blockchain</p>
        
        {/* Replace progress bar with Material-UI Stepper */}
        <div className="mb-6">
          <DIDStepper 
            currentStep={state.currentStep}
            steps={steps}
          />
        </div>
        
        {/* Add verification score display */}
        <VerificationScoreDisplay />
        
        {/* Step content */}
        <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-850 rounded-lg min-h-[300px] flex items-center justify-center">
          {renderStepContent()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outlined"
            color="primary"
            onClick={goToPreviousStep}
            disabled={state.currentStep === CreationStep.WALLET_CONNECTION}
            startIcon={<ArrowBackIcon />}
            sx={{ px: 3, py: 1 }}
          >
            Back
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            onClick={goToNextStep}
            disabled={state.currentStep === CreationStep.COMPLETED || !state.isStepCompleted}
            endIcon={<ArrowForwardIcon />}
            sx={{ px: 3, py: 1 }}
          >
            {state.currentStep === CreationStep.COMPLETED ? 'Finished' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Export the page component wrapped with the DID Provider
export default function CreateDIDPage() {
  return (
    <DIDProvider>
      <DIDCreationContent />
    </DIDProvider>
  );
} 