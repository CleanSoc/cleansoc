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
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(path, {
    ...init,
    headers,
    credentials: 'same-origin',
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

  if (res.status === 204) return null as T;
  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return (await res.text()) as unknown as T;
  return (await res.json()) as T;
}

export const get = <T>(path: string) => api<T>(path);
export const post = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) });
export const del = <T>(path: string) => api<T>(path, { method: 'DELETE' });

/** Uploads a ZIP with progress events (fetch has no upload progress). */
export function uploadArchive(
  file: File,
  accountId: string,
  onProgress: (percent: number) => void,
): Promise<import('./types').ArchiveImport> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/archive/import?accountId=${encodeURIComponent(accountId)}`);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      let body: any = null;
      try {
        body = JSON.parse(xhr.responseText);
      } catch {
        body = null;
      }
      if (xhr.status >= 200 && xhr.status < 300) resolve(body);
      else reject(new ApiError(body?.error ?? 'Upload failed', xhr.status, body?.code));
    };
    xhr.onerror = () => reject(new ApiError('Upload failed — check your connection.', 0));
    const form = new FormData();
    form.append('archive', file, file.name);
    xhr.send(form);
  });
}
