// app/lib/api.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

export type SearchParams = {
  voterId?: string;
  name?: string;
  husband_father_name?: string;
  gender?: 'M' | 'F' | '';
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
const ENDPOINT = '/voter/search';

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

/** Parse body safely, with special cases for empty/204 and non-JSON */
async function parseBodySafe(res: Response): Promise<any | undefined | string> {
  const ct = res.headers.get('content-type') || '';
  const hasBody = res.status !== 204;
  if (!hasBody) return undefined;

  if (ct.includes('application/json')) {
    try {
      // some servers send empty string with JSON ct 🤦
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
    // return text (trimmed) so callers can log
    const t = await res.text().catch(() => '');
    return t?.slice(0, 2000);
  }
}

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}

function jitter(ms: number) {
  // +/- 30% jitter
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

function retryAfterMs(res?: Response) {
  if (!res) return undefined;
  const ra = res.headers.get('Retry-After');
  if (!ra) return undefined;
  // header can be seconds or HTTP-date — we support seconds only for simplicity
  const secs = Number(ra);
  return Number.isFinite(secs) ? secs * 1000 : undefined;
}

function shouldRetry(err: unknown, res?: Response) {
  // Retry on transient HTTP
  if (res && RETRY_STATUS.has(res.status)) return true;
  // RN fetch timeouts surface as AbortError (DOMException) or sometimes just TypeError
  if (err instanceof DOMException && err.name === 'AbortError') return true;
  if (err instanceof TypeError) return true; // network fetch error in RN
  return false;
}

export type FetchOpts = {
  timeoutMs?: number;
  retries?: number; // per-call override
  allowEmpty?: boolean; // default true: return empty list instead of throwing
};

export async function fetchVoterList(
  search?: SearchParams,
  opts?: FetchOpts
): Promise<Voter[]> {
  const payload = buildPayload(search ?? {});
  const target = url();

  let attempt = 0;
  const maxRetries = Math.max(0, opts?.retries ?? MAX_RETRIES);
  const allowEmpty = opts?.allowEmpty ?? true;
  let lastErr: unknown;

  // We'll capture request ID if server provides one
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
        // Classify common statuses for better UX & retry logic
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
          const backoff = Math.min(
            MAX_BACKOFF_MS,
            BASE_BACKOFF_MS * attempt * attempt
          );
          const wait = serverDelay ?? jitter(backoff);
          await delay(wait);
          continue;
        }
        throw err;
      }

      // Success branch
      if (typeof body !== 'object') {
        // Accept undefined (e.g., 204) as empty list if allowed
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

      if (!body.success) {
        // API explicitly says it failed
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
          // Treat empty as valid if allowed
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

      // Normalize common low-level errors to ApiError with good codes
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

  // If we somehow broke out without returning
  const normalized = normalizeUnknownError(lastErr);
  throw normalized;
}

export function getVoterFromList(list: Voter[], voter_code: string) {
  return list.find(v => v.voter_code === voter_code);
}

/** Convert unknown errors into ApiError with stable codes */
function normalizeUnknownError(err: unknown, requestId?: string): ApiError {
  if (err instanceof ApiError) return err;
  if (err instanceof DOMException && err.name === 'AbortError') {
    return new ApiError('The request timed out. Please try again.', {
      code: 'TIMEOUT',
      retriable: true,
      cause: err,
      requestId,
    });
  }
  if (err instanceof TypeError) {
    // RN network errors usually surface as TypeError
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

/** Map ApiError to user-friendly copy for your toasts/prompts */
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
