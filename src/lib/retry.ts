export class NonRetryableError extends Error {}

type RetryOptions = {
  retries?: number;
  baseMs?: number;
  shouldRetry?: (err: unknown) => boolean;
};

/** Tenta de novo com backoff exponencial (300ms, 600ms, …). Erros não-retentáveis saem na hora. */
export async function withRetry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const { retries = 2, baseMs = 300, shouldRetry = () => true } = opts;
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries || err instanceof NonRetryableError || !shouldRetry(err)) throw err;
      await new Promise((r) => setTimeout(r, baseMs * 2 ** attempt));
    }
  }
}

export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label}: tempo esgotado (${ms} ms)`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export const errorMessage = (err: unknown) => (err instanceof Error ? err.message : String(err)).slice(0, 300);
