/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Application from 'expo-application';
import { Alert, Platform } from 'react-native';

export type SearchParams = {
  voterId?: string;
  name?: string;
  husband_father_name?: string;
  gender?: 'M' | 'F' | string;
  age?: string | number;
  mobile?: string;
};

export type Voter = {
  id?: string | number | null;
  voter_code: string;
  name: string;
  husband_father_name: string;
  mobile: string;
  house_number: string;
  age: number;
  gender: 'M' | 'F' | string;
  image_name?: string;
  section_name?: string;
  main_town_village?: string;
  police_station?: string;
  taluka?: string;
  district?: string;
  pin_code?: string;
};

type APIResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const ENDPOINT = '/api/voter/search';

// Tunables
const DEFAULT_TIMEOUT_MS = 12_000;
const BASE_BACKOFF_MS = 300;
const MAX_BACKOFF_MS = 6_000;
const RETRY_STATUS = new Set([429, 502, 503, 504]);
const MAX_RETRIES = 2;

export type ApiErrorCode =
  | 'CONFIG'
  | 'TIMEOUT'
  | 'NETWORK'
  | 'RATE_LIMIT'
  | 'AUTH'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'HTTP_ERROR'
  | 'PARSING'
  | 'UNEXPECTED_FORMAT'
  | 'MALFORMED_API'
  | 'API_FAIL'
  | 'NO_DATA'
  | 'BAD_DATA_TYPE'
  | 'INVALID_VOTER'
  | 'UNKNOWN';

export class ApiError extends Error {
  status?: number;
  code: ApiErrorCode;
  retriable: boolean;
  payload?: unknown;
  requestId?: string;
  // @ts-ignore
  cause?: unknown;

  constructor(
    msg: string,
    opts?: {
      status?: number;
      code?: ApiErrorCode;
      retriable?: boolean;
      cause?: unknown;
      payload?: unknown;
      requestId?: string;
    }
  ) {
    super(msg);
    this.name = 'ApiError';
    this.status = opts?.status;
    this.code = opts?.code ?? 'UNKNOWN';
    this.retriable = !!opts?.retriable;
    this.payload = opts?.payload;
    this.requestId = opts?.requestId;
    // @ts-ignore
    if (opts?.cause) this.cause = opts.cause;
  }
}

/** Small helpers */
const trimmedBase = () => {
  if (!BASE_URL) {
    throw new ApiError('EXPO_PUBLIC_API_URL is not configured.', { code: 'CONFIG' });
  }
  return BASE_URL.replace(/\/+$/, '');
};

const url = () => `${trimmedBase()}${ENDPOINT}`;

function buildPayload(obj: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj ?? {})) {
    if (v !== '' && v !== undefined && v !== null) payload[k] = v;
  }
  return payload;
}

function isApiResponse<T>(x: any): x is APIResponse<T> {
  return x && typeof x === 'object' && typeof x.success === 'boolean' && 'data' in x;
}

function isVoterArray(x: any): x is Voter[] {
  return Array.isArray(x) && x.every(v => v && typeof v === 'object' && typeof v.voter_code === 'string');
}

/** Parse body safely */
async function parseBodySafe(res: Response): Promise<any | undefined | string> {
  const ct = res.headers.get('content-type') || '';
  const hasBody = res.status !== 204;
  if (!hasBody) return undefined;

  if (ct.includes('application/json')) {
    try {
      const txt = await res.text();
      if (!txt) return undefined;
      return JSON.parse(txt);
    } catch (e) {
      throw new ApiError('Failed to parse JSON from server.', {
        status: res.status,
        code: 'PARSING',
        cause: e,
      });
    }
  } else {
    const t = await res.text().catch(() => '');
    return t?.slice(0, 2000);
  }
}

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

function jitter(ms: number) {
  const delta = ms * 0.3;
  return Math.max(0, ms + (Math.random() * 2 - 1) * delta);
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit & { timeoutMs?: number } = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), init.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

