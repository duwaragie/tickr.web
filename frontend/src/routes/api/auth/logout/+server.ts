import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ cookies }) => {
  try {
    // Clear the authentication cookie
    cookies.delete('token', { path: '/' });
    
    return json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout Error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
