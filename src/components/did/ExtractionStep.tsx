'use client';

import { useState, useEffect } from 'react';
import { useDIDContext } from '../../context/DIDContext';
import Image from 'next/image';
import { performOcrWithGPT4o } from '@/utils/openaiService';
import { IDInformation } from '@/types/id';

export default function ExtractionStep() {
  const { state, updateDIDData, markStepAsCompleted } = useDIDContext();
  const [extractionPhase, setExtractionPhase] = useState<'preparing' | 'extracting' | 'processing' | 'complete'>('preparing');
  const [extractedData, setExtractedData] = useState<IDInformation | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [useOpenAI, setUseOpenAI] = useState<boolean>(true);
  
  // Mock data for display when not using OpenAI or as fallback
  const mockExtractedData: IDInformation = {
    fullName: "John Doe",
    dateOfBirth: "1990-01-01",
    gender: "Male",
    idNumber: "AB123456789",
    metadata: {
      documentType: "National ID",
      issuingCountry: "United States",
      fileType: "image/jpeg",
      fileSize: "Unknown"
    },
    confidence: 0.92
  };

  // Extract data using OpenAI
  const extractDataWithOpenAI = async (imageUrl: string): Promise<void> => {
    try {
      if (!imageUrl) {
        throw new Error("No image URL provided for extraction");
      }
      
      setExtractionPhase('extracting');
      
      // In demo mode, simulate delay then use mock data
      if (!useOpenAI) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        setExtractedData(mockExtractedData);
        setRawText(JSON.stringify(mockExtractedData, null, 2));
        setExtractionPhase('processing');
        await new Promise(resolve => setTimeout(resolve, 2000));
        return;
      }
      
      // Real OpenAI extraction
      const result = await performOcrWithGPT4o(imageUrl);
      setExtractedData(result.extractedInfo);
      setRawText(result.rawText || '');
      
      setExtractionPhase('processing');
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error: any) {
      console.error("Error extracting data with OpenAI:", error);
      setError(error.message || "Failed to extract information from your ID");
      // Fallback to mock data in case of error
      setExtractedData(mockExtractedData);
      setRawText(JSON.stringify(mockExtractedData, null, 2));
    }
  };

  // Simulate the extraction process with phases
  useEffect(() => {
    const performExtraction = async () => {
      try {
        // If already completed, just show the data
        if (state.didData.extractedInfo) {
          setExtractionPhase('complete');
          setExtractedData(state.didData.documentDetails as IDInformation || mockExtractedData);
          return;
        }

        // Phase 1: Preparing
        setExtractionPhase('preparing');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Phase 2 & 3: Extract data with OpenAI (or mock)
        const imageUrl = state.didData.ipfsUrl || '';
        await extractDataWithOpenAI(imageUrl);
        
        // Phase 4: Complete
        setExtractionPhase('complete');
        
        // Update the DID context with the extracted data
        const dataToSave = extractedData || mockExtractedData;
        updateDIDData({
          extractedInfo: true,
          fullName: dataToSave.fullName || mockExtractedData.fullName,
          documentNumber: dataToSave.idNumber || mockExtractedData.idNumber,
          dateOfBirth: dataToSave.dateOfBirth || mockExtractedData.dateOfBirth,
          documentType: dataToSave.metadata?.documentType || mockExtractedData.metadata.documentType,
          documentDetails: dataToSave,
          rawExtractionText: rawText
        });

        // Mark step as completed
        markStepAsCompleted(true);
      } catch (error: any) {
        console.error("Error during extraction:", error);
        setError("Failed to extract information from your ID. Please try again.");
        
        // Still show mock data to allow user to continue
        setExtractionPhase('complete');
        setExtractedData(mockExtractedData);
        updateDIDData({
          extractedInfo: true,
          fullName: mockExtractedData.fullName,
          documentNumber: mockExtractedData.idNumber,
          dateOfBirth: mockExtractedData.dateOfBirth,
          documentType: mockExtractedData.metadata.documentType,
          documentDetails: mockExtractedData
        });
        markStepAsCompleted(true);
      }
    };

    performExtraction();
  }, [updateDIDData, markStepAsCompleted]);

  // Toggle between OpenAI and mock data (for testing purposes)
  const toggleUseOpenAI = () => {
    setUseOpenAI(!useOpenAI);
  };

  // Render different content based on extraction phase
  const renderContent = () => {
    switch (extractionPhase) {
      case 'preparing':
        return (
          <div className="space-y-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Preparing your ID for extraction...
            </p>
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-sm text-gray-500">Setting up AI analysis</p>
            </div>
          </div>
        );
      
      case 'extracting':
        return (
          <div className="space-y-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Extracting information from your ID
            </p>
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full flex items-center justify-center">
                  {/* Stars animation */}
                  <div className="absolute animate-pulse w-6 h-6 bg-blue-400 rounded-full" style={{ top: '20%', left: '20%', animationDelay: '0.1s' }}></div>
                  <div className="absolute animate-pulse w-4 h-4 bg-blue-300 rounded-full" style={{ top: '70%', left: '30%', animationDelay: '0.5s' }}></div>
                  <div className="absolute animate-pulse w-5 h-5 bg-blue-500 rounded-full" style={{ top: '40%', left: '80%', animationDelay: '0.7s' }}></div>
                  <div className="absolute animate-pulse w-3 h-3 bg-blue-200 rounded-full" style={{ top: '60%', left: '50%', animationDelay: '0.3s' }}></div>
                  <div className="absolute animate-pulse w-5 h-5 bg-blue-600 rounded-full" style={{ top: '30%', left: '60%', animationDelay: '0.9s' }}></div>
                  <div className="absolute w-32 h-24 bg-gray-200 dark:bg-gray-700 rounded-md blur-sm"></div>
                  <div className="absolute w-32 h-24 border-2 border-blue-500 rounded-md animate-ping opacity-50"></div>
                </div>
              </div>
            </div>
            <p className="text-sm text-blue-500 animate-pulse">Using {useOpenAI ? 'GPT-4o AI' : 'simulated AI'} to analyze your document...</p>
          </div>
        );
      
      case 'processing':
        return (
          <div className="space-y-6 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              Processing your information
            </p>
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <div className="w-64 h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-progress" style={{ width: '70%' }}></div>
              </div>
              <p className="text-sm text-gray-500 mt-2">Gathering your information...</p>
            </div>
          </div>
        );
      
      case 'complete':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-green-100 dark:bg-green-900 p-3">
                <svg className="h-8 w-8 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center">Information Extracted Successfully</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left column: Images */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Verified Documents</h4>
                
                {/* ID Image */}
                <div className="border p-2 rounded-md dark:border-gray-700">
                  <p className="text-xs text-gray-500 mb-1">ID Document</p>
                  <div className="h-36 bg-gray-100 dark:bg-gray-800 rounded relative overflow-hidden">
                    {state.didData.ipfsUrl ? (
                      <img 
                        src={state.didData.ipfsUrl} 
                        alt="ID Document" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <p className="text-xs">ID image</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Selfie/Liveness Image */}
                <div className="border p-2 rounded-md dark:border-gray-700">
                  <p className="text-xs text-gray-500 mb-1">Liveness Verification</p>
                  <div className="h-36 bg-gray-100 dark:bg-gray-800 rounded relative overflow-hidden">
                    {state.didData.livenessData ? (
                      <img 
                        src={state.didData.livenessData} 
                        alt="Liveness Check" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <p className="text-xs">Liveness image</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Demo toggle */}
                <div className="pt-2">
                  <button 
                    onClick={toggleUseOpenAI}
                    className="text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 px-2 py-1 rounded text-gray-700 dark:text-gray-300"
                  >
                    {useOpenAI ? 'Using Real API' : 'Using Demo Data'}
                  </button>
                </div>
              </div>
              
              {/* Right column: Extracted Data */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Extracted Information</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md space-y-3">
                  {extractedData && Object.entries(extractedData).map(([key, value]: [string, any]) => {
                    // Skip certain fields
                    if (['confidence', 'rawText', 'metadata'].includes(key)) return null;
                    
                    return (
                      <div key={key} className="grid grid-cols-2 gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {key === 'idNumber' ? 'Document Number' : (
                            key.replace(/([A-Z])/g, ' $1')
                            .replace(/^./, str => str.toUpperCase())
                            .replace(/([a-z])([A-Z])/g, '$1 $2')
                          )}
                        </p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 text-right overflow-hidden overflow-ellipsis">
                          {value?.toString() || '—'}
                        </p>
                      </div>
                    );
                  })}
                  
                  {/* Metadata fields */}
                  {extractedData?.metadata && Object.entries(extractedData.metadata).map(([key, value]: [string, any]) => {
                    if (['fileType', 'fileSize'].includes(key)) return null;
                    
                    return (
                      <div key={key} className="grid grid-cols-2 gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {key.replace(/([A-Z])/g, ' $1')
                            .replace(/^./, str => str.toUpperCase())
                            .replace(/([a-z])([A-Z])/g, '$1 $2')}
                        </p>
                        <p className="text-sm text-gray-800 dark:text-gray-200 text-right overflow-hidden overflow-ellipsis">
                          {value?.toString() || '—'}
                        </p>
                      </div>
                    );
                  })}

                  {/* Confidence score with visual indicator */}
                  {extractedData && extractedData.confidence && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Extraction Confidence
                      </p>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${extractedData.confidence > 0.8 ? 'bg-green-500' : extractedData.confidence > 0.6 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                          style={{ width: `${extractedData.confidence * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-right mt-1 text-gray-500">
                        {Math.round(extractedData.confidence * 100)}% confidence
                      </p>
                    </div>
                  )}
                  
                  {/* Raw extraction text (collapsible) */}
                  {rawText && (
                    <details className="mt-4 text-xs">
                      <summary className="cursor-pointer text-blue-500 hover:text-blue-700">
                        Show raw extraction data
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-900 rounded overflow-auto text-xs max-h-40">
                        {rawText}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {renderContent()}
    </div>
  );
} 