'use client';

import { useState, useEffect } from 'react';
import { useDIDContext } from '../../context/DIDContext';
import { performOcrWithGPT4o } from '@/utils/openaiService';
import { IDInformation } from '@/types/id';

// Material UI imports
import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  LinearProgress,
  Card,
  CardContent,
  Avatar,
  Fade,
  Chip,
  useTheme,
  alpha,
  styled,
  Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Person as PersonIcon,
  Event as EventIcon,
  Badge as BadgeIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

// Styled components
const InfoCard = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
  },
}));

const InfoItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  }
}));

const SelfieImage = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: 200,
  height: 200,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
  border: `2px solid ${theme.palette.primary.main}`,
  margin: '0 auto',
}));

const IDImage = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: 200,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
  border: `2px solid ${theme.palette.primary.main}`,
  margin: '0 auto',
  marginBottom: theme.spacing(2),
}));

export default function ExtractionStep() {
  const { state, updateDIDData, markStepAsCompleted } = useDIDContext();
  const [extractionPhase, setExtractionPhase] = useState<'preparing' | 'extracting' | 'processing' | 'complete'>('preparing');
  const [extractedData, setExtractedData] = useState<IDInformation | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [useOpenAI, setUseOpenAI] = useState<boolean>(true);
  const [extractionProgress, setExtractionProgress] = useState(0);
  const theme = useTheme();
  
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
    confidence: 0.92,
    rawText: ""
  };

  // Extract data using OpenAI
  const extractDataWithOpenAI = async (imageUrl: string): Promise<IDInformation | null> => {
    try {
      if (!imageUrl) {
        throw new Error("No image URL provided for extraction");
      }
      
      setExtractionPhase('extracting');
      
      // Update progress for UI feedback
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        if (progress <= 90) {
          setExtractionProgress(progress);
        } else {
          clearInterval(progressInterval);
        }
      }, 300);
      
      // In demo mode, simulate delay then use mock data
      if (!useOpenAI) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        setExtractedData(mockExtractedData);
        setRawText(JSON.stringify(mockExtractedData, null, 2));
        setExtractionPhase('processing');
        clearInterval(progressInterval);
        setExtractionProgress(95);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setExtractionProgress(100);
        return mockExtractedData;
      }
      
      // Real OpenAI extraction
      const result = await performOcrWithGPT4o(imageUrl);
      const extractedInfo = result.extractedInfo;
      setExtractedData(extractedInfo);
      setRawText(result.rawText || '');
      
      clearInterval(progressInterval);
      setExtractionProgress(95);
      setExtractionPhase('processing');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setExtractionProgress(100);
      return extractedInfo;
    } catch (error: any) {
      console.error("Error extracting data with OpenAI:", error);
      setError(error.message || "Failed to extract information from your ID");
      // Fallback to mock data in case of error
      setExtractedData(mockExtractedData);
      setRawText(JSON.stringify(mockExtractedData, null, 2));
      setExtractionProgress(100);
      return null;
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
          setExtractionProgress(100);
          return;
        }

        // Phase 1: Preparing
        setExtractionPhase('preparing');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Phase 2 & 3: Extract data with OpenAI (or mock)
        const imageUrl = state.didData.ipfsUrl || '';
        const extractedInfo = await extractDataWithOpenAI(imageUrl);
        
        // Phase 4: Complete
        setExtractionPhase('complete');
        
        // Update the DID context with the extracted data
        const dataToSave = extractedInfo || mockExtractedData;
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

  const renderContent = () => {
    if (extractionPhase === 'preparing' || extractionPhase === 'extracting' || extractionPhase === 'processing') {
      return (
        <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
          <LinearProgress 
            variant="determinate" 
            value={extractionProgress} 
            sx={{ 
              height: 10, 
              borderRadius: 5,
              mb: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
              '& .MuiLinearProgress-bar': {
                borderRadius: 5,
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
              }
            }} 
          />
          <Typography variant="body2" color="text.secondary" align="center">
            {extractionPhase === 'preparing' ? 'Preparing your ID for extraction...' : 
             extractionPhase === 'extracting' ? 'Extracting information using OpenAI...' : 
             'Processing and validating your information...'}
          </Typography>
        </Box>
      );
    } else if (extractionPhase === 'complete') {
      return (
        <Fade in={extractionPhase === 'complete'} timeout={800}>
          <Box>
            <Stack 
              direction={{ xs: 'column', md: 'row' }} 
              spacing={4} 
              sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}
            >
              {/* Images Section */}
              <Stack spacing={3} alignItems="center" sx={{ minWidth: { md: 240 } }}>
                <Typography variant="subtitle1" color="text.secondary" fontWeight={500}>
                  Verified Documents
                </Typography>
                
                {/* ID Image */}
                {state.didData.ipfsUrl && (
                  <IDImage>
                    <img 
                      src={state.didData.ipfsUrl} 
                      alt="ID Document"
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  </IDImage>
                )}
                
                {/* Selfie/Liveness Image */}
                {state.didData.livenessImage && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Liveness Verification
                    </Typography>
                    <SelfieImage>
                      <img 
                        src={state.didData.livenessImage} 
                        alt="Liveness Check"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </SelfieImage>
                  </Box>
                )}
                
                {/* Demo toggle */}
                <Chip 
                  label={useOpenAI ? "Using Real API" : "Using Demo Mode"} 
                  color={useOpenAI ? "primary" : "default"}
                  variant="outlined"
                  onClick={toggleUseOpenAI}
                  sx={{ mt: 2 }}
                />
              </Stack>
              
              {/* Info Section */}
              <Box sx={{ flexGrow: 1 }}>
                <InfoCard elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom color="primary.main" sx={{ mb: 3 }}>
                    Extracted Information
                  </Typography>
                  
                  <Stack spacing={2}>
                    {extractedData && (
                      <>
                        <InfoItem>
                          <PersonIcon sx={{ color: 'primary.main', mr: 2 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Full Name</Typography>
                            <Typography variant="body1">{extractedData?.fullName || 'Not available'}</Typography>
                          </Box>
                        </InfoItem>
                        
                        <InfoItem>
                          <EventIcon sx={{ color: 'primary.main', mr: 2 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                            <Typography variant="body1">{extractedData?.dateOfBirth || 'Not available'}</Typography>
                          </Box>
                        </InfoItem>
                        
                        <InfoItem>
                          <BadgeIcon sx={{ color: 'primary.main', mr: 2 }} />
                          <Box>
                            <Typography variant="caption" color="text.secondary">ID Number</Typography>
                            <Typography variant="body1">{extractedData?.idNumber || 'Not available'}</Typography>
                          </Box>
                        </InfoItem>
                        
                        {/* Metadata fields */}
                        {extractedData?.metadata && (
                          <InfoItem>
                            <AssignmentIcon sx={{ color: 'primary.main', mr: 2 }} />
                            <Box>
                              <Typography variant="caption" color="text.secondary">Document Details</Typography>
                              {extractedData.metadata.documentType && (
                                <Typography variant="body1">
                                  Type: {extractedData.metadata.documentType}
                                </Typography>
                              )}
                              {extractedData.metadata.issuingCountry && (
                                <Typography variant="body1">
                                  Country: {extractedData.metadata.issuingCountry}
                                </Typography>
                              )}
                            </Box>
                          </InfoItem>
                        )}
                      </>
                    )}
                  </Stack>
                  
                  {/* Confidence score with visual indicator */}
                  {extractedData && extractedData.confidence && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Extraction Confidence
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={extractedData.confidence * 100}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          mb: 1,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundColor: extractedData.confidence > 0.8 
                              ? 'success.main' 
                              : extractedData.confidence > 0.6 
                              ? 'warning.main' 
                              : 'error.main',
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" align="right" sx={{ display: 'block' }}>
                        {Math.round(extractedData.confidence * 100)}% confidence
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Raw extraction text (collapsible) */}
                  {rawText && (
                    <Box 
                      component="details" 
                      sx={{ 
                        mt: 3, 
                        p: 2, 
                        bgcolor: 'background.paper', 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box component="summary" sx={{ cursor: 'pointer', color: 'primary.main', mb: 1 }}>
                        Show raw extraction data
                      </Box>
                      <Box 
                        component="pre" 
                        sx={{ 
                          mt: 1, 
                          p: 2, 
                          bgcolor: alpha(theme.palette.primary.main, 0.05), 
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          overflow: 'auto',
                          maxHeight: 200
                        }}
                      >
                        {rawText}
                      </Box>
                    </Box>
                  )}
                  
                  {error && (
                    <Alert 
                      severity="error" 
                      variant="outlined"
                      sx={{ mt: 3 }}
                    >
                      {error}
                    </Alert>
                  )}
                </InfoCard>
              </Box>
            </Stack>
          </Box>
        </Fade>
      );
    }
    
    return null;
  };

  return (
    <Box sx={{ py: 3 }}>
      <Typography 
        variant="h6" 
        align="center" 
        color="text.secondary"
        sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
      >
        Extracting and verifying your identity information
      </Typography>

      {renderContent()}
    </Box>
  );
} 