import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    let data;
    if (!response.ok) {
      const responseText = await response.text();
      try {
        data = JSON.parse(responseText);
        // Backend returns: { success: false, statusCode: 401, message: "Invalid credentials", data: null }
        // Frontend expects: { error: "Invalid credentials" }
        if (data.message) {
          data = { error: data.message };
        }
      } catch {
        data = { error: responseText };
      }
    } else {
      data = await response.json();
    }

    // Forward cookies from backend to client
    const cookies = response.headers.get('set-cookie');
    if (cookies) {
      const headers = new Headers();
      headers.set('set-cookie', cookies);
      return NextResponse.json(data, { status: response.status, headers });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Login proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
