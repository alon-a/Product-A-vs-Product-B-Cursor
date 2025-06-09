import { NextResponse } from 'next/server';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { success: false, error: 'No credential provided' },
        { status: 400 }
      );
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Here you would typically:
    // 1. Check if the user exists in your database
    // 2. Create a new user if they don't exist
    // 3. Create a session
    // For now, we'll just return the user info
    const user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };

    // Set session and user_info cookies
    const response = NextResponse.json({ success: true, user });
    response.cookies.set('session', 'dummy-session-token', {
      httpOnly: true,
      secure: false, // Always false for localhost/dev
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
    });
    response.cookies.set('user_info', JSON.stringify(user), {
      httpOnly: false, // Must be readable by the browser for /api/auth/session
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 10,
    });

    return response;
  } catch (error) {
    console.error('Google authentication error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
} 