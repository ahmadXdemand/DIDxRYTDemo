// Define the creation steps enum
export enum CreationStep {
  WALLET_CONNECTION = 0,
  IMAGE_SELECTION = 1,
  LIVENESS_VERIFICATION = 2,
  EXTRACTION = 3,
  VERIFICATION = 4,
  MINTING = 5,
  COMPLETED = 6,
  
}

// Define the steps configuration
export const steps = [
  { step: CreationStep.WALLET_CONNECTION, label: 'Connect Wallet', progress: 10 },
  { step: CreationStep.IMAGE_SELECTION, label: 'Select ID', progress: 20},
  { step: CreationStep.LIVENESS_VERIFICATION, label: 'Proof of Liveness', progress: 30 },
  { step: CreationStep.EXTRACTION, label: 'Verify Info', progress: 40 },
  { step: CreationStep.VERIFICATION, label: 'Validate Info', progress: 60 },
  { step: CreationStep.MINTING, label: 'Mint DID', progress: 80 },
  { step: CreationStep.COMPLETED, label: 'Complete', progress: 100 }
  
]; 