import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Get API key from environment variables
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables');
}

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: true, message: 'No image URL provided' }, { status: 400 });
    }

    if (!prompt) {
      return NextResponse.json({ error: true, message: 'No prompt provided' }, { status: 400 });
    }

    console.log('Processing image URL:', imageUrl.slice(0, 30) + '...');

    // Handle base64 images and regular URLs differently
    const imageContent = imageUrl.startsWith('data:') 
      ? imageUrl // Use the base64 directly
      : { url: imageUrl }; // Use a URL reference
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: imageContent }
          ],
        },
      ],
      max_tokens: 1000,
    });

    console.log('OpenAI response received. Total tokens:', response.usage?.total_tokens);

    // Extract the response text
    const result = response.choices[0].message.content;
    
    // Try to parse as JSON first
    try {
      const jsonResult = JSON.parse(result || '{}');
      return NextResponse.json(jsonResult);
    } catch (e) {
      // If not valid JSON, return the raw text
      return NextResponse.json({ rawText: true, message: result });
    }
  } catch (error: any) {
    console.error('OpenAI Vision API error:', error);
    
    // Handle error responses more gracefully
    const statusCode = error.status || 500;
    const errorMessage = error.message || 'An unknown error occurred';
    
    return NextResponse.json(
      { 
        error: true, 
        message: errorMessage,
        code: error.code || 'unknown_error',
        details: error.response?.data?.error?.message || null 
      }, 
      { status: statusCode }
    );
  }
} 