/** RN/Hermes friendly abort detection */
function isAbortError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as any;
  return e.name === 'AbortError' || (typeof e.message === 'string' && /abort/i.test(e.message));
}

function retryAfterMs(res?: Response) {
  if (!res) return undefined;
  const ra = res.headers.get('Retry-After');
  if (!ra) return undefined;
  const secs = Number(ra);
  return Number.isFinite(secs) ? secs * 1000 : undefined;
}

function shouldRetry(err: unknown, res?: Response) {
  if (res && RETRY_STATUS.has(res.status)) return true;
  if (isAbortError(err)) return true;
  if (err instanceof TypeError) return true;
  return false;
}

export type FetchOpts = {
  timeoutMs?: number;
  retries?: number;
  allowEmpty?: boolean;
};

export async function fetchVoterList(
  search?: SearchParams,
  opts?: FetchOpts
): Promise<Voter[]> {

  const androidId = await Application.getAndroidId();
  if (!androidId) {
    throw new ApiError('ANDROID_ID unavailable — must run on Android.', { code: 'CONFIG' });
  }

  const payload = buildPayload({
    androidId,
    voterId: search?.voterId,
    name: search?.name,
    fatherName: search?.husband_father_name,
    gender: search?.gender,
    age: search?.age,
    mobile: search?.mobile,
  });

  const target = url();

  let attempt = 0;
  const maxRetries = Math.max(0, opts?.retries ?? MAX_RETRIES);
  const allowEmpty = opts?.allowEmpty ?? true;
  let lastErr: unknown;
  let requestId: string | undefined;

  while (attempt <= maxRetries) {
    let res: Response | undefined;
    try {
      res = await fetchWithTimeout(target, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        timeoutMs: opts?.timeoutMs,
      });

      requestId = res.headers.get('x-request-id') ?? res.headers.get('x-amzn-requestid') ?? undefined;
      const body = await parseBodySafe(res);

      if (!res.ok) {
        const fromJson =
          typeof body === 'object' && body ? (body as any).message as string | undefined : undefined;

        const status = res.status;
        let code: ApiErrorCode = 'HTTP_ERROR';
        let retriable = RETRY_STATUS.has(status);

        if (status === 401) code = 'AUTH';
        else if (status === 403) code = 'FORBIDDEN';
        else if (status === 404) code = 'NOT_FOUND';
        else if (status === 429) { code = 'RATE_LIMIT'; retriable = true; }

        const err = new ApiError(fromJson || `Server error ${status}${res.statusText ? ` ${res.statusText}` : ''}`, {
          status,
          code,
          retriable,
          payload: typeof body === 'string' ? { text: body } : body,
          requestId,
        });

        if (attempt < maxRetries && shouldRetry(err, res)) {
          attempt++;
          const serverDelay = retryAfterMs(res);
          const backoff = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * attempt * attempt);
          const wait = serverDelay ?? jitter(backoff);
          await delay(wait);
          continue;
        }
        throw err;
      }

      if (typeof body !== 'object') {
        if (body === undefined && allowEmpty) return [];
        throw new ApiError('Unexpected response format from server.', {
          code: 'UNEXPECTED_FORMAT',
          payload: body,
          requestId,
        });
      }

      if (!isApiResponse<any>(body)) {
        throw new ApiError('Malformed API response.', {
          code: 'MALFORMED_API',
          payload: body,
          requestId,
        });
      }

      // handle Access Denied shape
      if (
        body &&
        body.success === true &&
        body.data &&
        typeof body.data === 'object' &&
        'is_accessible' in body.data &&
        (body.data as any).is_accessible === 0
      ) {
        throw new ApiError(body.message || 'Access denied for this Android ID.', {
          code: 'FORBIDDEN',
          payload: body,
          requestId,
        });
      }

      if (!body.success) {
        throw new ApiError(body.message || 'Request failed.', {
          code: 'API_FAIL',
          payload: body,
          requestId,
        });
      }

      if (!('data' in body)) {
        throw new ApiError('Response missing data.', { code: 'NO_DATA', payload: body, requestId });
      }

      if (!Array.isArray(body.data)) {
        throw new ApiError('Expected a list of voters.', {
          code: 'BAD_DATA_TYPE',
          payload: body.data,
          requestId,
        });
      }

      if (!isVoterArray(body.data)) {
        if (body.data.length === 0) {
          if (allowEmpty) return [];
          throw new ApiError(body.message || 'No voters found.', { code: 'NO_DATA', payload: body, requestId });
        }
        throw new ApiError('Voter list contains invalid entries.', {
          code: 'INVALID_VOTER',
          payload: body.data,
          requestId,
        });
      }

      if (body.data.length === 0) {
        if (allowEmpty) return [];
        throw new ApiError(body.message || 'No voters found.', { code: 'NO_DATA', payload: body, requestId });
      }

      return body.data as Voter[];
    } catch (err) {
      lastErr = err;
      const normalized = normalizeUnknownError(err, requestId);
      if (attempt < maxRetries && shouldRetry(normalized)) {
        attempt++;
        const backoff = Math.min(MAX_BACKOFF_MS, BASE_BACKOFF_MS * attempt * attempt);
        await delay(jitter(backoff));
        continue;
      }
      throw normalized;
    }
  }

  const normalized = normalizeUnknownError(lastErr);
  throw normalized;
}

