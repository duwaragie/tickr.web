import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

const BACKEND_URL = 'http://localhost:5000';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    const body = await request.text();

    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body
    });

    if (!response.ok) {
      const error = await response.json();
      return json(error, { status: response.status });
    }

    const data = await response.json();
    
    // If login successful, set the token as a cookie
    if (data.token) {
      cookies.set('token', data.token, {
        path: '/',
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });
    }

    return json(data);
  } catch (error) {
    console.error('API Error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
