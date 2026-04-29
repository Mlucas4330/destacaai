import { get } from "./localStorage";

export const BASE_URL = import.meta.env.VITE_API_URL as string;

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  body?: unknown
  requiresAuth?: boolean
}

export const fetchApi = async <T>({
  method,
  path,
  body,
  requiresAuth = true,
}: RequestOptions): Promise<T> => {
  const headers: Record<string, string> = {};

  if (requiresAuth) {
    const token = await get('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  let requestBody: BodyInit | undefined;

  if (body instanceof FormData) {
    requestBody = body;
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    requestBody = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: requestBody,
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null);
    const message = errorBody?.message ?? errorBody?.error ?? res.statusText;
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return res.json() as Promise<T>;
};