import type { Request, Response, NextFunction } from "express";
import { SignJWT, jwtVerify } from "jose";
import { createHash } from "node:crypto";
import { db } from "./db.js";
import { config } from "./config.js";

export type Role = "ADMIN" | "STAFF" | "PUBLIC";
export type Permission =
  | "catalog:public"
  | "ai:search"
  | "catalog:internal"
  | "products:create"
  | "repository:upload"
  | "repository:analyze"
  | "repository:results"
  | "dashboard:view"
  | "products:edit"
  | "products:delete"
  | "reference-images:manage"
  | "indexing:run"
  | "matches:correct"
  | "repository:delete"
  | "users:manage";

const ROLE_RANK: Record<Role, number> = {
  PUBLIC: 0,
  STAFF: 1,
  ADMIN: 2,
};

export const PERMISSION_MIN_ROLE: Record<Permission, Role> = {
  "catalog:public": "PUBLIC",
  "ai:search": "PUBLIC",
  "catalog:internal": "STAFF",
  "products:create": "STAFF",
  "repository:upload": "STAFF",
  "repository:analyze": "STAFF",
  "repository:results": "STAFF",
  "dashboard:view": "ADMIN",
  "products:edit": "ADMIN",
  "products:delete": "ADMIN",
  "reference-images:manage": "ADMIN",
  "indexing:run": "ADMIN",
  "matches:correct": "ADMIN",
  "repository:delete": "ADMIN",
  "users:manage": "ADMIN",
};

export function hasMinRole(role: Role, minRole: Role): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[minRole];
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return hasMinRole(role, PERMISSION_MIN_ROLE[permission]);
}

export type Viewer = { id: string; email: string; role: Role };
export type AuthenticatedRequest = Request & { viewer?: Viewer };
const secret = new TextEncoder().encode(config.JWT_SECRET);

const credentialStamp = (passwordHash: string) =>
  createHash("sha256").update(passwordHash).digest("hex");

export async function issueToken(user: Viewer, passwordHash: string) {
  return new SignJWT({ role: user.role, cv: credentialStamp(passwordHash) })
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
      select: { id: true, email: true, role: true, passwordHash: true },
    });
    if (!user || payload.cv !== credentialStamp(user.passwordHash))
      throw new Error("Account credentials changed");
    // Always resolve the current role from the database: tokens cannot preserve revoked privileges.
    req.viewer = { id: user.id, email: user.email, role: user.role };
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireMinRole(minRole: Role) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.viewer || !hasMinRole(req.viewer.role, minRole)) {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }
    next();
  };
}

export function requirePermission(permission: Permission) {
  return requireMinRole(PERMISSION_MIN_ROLE[permission]);
}
