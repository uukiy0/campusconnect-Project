export function getToken() {
  return localStorage.getItem('campus-token') || '';
}

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem('campus-user') || 'null');
  } catch {
    return null;
  }
}

export function saveSession(data) {
  localStorage.setItem('campus-token', data.token);
  localStorage.setItem('campus-user', JSON.stringify(data.user));
}

export function clearSession() {
  localStorage.removeItem('campus-token');
  localStorage.removeItem('campus-user');
}

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(path, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }
  return data;
}
