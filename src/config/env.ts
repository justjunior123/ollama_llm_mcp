import * as dotenv from "dotenv";
dotenv.config();

export const env = {
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
};