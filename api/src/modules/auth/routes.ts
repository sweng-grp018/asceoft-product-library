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
    const safeUser = { id: user.id, email: user.email, role: user.role };
    res.json({ accessToken: await issueToken(safeUser), expiresIn: 8 * 3600, user: safeUser });
  },
);

authRoutes.get("/me", authenticate, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.viewer });
});

const newUser = z.object({
  email: z.email(),
  password: z.string().min(12).max(200),
  name: z.string().min(1).max(100),
  role: z.enum(["ADMIN", "STAFF"]),
});
authRoutes.post("/users", authenticate, requireRole("ADMIN"), async (req, res) => {
  const parsed = newUser.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid user" });
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
