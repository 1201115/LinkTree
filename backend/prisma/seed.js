import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("TripTree123!", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@triptree.dev" },
    update: {},
    create: {
      email: "demo@triptree.dev",
      username: "demo",
      passwordHash,
      displayName: "Demo Traveler",
      bio: "Explorador de novas rotas ✈️",
      avatarUrl: "",
      backgroundUrl: "",
      accentHue: 210,
      overlayOpacity: 0.35,
      overlayBlur: 16,
      links: {
        create: [
          { title: "Instagram", url: "https://instagram.com", order: 1, icon: "instagram" },
          { title: "Blog de Viagens", url: "https://example.com", order: 2, icon: "globe" }
        ]
      },
      places: {
        create: [
          { name: "Lisboa", countryCode: "PT", lat: 38.7223, lng: -9.1393 },
          { name: "Tokyo", countryCode: "JP", lat: 35.6762, lng: 139.6503 }
        ]
      }
    }
  });

  console.log("Seeded user:", user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
