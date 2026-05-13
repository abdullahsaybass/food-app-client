/**
 * api.service.ts
 * Central API client — all requests go through here.
 * Replace BASE_URL with your environment variable / config.
 */

import { useAuthStore } from '../../auth/store/auth.store';

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://your-api.com';

/** Attach the JWT from auth store and throw on non-2xx */
async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = useAuthStore.getState().token;

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try { message = (await res.json()).message ?? message; } catch { /* ignore */ }
    throw new Error(message);
  }

  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string)                        => request<T>(path),
  post:   <T>(path: string, body: unknown)         => request<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown)         => request<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(path: string, body?: unknown)        => request<T>(path, { method: 'DELETE', body: body ? JSON.stringify(body) : undefined }),
};
