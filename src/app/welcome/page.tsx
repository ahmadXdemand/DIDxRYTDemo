'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function WelcomePage() {
  const router = useRouter();
  
  useEffect(() => {
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
          src="/pak.svg"
          alt="Background" 
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
            src="/ryt-logo-color.svg"
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
          Securing Identity On Chain
        </p>
        
        <div 
          className="mt-8 animate-fadeInDelayed2"
          style={{ 
            animation: 'fadeIn 1s ease-out 1s both, slideUp 1s ease-out 1s both'
          }}
        >
          <p className="text-blue-300">Redirecting to wallet connection...</p>
          <div className="mt-4 w-48 h-1 bg-blue-500 mx-auto animate-loader"></div>
        </div>
      </div>
    </div>
  );
} 