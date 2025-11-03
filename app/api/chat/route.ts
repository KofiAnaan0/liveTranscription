import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    const response = await fetch('http://127.0.0.1:8080/completion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        n_predict: 512, // max tokens to generate
        temperature: 0.7,
        top_p: 0.9,
        stream: false,
      }),
    });

    const data = await response.json();
    return NextResponse.json({ response: data.content });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to get response' },
      { status: 500 }
    );
  }
}