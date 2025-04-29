'use client';

import { useState, useEffect } from 'react';
import { useDIDContext } from '../../context/DIDContext';
import { 
  Box, 
  Container,
  Typography,
  Paper,
  Stack,
  Chip,
  Divider,
  Avatar,
  Button,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
  IconButton,
  useTheme,
  alpha,
  styled,
  Tab,
  Tabs,
  Alert
} from '@mui/material';
import { 
  VerifiedUser as VerifiedUserIcon,
  AccessTime as AccessTimeIcon,
  Visibility as VisibilityIcon,
  LinkOff as LinkOffIcon,
  ContentCopy as ContentCopyIcon,
  AccountBalanceWallet as WalletIcon,
  Check as CheckIcon,
  Image as ImageIcon,
  Person as PersonIcon,
  Assignment as AssignmentIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

// Styled components for the profile
const ProfileSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius * 2,
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
  }
}));

const GlowingBadge = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-flex',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: '50%',
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.4)} 0%, ${alpha(theme.palette.primary.main, 0)} 70%)`,
    animation: 'pulse 2s infinite',
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(0.95)',
      opacity: 0.7,
    },
    '70%': {
      transform: 'scale(1)',
      opacity: 0.3,
    },
    '100%': {
      transform: 'scale(0.95)',
      opacity: 0.7,
    },
  }
}));

const DataField = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.primary.main, 0.05),
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  }
}));

const ImagePreview = styled(Box)(({ theme }) => ({
  width: '100%',
  height: 250,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
  border: `2px solid ${theme.palette.primary.main}`,
  position: 'relative',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.3s ease',
  },
  '&:hover img': {
    transform: 'scale(1.05)',
  },
  '&:hover .overlay': {
    opacity: 1,
  }
}));

const ImageOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0,
  transition: 'opacity 0.3s ease',
  zIndex: 2,
}));

export default function DIDProfileView() {
  const { state } = useDIDContext();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);
  
  const handleCopyDID = () => {
    const didString = `did:ryt:${state.didData.didIdentifier || state.didData.walletAddress || "0x0"}`;
    navigator.clipboard.writeText(didString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Format timestamp to readable date
  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return 'Not available';
    return new Date(timestamp).toLocaleString();
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        component="h1" 
        gutterBottom 
        sx={{ 
          textAlign: 'center', 
          fontWeight: 700,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 4
        }}
      >
        Your Verified DID Profile
      </Typography>
      
      {/* DID Identifier Card */}
      <ProfileSection sx={{ mb: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
          <GlowingBadge>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80,
                bgcolor: theme.palette.primary.main,
                boxShadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.5)}`
              }}
            >
              <SecurityIcon sx={{ fontSize: 40 }} />
            </Avatar>
          </GlowingBadge>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="overline" color="text.secondary">Decentralized Identifier</Typography>
            <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom>
              {state.didData.fullName || 'Anonymous User'}
            </Typography>
            
            <Box sx={{ 
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 2,
              mt: 1, 
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
              fontFamily: 'monospace',
              fontSize: 'body1.fontSize',
              wordBreak: 'break-all'
            }}>
              <Typography component="span" sx={{ fontWeight: 500 }}>
                did:ryt:{state.didData.didIdentifier || state.didData.walletAddress || "0x0"}
              </Typography>
              <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                <IconButton onClick={handleCopyDID} size="small">
                  {copied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Stack direction="column" spacing={1} alignItems="center">
            <Chip 
              icon={<VerifiedUserIcon />} 
              label="Verified on Blockchain" 
              color="primary" 
              sx={{ fontWeight: 500, px: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              {state.didData.txTimestamp ? formatTimestamp(state.didData.txTimestamp) : 'Not available'}
            </Typography>
          </Stack>
        </Stack>
      </ProfileSection>
      
      {/* Tabs for different sections */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ 
          mb: 3, 
          '& .MuiTab-root': { 
            fontWeight: 500,
            color: 'text.secondary',
            textTransform: 'none',
            minHeight: 48,
            fontSize: '1rem',
          },
          '& .Mui-selected': {
            color: 'primary.main',
            fontWeight: 700,
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderRadius: 3,
          }
        }}
      >
        <Tab icon={<PersonIcon />} label="Identity" iconPosition="start" />
        <Tab icon={<ImageIcon />} label="Documents" iconPosition="start" />
        <Tab icon={<AssignmentIcon />} label="Transaction Details" iconPosition="start" />
        <Tab icon={<WalletIcon />} label="Wallet" iconPosition="start" />
      </Tabs>
      
      {/* Tab Content */}
      <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
        <ProfileSection>
          <Typography variant="h6" gutterBottom color="primary.main" sx={{ mb: 3, fontWeight: 500 }}>
            Identity Information
          </Typography>
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ flex: 1 }}>
              <DataField>
                <PersonIcon sx={{ color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Full Name</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {state.didData.fullName || 'Not available'}
                  </Typography>
                </Box>
              </DataField>
              
              <DataField>
                <AccessTimeIcon sx={{ color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {state.didData.dateOfBirth || 'Not available'}
                  </Typography>
                </Box>
              </DataField>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <DataField>
                <AssignmentIcon sx={{ color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Document Number</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {state.didData.documentNumber || 'Not available'}
                  </Typography>
                </Box>
              </DataField>
              
              <DataField>
                <VerifiedUserIcon sx={{ color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="body2" color="text.secondary">Document Type</Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {state.didData.documentType || 'Not available'}
                  </Typography>
                </Box>
              </DataField>
            </Box>
          </Stack>
          
          {/* Additional extracted details if available */}
          {state.didData.documentDetails && state.didData.documentDetails.metadata && (
            <Box sx={{ mt: 3 }}>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle1" gutterBottom color="text.secondary">
                Additional Details
              </Typography>
              
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                {state.didData.documentDetails.metadata.issuingCountry && (
                  <Box sx={{ flex: 1 }}>
                    <DataField>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Issuing Country</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {state.didData.documentDetails.metadata.issuingCountry}
                        </Typography>
                      </Box>
                    </DataField>
                  </Box>
                )}
                
                {state.didData.documentDetails.metadata.documentType && (
                  <Box sx={{ flex: 1 }}>
                    <DataField>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Document Type</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {state.didData.documentDetails.metadata.documentType}
                        </Typography>
                      </Box>
                    </DataField>
                  </Box>
                )}
                
                {state.didData.documentDetails.gender && (
                  <Box sx={{ flex: 1 }}>
                    <DataField>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Gender</Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {state.didData.documentDetails.gender}
                        </Typography>
                      </Box>
                    </DataField>
                  </Box>
                )}
              </Stack>
            </Box>
          )}
          
          {/* Confidence score if available */}
          {state.didData.documentDetails && state.didData.documentDetails.confidence && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Verification Confidence
              </Typography>
              <LinearProgress
                variant="determinate"
                value={state.didData.documentDetails.confidence * 100}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 1,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    backgroundColor: state.didData.documentDetails.confidence > 0.8 
                      ? 'success.main' 
                      : state.didData.documentDetails.confidence > 0.6 
                      ? 'warning.main' 
                      : 'error.main',
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" align="right" sx={{ display: 'block' }}>
                {Math.round(state.didData.documentDetails.confidence * 100)}% confidence
              </Typography>
            </Box>
          )}
        </ProfileSection>
      </Box>
      
      <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
        <ProfileSection>
          <Typography variant="h6" gutterBottom color="primary.main" sx={{ mb: 3, fontWeight: 500 }}>
            Document Images
          </Typography>
          
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
            {/* ID Document Image */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                ID Document
              </Typography>
              {state.didData.ipfsUrl ? (
                <ImagePreview>
                  <img src={state.didData.ipfsUrl} alt="ID Document" />
                  <ImageOverlay className="overlay">
                    <IconButton
                      sx={{ 
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </ImageOverlay>
                </ImagePreview>
              ) : (
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 250, 
                    borderRadius: 4, 
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed',
                    borderColor: 'grey.300'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No ID image available
                  </Typography>
                </Box>
              )}
              
              {state.didData.ipfsHash && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', wordBreak: 'break-all' }}>
                  IPFS Hash: {state.didData.ipfsHash}
                </Typography>
              )}
            </Box>
            
            {/* Selfie/Liveness Image */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                Liveness Verification
              </Typography>
              {state.didData.livenessImage ? (
                <ImagePreview>
                  <img src={state.didData.livenessImage} alt="Liveness Verification" />
                  <ImageOverlay className="overlay">
                    <IconButton
                      sx={{ 
                        color: 'white',
                        bgcolor: 'rgba(255,255,255,0.2)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </ImageOverlay>
                </ImagePreview>
              ) : (
                <Box 
                  sx={{ 
                    width: '100%', 
                    height: 250, 
                    borderRadius: 4, 
                    bgcolor: 'grey.100',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed',
                    borderColor: 'grey.300'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No selfie image available
                  </Typography>
                </Box>
              )}
              
              {state.didData.livenessTimestamp && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Verified on {formatTimestamp(state.didData.livenessTimestamp)}
                </Typography>
              )}
            </Box>
          </Stack>
        </ProfileSection>
      </Box>
      
      <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
        <ProfileSection>
          <Typography variant="h6" gutterBottom color="primary.main" sx={{ mb: 3, fontWeight: 500 }}>
            Transaction History
          </Typography>
          
          {state.didData.transactionHash ? (
            <Box>
              <Card 
                variant="outlined" 
                sx={{ 
                  mb: 2, 
                  borderRadius: 2,
                  borderColor: alpha(theme.palette.primary.main, 0.3),
                  bgcolor: alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" color="primary">Minting Transaction</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                        {state.didData.transactionHash}
                      </Typography>
                    </Box>
                    <Chip 
                      size="small" 
                      label="Success" 
                      color="success" 
                      variant="outlined" 
                    />
                  </Stack>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Timestamp
                      </Typography>
                      <Typography variant="body2">
                        {formatTimestamp(state.didData.mintingTimestamp)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Token ID
                      </Typography>
                      <Typography variant="body2">
                        {state.didData.tokenId || '49'}
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Box mt={2}>
                    <Button 
                      variant="outlined" 
                      size="small"
                      color="primary"
                      onClick={() => window.open(`http://18.216.102.37:3001/transactions/${state.didData.txHash}`, '_blank')}
                    >
                      View on RYT Explorer
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          ) : (
            <Typography variant="body1" sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
              No transaction history available
            </Typography>
          )}
        </ProfileSection>
      </Box>
      
      <Box sx={{ display: activeTab === 3 ? 'block' : 'none' }}>
        <ProfileSection>
          <Typography variant="h6" gutterBottom color="primary.main" sx={{ mb: 3, fontWeight: 500 }}>
            Wallet Details
          </Typography>
          
          <Stack spacing={3}>
            <DataField>
              <WalletIcon sx={{ color: 'primary.main', mr: 2 }} />
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" color="text.secondary">Connected Address</Typography>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
                  <Typography variant="body1" fontWeight={500} sx={{ wordBreak: 'break-all' }}>
                    {state.didData.walletAddress || 'Not connected'}
                  </Typography>
                  {state.didData.walletAddress && (
                    <Tooltip title="Copy Address">
                      <IconButton 
                        size="small" 
                        onClick={() => {
                          navigator.clipboard.writeText(state.didData.walletAddress);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                      >
                        {copied ? <CheckIcon fontSize="small" color="success" /> : <ContentCopyIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>
              </Box>
            </DataField>
            
            <DataField>
              <VerifiedUserIcon sx={{ color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Network</Typography>
                <Typography variant="body1" fontWeight={500}>
                  RYT Dev Testnet
                </Typography>
              </Box>
            </DataField>
            
            <DataField>
              <LinkOffIcon sx={{ color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="body2" color="text.secondary">Wallet Connection</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body1" fontWeight={500}>
                    {state.didData.walletAddress ? 'Connected' : 'Not Connected'}
                  </Typography>
                  <Chip 
                    size="small" 
                    label={state.didData.walletAddress ? "Active" : "Inactive"} 
                    color={state.didData.walletAddress ? "success" : "default"}
                    variant="outlined"
                  />
                </Stack>
              </Box>
            </DataField>
          </Stack>
        </ProfileSection>
      </Box>
    </Container>
  );
} 