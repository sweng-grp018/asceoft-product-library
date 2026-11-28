import assert from "node:assert/strict";
import { test } from "node:test";
import type { NextFunction, Request, Response } from "express";
import {
  PERMISSION_MIN_ROLE,
  hasMinRole,
  hasPermission,
  requireMinRole,
  requirePermission,
  type AuthenticatedRequest,
  type Permission,
  type Role,
} from "./rbac.js";

function invokeMiddleware(
  middleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void,
  role?: Role,
) {
  let statusCode = 200;
  let body: unknown;
  let nextCalled = false;

  const req = (
    role ? { viewer: { id: "user-1", email: "user@example.test", role } } : {}
  ) as AuthenticatedRequest;
  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      body = payload;
      return this;
    },
  } as unknown as Response;
  const next: NextFunction = () => {
    nextCalled = true;
  };

  middleware(req as Request & { viewer?: { id: string; email: string; role: Role } }, res, next);
  return { statusCode, body, nextCalled };
}

test("role hierarchy inherits all permissions from lower roles", () => {
  assert.equal(hasMinRole("PUBLIC", "PUBLIC"), true);
  assert.equal(hasMinRole("PUBLIC", "STAFF"), false);
  assert.equal(hasMinRole("PUBLIC", "ADMIN"), false);

  assert.equal(hasMinRole("STAFF", "PUBLIC"), true);
  assert.equal(hasMinRole("STAFF", "STAFF"), true);
  assert.equal(hasMinRole("STAFF", "ADMIN"), false);

  assert.equal(hasMinRole("ADMIN", "PUBLIC"), true);
  assert.equal(hasMinRole("ADMIN", "STAFF"), true);
  assert.equal(hasMinRole("ADMIN", "ADMIN"), true);
});

test("RBAC permission matrix matches Public -> Staff -> Admin graph", () => {
  const publicPermissions: Permission[] = ["catalog:public", "ai:search"];
  const staffPermissions: Permission[] = [
    "catalog:internal",
    "products:create",
    "repository:upload",
    "repository:analyze",
    "repository:results",
  ];
  const adminPermissions: Permission[] = [
    "dashboard:view",
    "products:edit",
    "products:delete",
    "reference-images:manage",
    "indexing:run",
    "matches:correct",
    "repository:delete",
    "users:manage",
  ];

  assert.equal(
    Object.keys(PERMISSION_MIN_ROLE).length,
    publicPermissions.length + staffPermissions.length + adminPermissions.length,
  );

  for (const permission of publicPermissions) {
    assert.equal(hasPermission("PUBLIC", permission), true);
    assert.equal(hasPermission("STAFF", permission), true);
    assert.equal(hasPermission("ADMIN", permission), true);
  }

  for (const permission of staffPermissions) {
    assert.equal(hasPermission("PUBLIC", permission), false);
    assert.equal(hasPermission("STAFF", permission), true);
    assert.equal(hasPermission("ADMIN", permission), true);
  }

  for (const permission of adminPermissions) {
    assert.equal(hasPermission("PUBLIC", permission), false);
    assert.equal(hasPermission("STAFF", permission), false);
    assert.equal(hasPermission("ADMIN", permission), true);
  }
});

test("requireMinRole and requirePermission reject unauthenticated or lower-role viewers with 403", () => {
  assert.deepEqual(invokeMiddleware(requireMinRole("PUBLIC")), {
    statusCode: 403,
    body: { error: "Insufficient permissions" },
    nextCalled: false,
  });

  assert.deepEqual(invokeMiddleware(requirePermission("products:create"), "PUBLIC"), {
    statusCode: 403,
    body: { error: "Insufficient permissions" },
    nextCalled: false,
  });
  assert.deepEqual(invokeMiddleware(requirePermission("products:create"), "STAFF"), {
    statusCode: 200,
    body: undefined,
    nextCalled: true,
  });

  assert.deepEqual(invokeMiddleware(requirePermission("dashboard:view"), "STAFF"), {
    statusCode: 403,
    body: { error: "Insufficient permissions" },
    nextCalled: false,
  });
  assert.deepEqual(invokeMiddleware(requirePermission("matches:correct"), "STAFF"), {
    statusCode: 403,
    body: { error: "Insufficient permissions" },
    nextCalled: false,
  });
  assert.deepEqual(invokeMiddleware(requirePermission("matches:correct"), "ADMIN"), {
    statusCode: 200,
    body: undefined,
    nextCalled: true,
  });
});
