import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Map frontend field names to backend expectations
    const backendBody = {
      username: body.name, // frontend sends 'name', backend expects 'username'
      email: body.email,
      password: body.password,
    };

    const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendBody),
      credentials: 'include',
    });

    const responseText = await response.text();
    
    let data;
    if (response.ok) {
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', parseError);
        data = { error: 'Invalid response from backend' };
      }
    } else {
      // For error responses, map backend error structure to frontend expected format
      try {
        data = JSON.parse(responseText);
        // Backend returns: { success: false, statusCode: 409, message: "User already exists", data: null }
        // Frontend expects: { error: "User already exists" }
        if (data.message) {
          data = { error: data.message };
        }
      } catch {
        data = { error: responseText };
      }
    }

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
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
    console.error('Signup proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
