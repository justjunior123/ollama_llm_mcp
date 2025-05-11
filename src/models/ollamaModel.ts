import { Ollama } from "@langchain/ollama";
import { env } from "../config/env";

export async function setupOllamaLLM(modelName = "codellama") {
  const model = new Ollama({
    baseUrl: env.ollamaBaseUrl,
    model: modelName,
    temperature: 0.7,
  });
  
  return model;
}