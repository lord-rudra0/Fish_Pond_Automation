import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.js",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres.lluxruhejobeoydajjwg:AMANrana7392924934@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
  },
}); 