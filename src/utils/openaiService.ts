import { IDInformation } from '../types/id';

// Get API key from environment variables
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

export const performOcrWithGPT4o = async (imageUrl: string): Promise<{
  extractedInfo: IDInformation;
  rawText: string;
}> => {
  try {
    console.log('Processing image with GPT-4o:', imageUrl.slice(0, 30) + '...');
    
    // Create the prompt instructing the model what to extract
    const prompt = `Analyze this ID document image and extract the following information in JSON format:
    - fullName: The person's full name
    - dateOfBirth: Date of birth in the format found on the document
    - gender: Gender of the person (M/F, Male/Female)
    - idNumber: ID or document number
    - metadata: Basic information about the document (type of ID, country, etc.)
    
    Return ONLY a valid JSON object with these fields and nothing else. If a field cannot be found, use null.
    Format:
    {
      "fullName": "...",
      "dateOfBirth": "...",
      "gender": "...",
      "idNumber": "...",
      "metadata": {
        "documentType": "...",
        "issuingCountry": "..."
      }
    }`;
    
    console.log('Sending request to vision API endpoint...');
    
    // Send request to OpenAI
    const response = await fetch('/api/openai-vision', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl, prompt }),
    });
    
    console.log('Received response with status:', response.status);
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI Vision API error:', data);
      
      // Special handling for quota errors
      if (data.code === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded. Please check your billing details or try again later.');
      }
      
      throw new Error(`OpenAI API error: ${response.status} - ${data.message || data.details || response.statusText}`);
    }
    
    // If the API returned an error
    if (data.error) {
      console.error('OCR processing failed:', data.message);
      throw new Error(`OCR processing failed: ${data.message}`);
    }
    
    console.log('Successfully received OCR results');
    
    let parsedData;
    let rawText = '';
    
    // Handle different return formats
    if (data.rawText) {
      // Handle plain text response
      console.log('Received raw text response');
      rawText = data.message;
      try {
        // Try to extract JSON from the text
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
          console.log('Successfully extracted JSON from text response');
        } else {
          console.error('No JSON found in response');
          throw new Error('No JSON found in response');
        }
      } catch (e: any) {
        console.error('Failed to parse JSON from text response', e);
        throw new Error('Failed to parse extracted information: ' + e.message);
      }
    } else {
      // Regular JSON response
      try {
        console.log('Received JSON response');
        parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        rawText = JSON.stringify(parsedData, null, 2);
        console.log('Successfully parsed JSON data');
      } catch (e: any) {
        console.error('Failed to parse JSON response', e);
        throw new Error('Failed to parse extracted information: ' + e.message);
      }
    }
    
    console.log('Extracted info:', JSON.stringify(parsedData, null, 2).slice(0, 100) + '...');
    
    // Ensure the parsed data has the expected structure
    const extractedInfo: IDInformation = {
      fullName: parsedData.fullName || '',
      dateOfBirth: parsedData.dateOfBirth || '',
      gender: parsedData.gender || '',
      idNumber: parsedData.idNumber || '',
      metadata: parsedData.metadata || {
        fileType: 'image',
        fileSize: 'unknown'
      },
      rawText: rawText,
      confidence: 0.92 // Placeholder confidence - in reality should come from the model
    };
    
    return {
      extractedInfo,
      rawText
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw error;
  }
}; 