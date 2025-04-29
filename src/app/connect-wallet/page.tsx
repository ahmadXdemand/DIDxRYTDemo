'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ethers } from 'ethers';

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

export default function ConnectWalletPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [country, setCountry] = useState<string>('default');
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
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send("eth_requestAccounts", []); // Popup MetaMask
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        
        // Redirect to createDID page after successful connection
        setTimeout(() => {
          router.push('/createDID');
        }, 1500);
      } catch (err) {
        console.error("User denied wallet connection", err);
      }
    } else {
      alert("MetaMask not detected. Install the extension first.");
    }
  };
  
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-blue-900 to-black text-white">
      {/* Background image */}
      <div className="absolute inset-0 z-0 opacity-20 animate-pulse">
        <Image 
          src={countryFlags[country] || countryFlags.default}
          alt={`${countryNames[country]} Flag Background`}
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
      
      {/* Content with animations */}
      <div className="z-10 text-center space-y-8 max-w-2xl p-4">
        <div 
          className="mx-auto w-48 h-48 relative mb-4"
          style={{ 
            animation: 'fadeIn 1s ease-out, slideUp 1s ease-out'
          }}
        >
          <Image 
            src="/ryt-logo-white.svg"
            alt="RYT Logo"
            fill
            style={{ objectFit: 'contain' }}
          />
        </div>
        
        <h1 
          className="text-4xl md:text-6xl font-bold"
          style={{ 
            animation: 'fadeIn 1s ease-out, slideUp 1s ease-out'
          }}
        >
          Connect Your Wallet
        </h1>
        
        <p 
          className="text-xl md:text-2xl text-purple-200"
          style={{ 
            animation: 'fadeIn 1s ease-out 0.5s both, slideUp 1s ease-out 0.5s both'
          }}
        >
          To begin the DID creation process in {countryNames[country]}, please connect your wallet
        </p>
        
        <div 
          className="mt-8"
          style={{ 
            animation: 'fadeIn 1s ease-out 1s both, slideUp 1s ease-out 1s both'
          }}
        >
          {isChecking ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-300 mb-2"></div>
              <p className="text-purple-200">Checking wallet connection...</p>
            </div>
          ) : !account ? (
            <button 
              onClick={connectWallet} 
              className="bg-purple-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full text-xl transition-all transform hover:scale-105"
            >
              Connect RYT Wallet
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-green-400 text-xl">
                Wallet Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </p>
              <p className="text-purple-300">Redirecting to DID creation...</p>
              <div className="mt-4 w-48 h-1 bg-purple-500 mx-auto animate-loader"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 