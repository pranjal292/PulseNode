import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
prisma.club.findMany({
  include: {
    _count: { select: { memberships: true } },
    members: {
      select: {
         user: { select: { id: true, name: true, email: true, tag: true } },
         role: true
      }
    }
  }
}).then(c => console.dir(c, { depth: null })).finally(() => prisma.$disconnect());
