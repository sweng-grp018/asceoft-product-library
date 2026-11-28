import type { Response, NextFunction } from "express";
import { SignJWT, jwtVerify } from "jose";
import { createHash } from "node:crypto";
import { db } from "./db.js";
import { config } from "./config.js";
import type { AuthenticatedRequest, Viewer } from "./rbac.js";

export {
  PERMISSION_MIN_ROLE,
  hasMinRole,
  hasPermission,
  requireMinRole,
  requirePermission,
  type AuthenticatedRequest,
  type Permission,
  type Role,
  type Viewer,
} from "./rbac.js";

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
