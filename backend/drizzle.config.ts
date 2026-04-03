import { defineConfig } from "drizzle-kit";
import { getConnectionString } from "./src/config/database"

export default defineConfig({
  schema: "./src/infrastructure/drizzle/schema/*",
  out: "./src/infrastructure/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: getConnectionString(),
  },
});
