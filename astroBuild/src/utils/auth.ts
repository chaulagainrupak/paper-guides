
import { API_URL } from './config';

export async function isLoggedIn(): Promise<boolean> {
  const accessToken = localStorage.getItem('authToken');
  if (!accessToken) return false;
  try {
    const response = await fetch(API_URL + '/validateToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: accessToken,
    });
    if (response.status === 200) return true;
    localStorage.removeItem('authToken');
    return false;
  } catch {
    localStorage.removeItem('authToken');
    return false;
  }
}

export async function getRole(): Promise<string | null> {
  const accessToken = localStorage.getItem('authToken');
  if (!accessToken) return null;
  try {
    const response = await fetch(API_URL + '/validateToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: accessToken,
    });
    if (response.status === 200) {
      const result = await response.json();
      return result[0]['role'];
    }
    localStorage.removeItem('authToken');
    return null;
  } catch {
    localStorage.removeItem('authToken');
    return null;
  }
}

export function logOut(): void {
  localStorage.removeItem('authToken');
  alert('Logged Out');
}

