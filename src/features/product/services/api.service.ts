/**
 * api.service.ts
 * Uses existing global API instance
 */

import { API } from '@/src/app/lib/api'; // ✅ your existing global axios instance

export const api = {
  get: <T>(path: string) =>
    API.get<T>(path).then(res => res.data),

  post: <T>(path: string, body: unknown) =>
    API.post<T>(path, body).then(res => res.data),

  patch: <T>(path: string, body: unknown) =>
    API.patch<T>(path, body).then(res => res.data),

  delete: <T>(path: string, body?: unknown) =>
    API.delete<T>(path, { data: body }).then(res => res.data),
};