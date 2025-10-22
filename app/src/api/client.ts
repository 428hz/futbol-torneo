import { Platform } from 'react-native';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'web' ? 'http://localhost:4000' : 'http://10.0.2.2:4000');

let authToken: string | null = null;

export const setToken = (token: string | null) => {
  authToken = token;
  if (typeof window !== 'undefined' && window.localStorage) {
    if (token) localStorage.setItem('auth_token', token);
    else localStorage.removeItem('auth_token');
  }
};

export const loadTokenFromStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const t = localStorage.getItem('auth_token');
    authToken = t;
    return t;
  }
  return null;
};

type Options = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  auth?: boolean;
};

async function request<T>(path: string, opts: Options = {}): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };
  if (opts.auth && authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }
  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} - ${text}`);
  }
  // algunos endpoints pueden devolver 204
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) return {} as T;
  return (await res.json()) as T;
}

export const api = {
  get: <T>(path: string, auth = true) => request<T>(path, { auth }),
  post: <T>(path: string, body: any, auth = true) =>
    request<T>(path, { method: 'POST', body, auth }),
  put: <T>(path: string, body: any, auth = true) =>
    request<T>(path, { method: 'PUT', body, auth }),
  del: <T>(path: string, auth = true) =>
    request<T>(path, { method: 'DELETE', auth }),
  baseUrl: BASE_URL,
};