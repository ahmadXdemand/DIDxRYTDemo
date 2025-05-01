// Define the creation steps enum
export enum CreationStep {
  WALLET_CONNECTION = 0,
  RECAPTCHA = 1,
  IMAGE_SELECTION = 2,
  LIVENESS_VERIFICATION = 3,
  EXTRACTION = 4,
  VERIFICATION = 5,
  MINTING = 6,
  COMPLETED = 7,
}

// Define the steps configuration
export const steps = [
  { step: CreationStep.WALLET_CONNECTION, label: 'Connect Wallet', progress: 5 },
  { step: CreationStep.RECAPTCHA, label: 'Security Check', progress: 10 },
  { step: CreationStep.IMAGE_SELECTION, label: 'Select ID', progress: 20},
  { step: CreationStep.LIVENESS_VERIFICATION, label: 'Proof of Liveness', progress: 30 },
  { step: CreationStep.EXTRACTION, label: 'Verify Info', progress: 45 },
  { step: CreationStep.VERIFICATION, label: 'Validate Info', progress: 65 },
  { step: CreationStep.MINTING, label: 'Mint DID', progress: 85 },
  { step: CreationStep.COMPLETED, label: 'Complete', progress: 100 }
]; 