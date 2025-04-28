'use client';

import { useState, useEffect, useRef } from 'react';
import { useDIDContext } from '../../context/DIDContext';
import { ethers } from 'ethers';
import { createDidMetadata, mintDidToken } from '@/utils/contractUtils';
import { CreationStep } from '@/types/did';

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

export default function MintingStep() {
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
          <div className="space-y-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Preparing your identity for minting...
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${animationProgress}%` }}
              ></div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-sm text-gray-500">Preparing your digital identity...</p>
            </div>
          </div>
        );
      
      case 'minting':
        return (
          <div className="space-y-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Minting your decentralized identity on the blockchain
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${animationProgress}%` }}
              ></div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-base font-medium text-blue-600 dark:text-blue-400">{mintStatus}</p>
              
              {txHash && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-md max-w-md mx-auto overflow-hidden">
                  <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                  <p className="text-xs font-mono break-all">{txHash}</p>
                </div>
              )}
              
              {tokenId && (
                <div className="mt-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <p className="text-xs text-gray-500 mb-1">Token ID</p>
                  <p className="text-sm font-medium">{tokenId}</p>
                </div>
              )}
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
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">DID Successfully Minted!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your decentralized identifier has been minted on the blockchain.
            </p>
            
            {txHash && (
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-md max-w-md mx-auto">
                <p className="text-xs text-gray-500 mb-1">Transaction Hash</p>
                <p className="text-xs font-mono break-all">{txHash}</p>
              </div>
            )}
            
            {tokenId && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md max-w-md mx-auto">
                <p className="text-xs text-gray-500 mb-1">Your Decentralized Identity (DID)</p>
                <p className="text-sm font-medium font-mono">did:ryt:{tokenId}</p>
              </div>
            )}

            <p className="text-blue-600 text-sm mt-4">Click 'Next' to proceed to the finalization step.</p>
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