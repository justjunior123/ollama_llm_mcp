import { Ollama } from "@langchain/ollama";
import { env } from "../config/env";

export async function setupOllamaLLM(modelName = "llama3") {
  const model = new Ollama({
    baseUrl: env.ollamaBaseUrl,
    model: modelName,
    temperature: 0.7,
  });
  
  return model;
}