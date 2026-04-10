import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateClubs() {
  await prisma.club.deleteMany({});
  
  await prisma.club.createMany({
    data: [
      { name: "Cypher", description: "Information Security and Cryptography Club" },
      { name: "Codebase", description: "Competitive Programming and Open Source" },
      { name: "Odyssey", description: "The Literary and Debating Society" },
      { name: "Neon Cinematics", description: "Film Making and Photography Society" },
      { name: "GDG", description: "Google Developer Groups" }
    ],
  });
  console.log("Clubs updated in Postgres");
}

updateClubs().catch(console.error).finally(() => prisma.$disconnect());
