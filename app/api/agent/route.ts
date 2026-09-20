import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt, system } = await req.json();

    // The local OmniRoute API endpoint
    const OMNIROUTE_URL = 'http://127.0.0.1:20128/v1/chat/completions';
    
    const response = await fetch(OMNIROUTE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer dummy-local-key`
      },
      body: JSON.stringify({
        model: 'auto', // Omniroute standard fallback routing
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 150 // Keep it short for fast UI looping
      })
    });

    const data = await response.json();
    return NextResponse.json({ 
      text: data.choices?.[0]?.message?.content || "[NO RESPONSE]"
    });
  } catch (error) {
    console.error("OmniRoute error:", error);
    return NextResponse.json({ text: "[ERR: OMNIROUTE DISCONNECTED OR FAILED]" }, { status: 500 });
  }
}
