import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

if (!process.env.DATABASE_URL) {
    console.warn("⚠️  DATABASE_URL is not defined. Drizzle Kit might fail if it needs to connect.");
}

export default defineConfig({
    schema: "./shared/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
