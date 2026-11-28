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

export function isRole(value: unknown): value is Role {
  return value === "PUBLIC" || value === "STAFF" || value === "ADMIN";
}

export function hasMinRole(role: string | null | undefined, minRole: Role): boolean {
  if (!isRole(role)) return false;
  return ROLE_RANK[role] >= ROLE_RANK[minRole];
}

export function can(role: string | null | undefined, permission: Permission): boolean {
  return hasMinRole(role, PERMISSION_MIN_ROLE[permission]);
}

export function defaultHomePath(
  role: string | null | undefined,
): "/dashboard" | "/products" | "/search" {
  if (role === "ADMIN") return "/dashboard";
  if (role === "STAFF") return "/products";
  return "/search";
}
