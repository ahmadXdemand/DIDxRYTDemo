import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useDIDContext } from '../../context/DIDContext';

// Add window.ethereum type declaration
declare global {
  interface Window {
    ethereum: any;
  }
}

// Import ethereum type definition


export default function WalletConnectionStep() {
  const { state, updateDIDData, markStepAsCompleted, goToNextStep, updateVerificationScore } = useDIDContext();
  const [account, setAccount] = useState<string | null>(state.didData.walletAddress || null);
  const [isLoading, setIsLoading] = useState(false);
  
  // If wallet is already connected, mark step as complete and go to next step
  useEffect(() => {
    if (account && !state.isStepCompleted) {
      updateDIDData({ walletAddress: account });
      markStepAsCompleted(true);
      // Set initial verification score to 10
      updateVerificationScore(10);
      // Automatically move to the next step (RECAPTCHA) after a short delay
      const timer = setTimeout(() => {
        goToNextStep();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [account, state.isStepCompleted, updateDIDData, markStepAsCompleted, goToNextStep, updateVerificationScore]);
  
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setIsLoading(true);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []); // Popup MetaMask
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        updateDIDData({ walletAddress: address });
        // Set initial verification score to 10
        updateVerificationScore(10);
        markStepAsCompleted(true);
      } catch (err) {
        console.error("User denied wallet connection", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      alert("MetaMask not detected. Install the extension first.");
    }
  };
  
  return (
    <div className="space-y-6 text-center">
      {!account ? (
        <>
          <p className="text-gray-600 dark:text-gray-300">
            Please connect your wallet to begin the DID creation process
          </p>
          <button 
            onClick={connectWallet} 
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md transition-colors"
          >
            {isLoading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-600 dark:text-gray-300">
            Your wallet has been connected. Proceeding to security verification...
          </p>
          <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-sm font-mono break-all">
            {account}
          </div>
        </>
      )}
    </div>
  );
} 