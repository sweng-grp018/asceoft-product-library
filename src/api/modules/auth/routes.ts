import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { db } from "../../lib/db.js";
import {
  issueToken,
  authenticate,
  requireRole,
  type AuthenticatedRequest,
} from "../../lib/auth.js";
import { profileInput, registrationInput, passwordInput } from "./input.js";

export const authRoutes = Router();
const loginSchema = z.object({ email: z.email(), password: z.string().min(1) });

authRoutes.post(
  "/login",
  rateLimit({ windowMs: 15 * 60_000, limit: 10, standardHeaders: "draft-8", legacyHeaders: false }),
  async (req, res) => {
    const input = loginSchema.safeParse(req.body);
    if (!input.success) {
      res.status(400).json({ error: "Invalid credentials" });
      return;
    }
    const user = await db.user.findUnique({
      where: { email: input.data.email.trim().toLowerCase() },
    });
    if (!user || !(await compare(input.data.password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    res.json({
      accessToken: await issueToken(safeUser, user.passwordHash),
      expiresIn: 8 * 3600,
      user: safeUser,
    });
  },
);

authRoutes.get("/me", authenticate, async (req: AuthenticatedRequest, res) => {
  const user = await db.user.findUnique({
    where: { id: req.viewer!.id },
    select: { id: true, name: true, email: true, role: true },
  });
  res.json({ user });
});

authRoutes.patch("/me", authenticate, async (req: AuthenticatedRequest, res) => {
  const input = profileInput.safeParse(req.body);
  if (!input.success) {
    res.status(400).json({ error: "Enter your name and a valid email address." });
    return;
  }
  const user = await db.user.update({
    where: { id: req.viewer!.id },
    data: input.data,
    select: { id: true, name: true, email: true, role: true },
  });
  res.json({ user });
});

authRoutes.post(
  "/register",
  rateLimit({ windowMs: 3600000, limit: 5, standardHeaders: "draft-8", legacyHeaders: false }),
  async (req, res) => {
    const input = registrationInput.safeParse(req.body);
    if (!input.success) {
      res.status(400).json({
        error:
          input.error.issues.find((issue) => issue.path[0] === "password")?.message ??
          "Enter your name, a valid email and a password of at least 12 characters.",
      });
      return;
    }
    const { password, ...profile } = input.data;
    // Public registration never grants access to staff pages or store data.
    const user = await db.user.create({
      data: { ...profile, passwordHash: await hash(password, 12), role: "PUBLIC" },
      select: { id: true, name: true, email: true, role: true },
    });
    res.status(201).json({ user });
  },
);

authRoutes.get("/users", authenticate, requireRole("ADMIN"), async (_req, res) => {
  const users = await db.user.findMany({
    where: { role: { in: ["ADMIN", "STAFF"] } },
    select: { id: true, name: true, email: true, role: true },
    orderBy: { name: "asc" },
    take: 200,
  });
  res.json({ users });
});

authRoutes.patch("/users/:id/password", authenticate, requireRole("ADMIN"), async (req, res) => {
  const input = passwordInput.safeParse(req.body);
  const id = z.uuid().safeParse(req.params.id);
  if (!input.success || !id.success) {
    res.status(400).json({
      error: input.success ? "Choose a staff member." : input.error.issues[0].message,
    });
    return;
  }
  const user = await db.user.findUnique({ where: { id: id.data }, select: { role: true } });
  if (!user || user.role === "PUBLIC") {
    res.status(404).json({ error: "Staff member not found." });
    return;
  }
  await db.user.update({
    where: { id: id.data },
    data: { passwordHash: await hash(input.data.password, 12) },
  });
  res.status(204).end();
});

const newUser = z.object({
  email: z.email(),
  ...passwordInput.shape,
  name: z.string().trim().min(2).max(100),
  role: z.enum(["ADMIN", "STAFF"]),
});
authRoutes.post("/users", authenticate, requireRole("ADMIN"), async (req, res) => {
  const parsed = newUser.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error:
        parsed.error.issues.find((issue) => issue.path[0] === "password")?.message ??
        "Enter a name and a valid email address.",
    });
    return;
  }
  const { password, email, ...rest } = parsed.data;
  const user = await db.user.create({
    data: {
      ...rest,
      email: email.trim().toLowerCase(),
      passwordHash: await hash(password, 12),
    },
    select: { id: true, email: true, role: true, name: true },
  });
  res.status(201).json({ user });
});
