export interface IDInformation {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  idNumber: string;
  metadata: {
    documentType?: string;
    issuingCountry?: string;
    fileType?: string;
    fileSize?: string;
    [key: string]: any;
  };
  rawText?: string;
  confidence?: number;
} 