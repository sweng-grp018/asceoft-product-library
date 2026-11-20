import { z } from "zod";

export const profileInput = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().transform((value) => value.toLowerCase()),
});
export const passwordInput = z.object({
  password: z
    .string()
    .min(12, "Use a password with at least 12 characters.")
    .max(128, "This password is too long. Use fewer characters.")
    // bcrypt accepts at most 72 bytes; reject values it would silently truncate.
    .refine((value) => Buffer.byteLength(value, "utf8") <= 72, {
      message: "This password is too long. Use fewer characters.",
    }),
});
export const registrationInput = z.strictObject({
  ...profileInput.shape,
  ...passwordInput.shape,
});
