import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function fixDB() {
  await prisma.$executeRaw`ALTER TABLE "audit_logs" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();`;
  console.log("Fixed audit_logs");
  await prisma.$executeRaw`ALTER TABLE "club_memberships" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();`;
  console.log("Fixed club_memberships");
}

fixDB().finally(() => prisma.$disconnect());
