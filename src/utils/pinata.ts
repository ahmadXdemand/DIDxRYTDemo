export const uploadImageToPinata = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const pinataResponse = await fetch('/api/pinata', {
    method: 'POST',
    body: formData,
  });
  
  if (!pinataResponse.ok) {
    throw new Error('Failed to upload image to Pinata');
  }
  
  const pinataData = await pinataResponse.json();
  return pinataData.url;
}; 