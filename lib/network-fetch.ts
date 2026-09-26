// Network transport layer: per-request timeout + poor-wifi detection.
// Dependency-free leaf module (no imports) so it can be used by the supabase
// client without creating import cycles.

export const REQUEST_TIMEOUT_MS = 10_000;
export const SLOW_REQUEST_MS = 3_000;

export type TransportResult = 'fast' | 'slow' | 'timeout' | 'error';

const observers = new Set<(result: TransportResult) => void>();

export const onTransportResult = (cb: (result: TransportResult) => void): (() => void) => {
    observers.add(cb);
    return () => {
        observers.delete(cb);
    };
};

const report = (result: TransportResult) => {
    observers.forEach((cb) => cb(result));
};

// Aborts requests that hang longer than REQUEST_TIMEOUT_MS so the app fails
// fast on poor wifi instead of waiting for the OS network stack to give up.
// Every completed request is reported as fast/slow so consumers can detect
// "connected but slow" networks.
export const fetchWithTimeout: typeof fetch = async (input, init) => {
    const controller = new AbortController();
    const callerSignal = init?.signal ?? null;
    const onCallerAbort = () => controller.abort();
    if (callerSignal) {
        if (callerSignal.aborted) throw new Error('Aborted');
        callerSignal.addEventListener('abort', onCallerAbort);
    }

    let timedOut = false;
    const timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, REQUEST_TIMEOUT_MS);
    const startedAt = Date.now();

    try {
        const response = await fetch(input, {...init, signal: controller.signal});
        report(Date.now() - startedAt >= SLOW_REQUEST_MS ? 'slow' : 'fast');
        return response;
    } catch (error) {
        if (timedOut) {
            report('timeout');
            throw new Error(`TimeoutError: request exceeded ${REQUEST_TIMEOUT_MS}ms`);
        }
        if (!callerSignal?.aborted) report('error');
        throw error;
    } finally {
        clearTimeout(timer);
        callerSignal?.removeEventListener('abort', onCallerAbort);
    }
};

// True when the error means the server never responded (poor wifi, offline,
// timeout) as opposed to the server answering with an error status.
// PostgREST client-side errors have empty `code` and envelope `status: 0`;
// auth network failures are AuthRetryableFetchError with `status: 0`.
export const isNetworkError = (error: unknown): boolean => {
    if (!error || typeof error !== 'object') return false;
    const e = error as {name?: string; code?: string; status?: number; message?: string};
    if (typeof e.code === 'string' && e.code.length > 0) return false; // PostgREST: server responded
    if (typeof e.status === 'number' && e.status > 0) return false; // Auth: real HTTP status
    if (e.name === 'AuthRetryableFetchError' || e.name === 'AbortError') return true;
    const msg = (e.message ?? '').toLowerCase();
    return msg.includes('network request failed') || msg.includes('fetch failed')
        || msg.includes('timeout') || msg.includes('timed out');
};
