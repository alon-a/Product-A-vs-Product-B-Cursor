import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get('session');
    const userInfoCookie = cookieStore.get('user_info');

    if (!session || !userInfoCookie) {
      return NextResponse.json({ isAuthenticated: false });
    }

    let user = null;
    try {
      user = JSON.parse(userInfoCookie.value || 'null');
    } catch {
      user = null;
    }
    if (!user) {
      return NextResponse.json({ isAuthenticated: false });
    }

    return NextResponse.json({
      isAuthenticated: true,
      user,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { isAuthenticated: false, error: 'Session check failed' },
      { status: 500 }
    );
  }
} 