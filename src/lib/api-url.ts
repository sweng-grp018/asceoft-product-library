import "server-only";

export function apiUrl(path: string): URL {
  const base = process.env.API_INTERNAL_URL ?? process.env.API_URL ?? "http://localhost:4000";
  return new URL(path, base);
}
