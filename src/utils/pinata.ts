// Get Pinata JWT from environment variables
const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwODY1MTdmZi0yMzZlLTRhZTMtYWI5Ni02NDVkZDYxNzAxMjAiLCJlbWFpbCI6ImFobWFkLnNoYWh6YWliQHhkZW1hbmQuYWkiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMTBlNGYzZTgxZjgxNDU1NDZiMDkiLCJzY29wZWRLZXlTZWNyZXQiOiIxYTJhYWU1MDBlZmVjMDg0ZWUwMzE3NDliY2MzOGQ2Njc4YzBhOWQzMWE1NTU4ZjhiYjNmNzA5ZWUwMjc3MmUyIiwiZXhwIjoxNzczMTY1MTM5fQ.Yv15I_v-tlKfJHciGToP9F9nNegnB1gbEQJoyTRhqNY";
const PINATA_GATEWAY = process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://green-manual-tapir-637.mypinata.cloud/ipfs/";

/**
 * Upload an image to Pinata IPFS
 * @param file The file to upload
 * @returns Promise with the IPFS URL
 */
export const uploadImageToPinata = async (file: File): Promise<string> => {
  // For development/demo - return a fixed IPFS URL if JWT not set
  if (!PINATA_JWT) {
    console.warn('Pinata JWT not set, using mock URL for development');
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `${PINATA_GATEWAY}bafkreiaapyrob3rqaxquyfd7lh4wclbtm5ooynxms5y23izagctpboe2zq`;
  }

  try {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    const metadata = JSON.stringify({
      name: file.name,
    });
    formData.append('pinataMetadata', metadata);
    
    const options = JSON.stringify({
      cidVersion: 0
    });
    formData.append('pinataOptions', options);
    
    // Make API request to Pinata using JWT authentication
    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PINATA_JWT}`
      },
      body: formData,
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.error || 'Failed to upload to Pinata');
    }
    
    return `${PINATA_GATEWAY}${data.IpfsHash}`;
  } catch (error) {
    console.error('Pinata upload error:', error);
    throw error;
  }
}; 