'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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

export default function WelcomePage() {
  const router = useRouter();
  const [country, setCountry] = useState<string>('default');
  
  useEffect(() => {
    // Check for selected country from localStorage
    if (typeof window !== 'undefined') {
      const selectedCountry = localStorage.getItem('selectedCountry') || 'default';
      setCountry(selectedCountry);
    }
    
    // Redirect to wallet connection page after 5 seconds
    const timer = setTimeout(() => {
      router.push('/connect-wallet');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [router]);
  
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
          className="text-4xl md:text-6xl font-bold animate-fadeIn"
          style={{ 
            animation: 'fadeIn 1s ease-out, slideUp 1s ease-out'
          }}
        >
          Welcome to RYT DID Creation
        </h1>
        
        <p 
          className="text-xl md:text-2xl text-blue-200 animate-fadeInDelayed"
          style={{ 
            animation: 'fadeIn 1s ease-out 0.5s both, slideUp 1s ease-out 0.5s both'
          }}
        >
          Securing Identity On Chain in {countryNames[country]}
        </p>
        
        <div 
          className="mt-8 animate-fadeInDelayed2"
          style={{ 
            animation: 'fadeIn 1s ease-out 1s both, slideUp 1s ease-out 1s both'
          }}
        >
          <p className="text-purple-300">Redirecting to wallet connection...</p>
          <div className="mt-4 w-48 h-1 bg-purple-500 mx-auto animate-loader"></div>
        </div>
      </div>
    </div>
  );
} 