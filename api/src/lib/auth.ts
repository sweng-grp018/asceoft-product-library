import type { Request, Response, NextFunction } from "express";
import { SignJWT, jwtVerify } from "jose";
import { db } from "./db.js";
import { config } from "./config.js";

export type Role = "ADMIN" | "STAFF" | "PUBLIC";
export type Viewer = { id: string; email: string; role: Role };
export type AuthenticatedRequest = Request & { viewer?: Viewer };
const secret = new TextEncoder().encode(config.JWT_SECRET);

export async function issueToken(user: Viewer) {
  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer(config.JWT_ISSUER)
    .setAudience(config.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);
}

export async function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const match = /^Bearer (.+)$/i.exec(req.header("authorization") ?? "");
  if (!match) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    const { payload } = await jwtVerify(match[1], secret, {
      issuer: config.JWT_ISSUER,
      audience: config.JWT_AUDIENCE,
      algorithms: ["HS256"],
    });
    if (!payload.sub) throw new Error("Missing subject");
    const user = await db.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true },
    });
    if (!user) throw new Error("User not found");
    // Always resolve the current role from the database: tokens cannot preserve revoked privileges.
    req.viewer = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.viewer || !roles.includes(req.viewer.role)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}
