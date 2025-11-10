import "dotenv/config";
import { z } from "zod";

// Define schema
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z
    .string()
    .optional() // allow Render's dynamic PORT (string)
    .transform((val) => val ?? process.env.PORT ?? "4000"), // use Render's port if set
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("1d"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment configuration", parsed.error.flatten().fieldErrors);
  throw new Error("Environment validation failed");
}

// Convert PORT to a number (Render gives a string)
export const env = {
  ...parsed.data,
  PORT: Number(parsed.data.PORT) || 4000
};
