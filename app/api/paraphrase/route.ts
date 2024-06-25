import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    const response = await axios.post(
      'https://api.sapling.ai/api/v1/paraphrase',
      {
        key: process.env.NEXT_PUBLIC_SAPLING_API_KEY,
        text,
        mapping: 'informal_to_formal',
      },
    );

    const data = response.data;
    console.log("data",data)
    return NextResponse.json({ result: data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to paraphrase text', details: error.message }, { status: 500 });
  }
}
