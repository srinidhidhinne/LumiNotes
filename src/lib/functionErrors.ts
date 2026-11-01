export async function readFunctionError(error: unknown): Promise<string> {
  const context = (error as { context?: Response })?.context;
  if (context && typeof context.json === 'function') {
    try {
      const body = (await context.json()) as { error?: unknown };
      if (typeof body.error === 'string') return body.error;
    } catch {
      // Fall through to the generic message when the body is not JSON.
    }
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.';
}
