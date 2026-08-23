export interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];

    const normalized = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const decoded = atob(normalized);

    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now();
}
