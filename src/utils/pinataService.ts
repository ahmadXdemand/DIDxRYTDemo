// Get Pinata API credentials from environment variables
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

interface PinataResponse {
  success: boolean;
  pinataUrl?: string;
  error?: string;
}

/**
 * Upload a file to IPFS via Pinata
 * @param file The file to upload
 * @returns Promise with upload result
 */
const uploadToPinata = async (file: File): Promise<PinataResponse> => {
  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        type: file.type,
        size: file.size,
        timestamp: Date.now()
      }
    });
    formData.append('pinataMetadata', metadata);
    
    const options = JSON.stringify({
      cidVersion: 0
    });
    formData.append('pinataOptions', options);
    
    // Check if we have API credentials
    if (!PINATA_API_KEY || !PINATA_API_SECRET) {
      console.warn('Pinata API credentials not set. Using demo mode.');
      
      // Simulate upload in demo mode
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        success: true,
        pinataUrl: `https://green-manual-tapir-637.mypinata.cloud/ipfs/bafkreiaapyrob3rqaxquyfd7lh4wclbtm5ooynxms5y23izagctpboe2zq`
      };
    }
    
    // Make API request to Pinata
    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET
      },
      body: formData,
    });
    
    const data = await res.json();
    
    if (res.ok) {
      // Successful upload
      return {
        success: true,
        pinataUrl: `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`
      };
    } else {
      // API error
      console.error('Pinata upload error:', data);
      return {
        success: false,
        error: data.error || 'Failed to upload to Pinata'
      };
    }
  } catch (error: any) {
    // Exception
    console.error('Pinata service error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error uploading to Pinata'
    };
  }
};

export default uploadToPinata; 