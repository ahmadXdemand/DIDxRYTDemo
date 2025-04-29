'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  
  const navigateToWelcome = (country: string) => {
    // Store selected country in localStorage or session for the welcome page to use
    localStorage.setItem('selectedCountry', country);
    router.push('/welcome');
  };
  
  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-8">
      {/* Logo */}
      <div className="w-48 h-48 relative mt-12 mb-12">
        <Image 
          src="/ryt-logo-color.svg"
          alt="RYT Logo"
          fill
          style={{ 
            objectFit: 'contain',
            filter: 'brightness(0)' // This makes the logo black
          }}
        />
      </div>
      
      {/* Tagline */}
      <h1 className="text-black text-center text-3xl md:text-4xl font-bold mb-16 max-w-3xl">
        RYT DID – Revolutionizing Trust Across Borders
      </h1>
      
      {/* Country Cards */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row justify-center gap-8 px-4">
        {/* Pakistan Card */}
        <motion.div 
          className={`bg-white border rounded-xl p-6 flex-1 flex flex-col items-center cursor-pointer transition-all duration-300 ${
            hoveredCard === 'pakistan' ? 'shadow-xl' : 'shadow-md'
          }`}
          whileHover={{ scale: 1.03 }}
          onClick={() => navigateToWelcome('pakistan')}
          onMouseEnter={() => setHoveredCard('pakistan')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="w-24 h-24 relative mb-4">
            <Image
              src="/flags/pakistan-flag.svg"
              alt="Pakistan Flag"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Pakistan</h2>
          <p className="text-gray-600 text-center">Digitizing land records in Karachi</p>
        </motion.div>
        
        {/* Panama Card */}
        <motion.div 
          className={`bg-white border rounded-xl p-6 flex-1 flex flex-col items-center cursor-pointer transition-all duration-300 ${
            hoveredCard === 'panama' ? 'shadow-xl' : 'shadow-md'
          }`}
          whileHover={{ scale: 1.03 }}
          onClick={() => navigateToWelcome('panama')}
          onMouseEnter={() => setHoveredCard('panama')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="w-24 h-24 relative mb-4">
            <Image
              src="/flags/panama-flag.svg"
              alt="Panama Flag"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Panama</h2>
          <p className="text-gray-600 text-center">Streamlining port logistics</p>
        </motion.div>
        
        {/* Costa Rica Card */}
        <motion.div 
          className={`bg-white border rounded-xl p-6 flex-1 flex flex-col items-center cursor-pointer transition-all duration-300 ${
            hoveredCard === 'costarica' ? 'shadow-xl' : 'shadow-md'
          }`}
          whileHover={{ scale: 1.03 }}
          onClick={() => navigateToWelcome('costarica')}
          onMouseEnter={() => setHoveredCard('costarica')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div className="w-24 h-24 relative mb-4">
            <Image
              src="/flags/costa-rica-flag.svg"
              alt="Costa Rica Flag"
              fill
              style={{ objectFit: 'contain' }}
            />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-800">Costa Rica</h2>
          <p className="text-gray-600 text-center">Securing eco-tourism transactions</p>
        </motion.div>
      </div>
      
      <div className="mt-16 text-sm text-gray-400">
        © 2023 RYT DID - Securing Identities On Chain
      </div>
    </div>
  );
}
