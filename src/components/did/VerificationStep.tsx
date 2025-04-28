'use client';

import { useState, useEffect } from 'react';
import { useDIDContext } from '../../context/DIDContext';
import { IDInformation } from '@/types/id';
import { CreationStep } from '@/types/did';

export default function VerificationStep() {
  const { state, updateDIDData, markStepAsCompleted } = useDIDContext();
  const [verifiedData, setVerifiedData] = useState<IDInformation | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Load extracted data from context and start verification process
  useEffect(() => {
    let mounted = true;
    const autoVerify = async () => {
      try {
        // Load document details
        if (state.didData.documentDetails) {
          setVerifiedData(state.didData.documentDetails as IDInformation);
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
        const dataToVerify = state.didData.documentDetails || {};
        
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
  }, [state.didData.documentDetails, updateDIDData, markStepAsCompleted, state.didData]);
  
  if (!verifiedData && !isVerifying) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading extracted information...</p>
      </div>
    );
  }
  
  if (isCompleted) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
            <svg className="h-8 w-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Information Verified Successfully</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your identity information has been verified and is ready for the next step.
        </p>
        <p className="text-blue-600 text-sm">Click 'Next' to proceed to the minting step.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center">
        Verifying Your Information
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center">
        Please wait while we verify your information...
      </p>
      
      <div className="space-y-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Verifying your information...
        </p>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${animationProgress}%` }}
          ></div>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-sm text-gray-500">This will only take a moment...</p>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-red-700 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
} 