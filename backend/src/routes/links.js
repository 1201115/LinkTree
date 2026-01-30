import express from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

router.get("/links", authRequired, async (req, res) => {
  const links = await prisma.link.findMany({
    where: { userId: req.user.userId },
    orderBy: { order: "asc" }
  });

  return res.json(links);
});

const linkSchema = z.object({
  title: z.string().min(2).max(60),
  url: z.string().url(),
  icon: z.string().optional().nullable(),
  order: z.number().int().optional().nullable(),
  isVisible: z.boolean().optional().nullable()
});

router.post("/links", authRequired, async (req, res) => {
  const parsed = linkSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const data = parsed.data;
  const link = await prisma.link.create({
    data: {
      userId: req.user.userId,
      title: data.title,
      url: data.url,
      icon: data.icon || null,
      order: data.order ?? 0,
      isVisible: data.isVisible ?? true
    }
  });

  return res.json(link);
});

router.put("/links/:id", authRequired, async (req, res) => {
  const parsed = linkSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const link = await prisma.link.update({
    where: { id: req.params.id },
    data: parsed.data
  });

  return res.json(link);
});

router.delete("/links/:id", authRequired, async (req, res) => {
  await prisma.link.delete({
    where: { id: req.params.id }
  });

  return res.status(204).send();
});

export default router;
