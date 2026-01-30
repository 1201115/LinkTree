import express from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

router.get("/me", authRequired, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: {
      links: { orderBy: { order: "asc" } },
      places: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { passwordHash, ...safe } = user;
  return res.json(safe);
});

const updateSchema = z.object({
  displayName: z.string().min(2).max(40),
  bio: z.string().max(160).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  backgroundUrl: z.string().url().optional().nullable(),
  theme: z.string().optional().nullable(),
  accentHue: z.number().int().min(0).max(360).optional().nullable(),
  overlayOpacity: z.number().min(0).max(1).optional().nullable(),
  overlayBlur: z.number().int().min(0).max(40).optional().nullable()
});

router.put("/me", authRequired, async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const updated = await prisma.user.update({
    where: { id: req.user.userId },
    data: parsed.data
  });

  const { passwordHash, ...safe } = updated;
  return res.json(safe);
});

router.get("/public/:username", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
    include: {
      links: { where: { isVisible: true }, orderBy: { order: "asc" } },
      places: { orderBy: { createdAt: "desc" } }
    }
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const { passwordHash, email, ...safe } = user;
  return res.json(safe);
});

export default router;
