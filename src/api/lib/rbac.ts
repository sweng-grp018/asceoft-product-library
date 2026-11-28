import type { Request, Response, NextFunction } from "express";

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

export type Viewer = { id: string; email: string; role: Role };
export type AuthenticatedRequest = Request & { viewer?: Viewer };

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
