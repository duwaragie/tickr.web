import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';

const BACKEND_URL = 'http://localhost:5000';

export const GET: RequestHandler = async ({ params, cookies }) => {
  try {
    const token = cookies.get('token');
    if (!token) {
      return json({ error: 'No authentication token found' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/tasks/${params.id}`, {
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

export const PUT: RequestHandler = async ({ params, request, cookies }) => {
  try {
    const token = cookies.get('token');
    if (!token) {
      return json({ error: 'No authentication token found' }, { status: 401 });
    }

    const body = await request.text();

    const response = await fetch(`${BACKEND_URL}/api/tasks/${params.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body
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

export const DELETE: RequestHandler = async ({ params, cookies }) => {
  try {
    const token = cookies.get('token');
    if (!token) {
      return json({ error: 'No authentication token found' }, { status: 401 });
    }

    const response = await fetch(`${BACKEND_URL}/api/tasks/${params.id}`, {
      method: 'DELETE',
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
