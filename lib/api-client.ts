import Cookies from "js-cookie";
import type { ApiFailure, ApiSuccess } from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://developerassessmentbackend.vercel.app/api/v1";

export const ACCESS_COOKIE = "dap_access_token";
export const REFRESH_COOKIE = "dap_refresh_token";
export const USER_COOKIE = "dap_user";

export class ApiError extends Error {
  status: number;
  errors: ApiFailure["errors"];
  constructor(message: string, status: number, errors: ApiFailure["errors"] = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body?: any;
  auth?: boolean;
  retry?: boolean;
}

function readCookie(name: string): string | undefined {
  if (typeof document !== "undefined") {
    return Cookies.get(name);
  }
  return undefined;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = readCookie(REFRESH_COOKIE);
  if (!refreshToken) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ApiSuccess<{
      accessToken: string;
      refreshToken: string;
    }>;
    const { accessToken, refreshToken: next } = json.data;
    Cookies.set(ACCESS_COOKIE, accessToken, { expires: 1, sameSite: "lax" });
    Cookies.set(REFRESH_COOKIE, next, { expires: 30, sameSite: "lax" });
    return accessToken;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, auth = true, retry = true, headers, ...rest } = opts;
  const token = auth ? readCookie(ACCESS_COOKIE) : undefined;

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Attempt silent refresh once on 401.
  if (res.status === 401 && auth && retry) {
    const next = await refreshAccessToken();
    if (next) {
      return apiFetch<T>(path, { ...opts, retry: false });
    }
  }

  const json = (await res.json().catch(() => null)) as
    | ApiSuccess<T>
    | ApiFailure
    | null;

  if (!res.ok || !json || json.success === false) {
    const failure = json as ApiFailure | null;
    throw new ApiError(
      failure?.message ?? `Request failed (${res.status})`,
      res.status,
      failure?.errors ?? []
    );
  }
  return (json as ApiSuccess<T>).data;
}

/** Server-side fetch helper (Server Components / middleware-adjacent code). */
export async function serverFetch<T>(
  path: string,
  token: string | undefined,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    cache: "no-store",
  });
  const json = (await res.json().catch(() => null)) as
    | ApiSuccess<T>
    | ApiFailure
    | null;
  if (!res.ok || !json || json.success === false) {
    const failure = json as ApiFailure | null;
    throw new ApiError(
      failure?.message ?? `Request failed (${res.status})`,
      res.status,
      failure?.errors ?? []
    );
  }
  return (json as ApiSuccess<T>).data;
}