export function getVoterFromList(list: Voter[], voter_code: string) {
  return list.find(v => v.voter_code === voter_code);
}

function normalizeUnknownError(err: unknown, requestId?: string): ApiError {
  if (err instanceof ApiError) return err;
  if (isAbortError(err)) {
    return new ApiError('The request timed out. Please try again.', {
      code: 'TIMEOUT',
      retriable: true,
      cause: err as any,
      requestId,
    });
  }
  if (err instanceof TypeError) {
    return new ApiError('Network error. Check your connection and try again.', {
      code: 'NETWORK',
      retriable: true,
      cause: err,
      requestId,
    });
  }
  return new ApiError('Unexpected error while fetching voters.', {
    code: 'UNKNOWN',
    cause: err,
    requestId,
  });
}

export function errorToUserMessage(err: unknown): string {
  const e = normalizeUnknownError(err);

  switch (e.code) {
    case 'TIMEOUT':
      return 'Taking too long — please try again.';
    case 'NETWORK':
      return 'You seem to be offline. Check your connection.';
    case 'RATE_LIMIT':
      return 'Too many requests right now. Please retry in a moment.';
    case 'AUTH':
      return 'Your session expired. Please sign in again.';
    case 'FORBIDDEN':
      // 🔥 Custom alert for unauthorized devices
      if (Platform.OS === 'android') {
        (async () => {
          try {
            const androidId = await Application.getAndroidId();
            if (androidId) {
              Alert.alert(
                'Access Denied',
                `This device is not authorized to use the app.\n\nAndroid ID:\n${androidId}`
              );
            } else {
              Alert.alert(
                'Access Denied',
                'This device is not authorized to use the app.\n(Android ID not available)'
              );
            }
          } catch {
            Alert.alert(
              'Access Denied',
              'This device is not authorized to use the app.\n(Failed to read Android ID)'
            );
          }
        })();
      } else {
        Alert.alert(
          'Access Denied',
          'This device is not authorized to use the app.'
        );
      }
      return 'You don’t have access to this resource.';
    case 'NOT_FOUND':
      return 'We could not find what you’re looking for.';
    case 'PARSING':
    case 'MALFORMED_API':
    case 'UNEXPECTED_FORMAT':
      return 'The server sent something we could not read.';
    default:
      return 'Something went wrong. Please try again.';
  }
}
