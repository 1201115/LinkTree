import express from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

router.get("/places", authRequired, async (req, res) => {
  const places = await prisma.place.findMany({
    where: { userId: req.user.userId },
    orderBy: { createdAt: "desc" }
  });

  return res.json(places);
});

const placeSchema = z.object({
  name: z.string().min(2).max(80),
  countryCode: z.string().max(3).optional().nullable(),
  lat: z.number(),
  lng: z.number(),
  visitedAt: z.string().datetime().optional().nullable()
});

router.post("/places", authRequired, async (req, res) => {
  const parsed = placeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const place = await prisma.place.create({
    data: {
      userId: req.user.userId,
      name: parsed.data.name,
      countryCode: parsed.data.countryCode || null,
      lat: parsed.data.lat,
      lng: parsed.data.lng,
      visitedAt: parsed.data.visitedAt ? new Date(parsed.data.visitedAt) : null
    }
  });

  return res.json(place);
});

router.put("/places/:id", authRequired, async (req, res) => {
  const parsed = placeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid data" });
  }

  const place = await prisma.place.update({
    where: { id: req.params.id },
    data: {
      name: parsed.data.name,
      countryCode: parsed.data.countryCode || null,
      lat: parsed.data.lat,
      lng: parsed.data.lng,
      visitedAt: parsed.data.visitedAt ? new Date(parsed.data.visitedAt) : null
    }
  });

  return res.json(place);
});

router.delete("/places/:id", authRequired, async (req, res) => {
  await prisma.place.delete({
    where: { id: req.params.id }
  });

  return res.status(204).send();
});

export default router;
