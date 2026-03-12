/**
 * Frontend error telemetry. Logs errors to console; can be extended to
 * send to a backend or external service.
 */

export type ErrorContext = {
  message: string;
  stack?: string;
  componentStack?: string;
  source?: string;
};

let reportFn: (context: ErrorContext) => void = defaultReporter;

function defaultReporter(ctx: ErrorContext): void {
  console.error('[DJ List] Frontend error:', ctx.message, ctx);
}

export function setErrorReporter(fn: (context: ErrorContext) => void): void {
  reportFn = fn;
}

export function reportError(error: unknown, source?: string): void {
  const ctx: ErrorContext = {
    message: error instanceof Error ? error.message : String(error),
    source
  };
  if (error instanceof Error && error.stack) {
    ctx.stack = error.stack;
  }
  reportFn(ctx);
}

export function initErrorHandlers(): void {
  window.addEventListener('error', (event) => {
    reportError(event.error ?? event.message, 'window.onerror');
  });

  window.addEventListener('unhandledrejection', (event) => {
    reportError(event.reason, 'unhandledrejection');
  });
}
