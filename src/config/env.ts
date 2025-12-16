import { z } from "zod";

const envSchema = z.object({
  VITE_API_BASE_URL: z.preprocess(
    (val) => val || "http://localhost:5000/api",
    z.string().url()
  ),
});

export const env = envSchema.parse(import.meta.env);

