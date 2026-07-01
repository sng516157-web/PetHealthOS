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

// ponytail: Next dev HMR keeps globalForPrisma.prisma across `prisma generate` —
// new model delegates are missing on the old instance until we drop it.
function getClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (cached && typeof cached.vaccineScheduleTemplate?.findMany === "function") {
    return cached;
  }
  const client = createClient();
  globalForPrisma.prisma = client;
  return client;
}

// Reuse a single client across requests (and across hot reloads in dev). On
// Vercel Fluid Compute the instance is kept warm, so this also reuses the
// underlying pg connection pool between invocations and avoids reconnecting.
export const prisma = getClient();
