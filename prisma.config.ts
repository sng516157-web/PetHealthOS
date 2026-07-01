import "dotenv/config";
import { defineConfig } from "prisma/config";
import { normalizePgConnectionString } from "./src/lib/pg-connection";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Migrations must use a direct (non-pooled) connection — PgBouncer
    // transaction pooling breaks Prisma's migration advisory locks.
    url: normalizePgConnectionString(
      process.env["DATABASE_URL_UNPOOLED"] ??
        process.env["POSTGRES_URL_NON_POOLING"] ??
        process.env["DATABASE_URL"],
    ),
  },
});
