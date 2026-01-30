import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "../lib/prisma.js";

const router = express.Router();

const signupSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(24),
  password: z.string().min(8),
  displayName: z.string().min(2).max(40)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

router.post("/signup", async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const { email, username, password, displayName } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] }
  });

  if (existing) {
    return res.status(409).json({ error: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      displayName
    }
  });

  const token = jwt.sign(
    { userId: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const isSecure = process.env.COOKIE_SECURE === "true";
  res.cookie("triptree_session", token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.json({ user: { id: user.id, email, username, displayName } });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const isSecure = process.env.COOKIE_SECURE === "true";
  res.cookie("triptree_session", token, {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName
    }
  });
});

router.post("/logout", async (req, res) => {
  res.clearCookie("triptree_session");
  return res.status(204).send();
});

export default router;
