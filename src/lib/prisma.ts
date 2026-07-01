import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { normalizePgConnectionString } from "@/lib/pg-connection";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createClient() {
  const adapter = new PrismaPg({
    connectionString: normalizePgConnectionString(process.env.DATABASE_URL),
  });
  return new PrismaClient({ adapter });
}

// Reuse a single client across requests (and across hot reloads in dev). On
// Vercel Fluid Compute the instance is kept warm, so this also reuses the
// underlying pg connection pool between invocations and avoids reconnecting.
export const prisma = globalForPrisma.prisma ?? createClient();

globalForPrisma.prisma = prisma;
