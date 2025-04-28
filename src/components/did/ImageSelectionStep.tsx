'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useDropzone, FileWithPath } from 'react-dropzone';
import { ArrowUpIcon } from '@heroicons/react/24/outline';
import { useDIDContext } from '../../context/DIDContext';
import { uploadImageToPinata } from '../../utils/pinata';

export default function ImageSelectionStep() {
  const { state, updateDIDData, markStepAsCompleted } = useDIDContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(state.didData.imageData || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(state.didData.ipfsUrl || null);
  
  // Check if we already have image data and mark step as completed
  useEffect(() => {
    if (ipfsUrl && !state.isStepCompleted) {
      markStepAsCompleted(true);
    }
  }, [ipfsUrl, state.isStepCompleted, markStepAsCompleted]);
  
  const { getRootProps, getInputProps, isDragActive, isDragAccept } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': []
    },
    maxFiles: 1,
    onDrop: (acceptedFiles: FileWithPath[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setSelectedImage(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  });
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      setIsUploading(true);
      setUploadError(null);
      
      // Upload the file to Pinata
      const url = await uploadImageToPinata(selectedFile);
      
      // Set the IPFS URL and update context
      setIpfsUrl(url);
      updateDIDData({
        imageData: selectedImage,
        ipfsUrl: url,
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size
      });
      
      markStepAsCompleted(true);
    } catch (error) {
      console.error('Error uploading to Pinata:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
        Please upload a photo of your government-issued ID
      </p>
      
      {!selectedImage ? (
        <div className="mb-8">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[200px] ${
              isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'
            } ${isDragAccept ? 'border-green-500' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="mb-4 text-gray-400">
              <ArrowUpIcon className="mx-auto h-12 w-12" />
            </div>
            <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              Drag & drop an ID document here, or click to select
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Supported formats: JPEG, PNG
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-6">
          <div className="relative w-full max-w-md h-64">
            <Image
              src={selectedImage}
              alt="Selected ID"
              fill
              style={{ objectFit: 'contain' }}
              className="rounded-lg"
            />
            <button
              onClick={() => {
                setSelectedImage(null);
                setSelectedFile(null);
                setIpfsUrl(null);
              }}
              className="absolute top-2 right-2 bg-gray-800 bg-opacity-70 text-white text-xs px-2 py-1 rounded"
            >
              Change
            </button>
          </div>
          
          {!ipfsUrl && (
            <button
              onClick={handleUpload}
              disabled={isUploading || !selectedFile}
              className={`px-6 py-3 rounded-md transition-colors ${
                isUploading 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isUploading ? 'Uploading...' : 'Upload Image'}
            </button>
          )}
          
          {uploadError && (
            <p className="text-red-500 text-sm">{uploadError}</p>
          )}
          
          {ipfsUrl && (
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <p className="text-green-600 dark:text-green-400">Uploaded successfully</p>
              </div>
              <p className="text-xs text-gray-500 break-all">{ipfsUrl}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 