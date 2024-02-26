export function get<T>(key: string): T | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  const item = window.localStorage.getItem(key);
  if (item == null) {
    return undefined;
  }
  return JSON.parse(item);
}
