export function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    if (__DEV__) {
      throw new Error(message ?? 'Assertion failed');
    }
  }
}
