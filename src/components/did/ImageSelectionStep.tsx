'use client';

import { useState, useEffect } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';
import Image from 'next/image';
import { useDIDContext } from '../../context/DIDContext';
import { uploadImageToPinata } from '../../utils/pinata';

// Material UI imports
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  CircularProgress, 
  Alert, 
  Fade, 
  Backdrop,
  useTheme,
  alpha,
  styled,
  Chip,
  Divider,
  Stack,
  Tooltip
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  FileUpload as FileUploadIcon,
  CheckCircle as CheckCircleIcon,
  ChangeCircle as ChangeCircleIcon,
  PhotoCamera as PhotoCameraIcon,
  SkipNext as SkipNextIcon,
  InfoOutlined as InfoOutlinedIcon
} from '@mui/icons-material';

// Styled components
const DropzoneContainer = styled(Paper)(({ theme }) => ({
  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
  borderRadius: theme.shape.borderRadius * 2,
  padding: theme.spacing(4),
  cursor: 'pointer',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 220,
  transition: 'all 0.3s ease-in-out',
  background: alpha(theme.palette.primary.main, 0.03),
  '&:hover': {
    borderColor: theme.palette.primary.main,
    background: alpha(theme.palette.primary.main, 0.05),
  },
}));

const ImagePreviewContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  maxWidth: 480,
  height: 280,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: theme.shadows[8],
  transition: 'transform 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
  }
}));

const PreviewOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(to bottom, rgba(0,0,0,0) 60%, rgba(0,0,0,0.7) 100%)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  padding: theme.spacing(2),
  zIndex: 1,
}));

// Add a new styled component for the skip button
const SkipButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(1),
  borderRadius: theme.shape.borderRadius * 4,
  backgroundColor: 'transparent',
  color: theme.palette.grey[600],
  border: `1px solid ${theme.palette.grey[300]}`,
  '&:hover': {
    backgroundColor: alpha(theme.palette.grey[500], 0.1),
    borderColor: theme.palette.grey[400],
  },
}));

export default function ImageSelectionStep() {
  const { state, updateDIDData, markStepAsCompleted, skipIDVerification } = useDIDContext();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(state.didData.imageData || null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(state.didData.ipfsUrl || null);
  const theme = useTheme();

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
    <Box sx={{ py: 2 }}>
      <Typography 
        variant="h6" 
        align="center" 
        color="text.secondary" 
        sx={{ mb: 4, fontWeight: 400 }}
      >
        Please upload a photo of your government-issued ID
      </Typography>
      
      {!selectedImage ? (
        <Fade in={!selectedImage}>
          <Box sx={{ mb: 4 }}>
            <DropzoneContainer
              {...getRootProps()}
              elevation={0}
              sx={{
                borderColor: isDragActive ? 'primary.main' : isDragAccept ? 'success.main' : 'divider',
                backgroundColor: isDragActive ? alpha(theme.palette.primary.main, 0.08) : 
                                isDragAccept ? alpha(theme.palette.success.main, 0.08) : undefined,
              }}
            >
              <input {...getInputProps()} />
              <Box 
                sx={{ 
                  mb: 2, 
                  p: 1.5, 
                  borderRadius: '50%', 
                  backgroundColor: alpha(theme.palette.primary.main, 0.1) 
                }}
              >
                <FileUploadIcon 
                  sx={{ 
                    fontSize: 40, 
                    color: 'primary.main',
                    animation: isDragActive ? 'pulse 1.5s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { opacity: 0.6 },
                      '50%': { opacity: 1 },
                      '100%': { opacity: 0.6 }
                    }
                  }} 
                />
              </Box>
              <Typography variant="subtitle1" color="text.primary" fontWeight={500} gutterBottom>
                Drag & drop an ID document here, or click to select
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported formats: JPEG, PNG
              </Typography>
              <Chip 
                label="Select File" 
                color="primary" 
                icon={<PhotoCameraIcon />} 
                variant="outlined" 
                sx={{ mt: 2 }} 
              />
            </DropzoneContainer>
            
            {/* Skip Verification option */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
              <Divider sx={{ width: '80%', mb: 3 }}>
                <Typography variant="caption" color="text.secondary">OR</Typography>
              </Divider>
              
              <Stack direction="column" spacing={1} alignItems="center">
                <Tooltip 
                  title="Skip ID verification and use demo data. Your verification score will be lower." 
                  arrow
                  placement="top"
                >
                  <SkipButton
                    onClick={skipIDVerification}
                    startIcon={<SkipNextIcon />}
                    endIcon={<InfoOutlinedIcon fontSize="small" />}
                    size="large"
                  >
                    Skip ID Verification
                  </SkipButton>
                </Tooltip>
                <Typography variant="caption" color="text.secondary" align="center" sx={{ maxWidth: 400 }}>
                  Note: Skipping ID verification will result in a lower security score 
                  and will use demo data instead of your real information.
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Fade>
      ) : (
        <Fade in={!!selectedImage}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <ImagePreviewContainer elevation={6}>
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image
                  src={selectedImage}
                  alt="Selected ID"
                  fill
                  style={{ objectFit: 'contain' }}
                />
                <PreviewOverlay>
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    startIcon={<ChangeCircleIcon />}
                    onClick={() => {
                      setSelectedImage(null);
                      setSelectedFile(null);
                      setIpfsUrl(null);
                    }}
                    sx={{ 
                      alignSelf: 'flex-end', 
                      backdropFilter: 'blur(4px)',
                      backgroundColor: alpha(theme.palette.primary.main, 0.8),
                      '&:hover': {
                        backgroundColor: theme.palette.primary.main
                      }
                    }}
                  >
                    Change
                  </Button>
                </PreviewOverlay>
              </Box>
            </ImagePreviewContainer>
            
            {!ipfsUrl && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                onClick={handleUpload}
                disabled={isUploading || !selectedFile}
                sx={{ 
                  mt: 2, 
                  minWidth: 180,
                  py: 1.5,
                }}
              >
                {isUploading ? 'Uploading...' : 'Upload Image'}
              </Button>
            )}
            
            {uploadError && (
              <Alert 
                severity="error" 
                sx={{ mt: 2, width: '100%', maxWidth: 480 }}
                variant="filled"
              >
                {uploadError}
              </Alert>
            )}
            
            {ipfsUrl && (
              <Fade in={!!ipfsUrl}>
                <Box sx={{ mt: 0, p: 1, width: '100%', maxWidth: 480, textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <CheckCircleIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" color="success.main" fontWeight={500}>
                      Uploaded successfully
                    </Typography>
                  </Box>
                  {/* below code is not needed */}
                  {/* <Divider sx={{ my: 2 }} /> */}
                  {/* <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.success.main, 0.1), borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                      {ipfsUrl}
                    </Typography>
                  </Box> */}
                  {/* <Chip 
                    label="ID Image Stored on IPFS" 
                    color="success" 
                    icon={<CheckCircleIcon />} 
                    variant="outlined" 
                    sx={{ mt: 2 }} 
                  /> */}
                </Box>
              </Fade>
            )}
          </Box>
        </Fade>
      )}

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={isUploading}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <CircularProgress color="inherit" />
          <Typography sx={{ mt: 2 }}>Uploading to IPFS...</Typography>
        </Box>
      </Backdrop>
    </Box>
  );
} 