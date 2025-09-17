export function isErrorWithError(error: unknown): error is { error: string } {
	return typeof error === 'object' && error != null && 'error' in error && typeof (error as Record<string, unknown>).error === 'string';
}
