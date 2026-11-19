export const API_BASE = (import.meta.env.VITE_API_BASE || import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(url, {
    ...init,
    headers,
    credentials: API_BASE ? 'include' : 'same-origin',
  });

  if (!res.ok) {
    let message = res.status === 429 ? 'Too many requests — please wait a moment.' : `Request failed (${res.status})`;
    let code: string | undefined;
    try {
      const body = await res.json();
      message = body.error ?? body.message ?? message;
      code = body.code;
    } catch {
      // non-JSON error
    }
    throw new ApiError(message, res.status, code);
  }

  if (res.status === 204) return undefined as T;
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }
  return (await res.text()) as unknown as T;
}

export const get = <T>(path: string, init?: RequestInit) => api<T>(path, { ...init, method: 'GET' });
export const post = <T>(path: string, body?: unknown, init?: RequestInit) =>
  api<T>(path, { ...init, method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });
export const del = <T>(path: string, init?: RequestInit) => api<T>(path, { ...init, method: 'DELETE' });
export async function uploadArchive(file: File, accountId: string, onProgress?: (pct: number) => void): Promise<unknown> {
  const form = new FormData();
  form.append('file', file, file.name);
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/api/archive/import?accountId=${encodeURIComponent(accountId)}`);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch {
          resolve(xhr.responseText);
        }
      } else {
        let message = `Request failed (${xhr.status})`;
        try {
          const body = JSON.parse(xhr.responseText);
          message = body.error ?? body.message ?? message;
        } catch {
          // ignore
        }
        reject(new ApiError(message, xhr.status));
      }
    };
    xhr.onerror = () => reject(new ApiError('Network error', 0));
    xhr.send(form);
  });
}