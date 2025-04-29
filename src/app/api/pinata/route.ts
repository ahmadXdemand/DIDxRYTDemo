import { NextResponse } from "next/server";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwODY1MTdmZi0yMzZlLTRhZTMtYWI5Ni02NDVkZDYxNzAxMjAiLCJlbWFpbCI6ImFobWFkLnNoYWh6YWliQHhkZW1hbmQuYWkiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMTBlNGYzZTgxZjgxNDU1NDZiMDkiLCJzY29wZWRLZXlTZWNyZXQiOiIxYTJhYWU1MDBlZmVjMDg0ZWUwMzE3NDliY2MzOGQ2Njc4YzBhOWQzMWE1NTU4ZjhiYjNmNzA5ZWUwMjc3MmUyIiwiZXhwIjoxNzczMTY1MTM5fQ.Yv15I_v-tlKfJHciGToP9F9nNegnB1gbEQJoyTRhqNY",
  pinataGateway: "https://green-manual-tapir-637.mypinata.cloud/ipfs/"
});

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload
      const data = await request.formData();
      const file: File | null = data.get('file') as unknown as File;

      if (!file) {
        return NextResponse.json({ error: "No file received." }, { status: 400 });
      }

      const responsePinata = await pinata.upload.public.file(file);
      const baseUrl = "https://green-manual-tapir-637.mypinata.cloud/ipfs/"
      const url = baseUrl + responsePinata.cid;

      return NextResponse.json({ success: true, responsePinata, url });
    } else {
      // Handle JSON upload
      const { jsonData } = await request.json();
      const responsePinata = await pinata.upload.public.json(jsonData);
      const baseUrl = "https://green-manual-tapir-637.mypinata.cloud/ipfs/"
      const url = baseUrl + responsePinata.cid;

      return NextResponse.json({ success: true, responsePinata, url });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error uploading to Pinata" },
      { status: 500 }
    );
  }
} 