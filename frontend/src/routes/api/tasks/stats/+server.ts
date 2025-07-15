import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

const BACKEND_URL = 'http://localhost:5000';

export const GET: RequestHandler = async ({ cookies }) => {
  try {
    const token = cookies.get('token');
    if (!token) {
      return json({ error: 'No authentication token found' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/tasks/stats`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.text();
      return json({ error }, { status: response.status });
    }

    const data = await response.json();
    return json(data);
  } catch (error) {
    console.error('API Error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
