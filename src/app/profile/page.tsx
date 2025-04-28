'use client';

import React from 'react';
import { DIDProvider } from '../../context/DIDContext';
import DIDProfileView from '../../components/did/DIDProfileView';
import { Box, Container, Paper } from '@mui/material';

export default function ProfilePage() {
  return (
    <DIDProvider>
      <Box 
        sx={{ 
          width: '100%',
          minHeight: '100vh',
          padding: { xs: 2, md: 4 },
          backgroundImage: 'radial-gradient(circle at 30% 20%, rgba(120, 74, 244, 0.05) 0%, rgba(120, 74, 244, 0) 50%), radial-gradient(circle at 70% 80%, rgba(120, 74, 244, 0.05) 0%, rgba(120, 74, 244, 0) 50%)',
          backgroundSize: 'cover',
        }}
      >
        <DIDProfileView />
      </Box>
    </DIDProvider>
  );
} 