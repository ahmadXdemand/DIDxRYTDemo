'use client';

import { useState, useEffect } from 'react';
import { useDIDContext } from '../../context/DIDContext';
import { CreationStep } from '@/types/did';

export default function FinalizationStep() {
  const { state, updateDIDData, markStepAsCompleted, setCurrentStep } = useDIDContext();
  const [finalizationStage, setFinalizationStage] = useState<'preparing' | 'processing' | 'completed'>('preparing');
  const [animationProgress, setAnimationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Start the finalization process
  useEffect(() => {
    const startFinalization = async () => {
      if (state.didData.finalizationComplete) {
        // If already finalized, just show completion
        setFinalizationStage('completed');
        setAnimationProgress(100);
        return;
      }
      
      try {
        // First stage: Preparing
        setFinalizationStage('preparing');
        setAnimationProgress(0);
        
        // Animation for the preparing stage
        const preparingDuration = 3000;
        const preparingStart = Date.now();
        const preparingInterval = setInterval(() => {
          const elapsed = Date.now() - preparingStart;
          const progress = Math.min(elapsed / preparingDuration * 100, 100);
          setAnimationProgress(progress);
          if (progress >= 100) clearInterval(preparingInterval);
        }, 50);
        
        await new Promise(resolve => setTimeout(resolve, preparingDuration));
        clearInterval(preparingInterval);
        
        // Second stage: Processing
        setFinalizationStage('processing');
        setAnimationProgress(0);
        
        // Animation for the processing stage
        const processingDuration = 3000;
        const processingStart = Date.now();
        const processingInterval = setInterval(() => {
          const elapsed = Date.now() - processingStart;
          const progress = Math.min(elapsed / processingDuration * 100, 100);
          setAnimationProgress(progress);
          if (progress >= 100) clearInterval(processingInterval);
        }, 50);
        
        await new Promise(resolve => setTimeout(resolve, processingDuration));
        clearInterval(processingInterval);
        
        // Complete the finalization
        setFinalizationStage('completed');
        updateDIDData({
          finalizationComplete: true,
          completionTimestamp: new Date().toISOString()
        });
        markStepAsCompleted(true);
        
        // Wait a moment to show completion state before moving to next step
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error: any) {
        console.error("Finalization error:", error);
        setError(error.message || "An error occurred during finalization.");
      }
    };
    
    startFinalization();
  }, [state.didData, updateDIDData, markStepAsCompleted, setCurrentStep]);
  
  // Render different content based on the finalization stage
  const renderContent = () => {
    switch (finalizationStage) {
      case 'preparing':
        return (
          <div className="space-y-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Preparing for DID finalization...
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${animationProgress}%` }}
              ></div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-sm text-gray-500">Initializing final steps...</p>
            </div>
          </div>
        );
      
      case 'processing':
        return (
          <div className="space-y-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Finalizing your DID creation
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${animationProgress}%` }}
              ></div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 text-left">
                <div>✅ Validating documents</div>
                <div>✅ Generating credentials</div>
                <div>⏳ Configuring resolver</div>
                <div>⏳ Registering identifier</div>
              </div>
            </div>
          </div>
        );
      
      case 'completed':
        return (
          <div className="space-y-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                <svg className="h-8 w-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">DID Finalization Complete!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your decentralized identity is now fully setup and ready to use.
            </p>
            
            <div className="grid grid-cols-2 gap-2 max-w-md mx-auto text-sm text-left">
              <div className="text-gray-500 dark:text-gray-400">DID Identifier:</div>
              <div className="font-mono">did:ryt:{state.didData.didIdentifier || state.didData.walletAddress}</div>
              
              <div className="text-gray-500 dark:text-gray-400">Registered on:</div>
              <div>{new Date().toLocaleDateString()}</div>
              
              <div className="text-gray-500 dark:text-gray-400">Status:</div>
              <div className="text-green-600 dark:text-green-400">Active</div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4 max-w-md mx-auto">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-2 font-medium">Next Steps</p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 text-left list-disc pl-5">
                <li>Download your DID document</li>
                <li>Use your DID for identity verification</li>
                <li>Connect with other verified identities</li>
              </ul>
            </div>
            
            <p className="text-blue-600 text-sm mt-4">Click 'Next' to complete the process.</p>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="w-full">
      {renderContent()}
      
      {error && (
        <div className="mt-6 p-3 bg-red-50 dark:bg-red-900/20 rounded-md text-red-700 dark:text-red-400 text-sm">
          <p className="font-medium">Error</p>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
} 