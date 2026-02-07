import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || '',
      },
      credentials: 'include',
    });

    const data = await response.json();

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
    console.error('Logout proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
