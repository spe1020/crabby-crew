import { defineConfig } from "drizzle-kit";

// Only require DATABASE_URL if we're actually using the database
if (!process.env.DATABASE_URL) {
  console.log("DATABASE_URL not set - skipping database configuration");
  process.exit(0);
}

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
