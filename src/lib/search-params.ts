export type SearchParams = Record<string, string | string[] | undefined>;

/** First value of a search param that may repeat. */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** A search param value, only if it is one of the allowed options. */
export function pickParam<T extends string>(
  params: SearchParams,
  name: string,
  allowed: readonly T[],
): T | undefined {
  const value = firstParam(params[name]);
  return value !== undefined && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : undefined;
}
