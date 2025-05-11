# ollama_llm_mcp
A repo for local LLM runncing MCP tools



Step-by-Step Guide: Setting Up MCP Locally with Ollama LLMs Using TypeScript
Here's a tailored guide specifically for using Ollama models instead of OpenAI:

1. Set Up Your Development Environment

bash# Create a new project directory
mkdir ollama-mcp-local
cd ollama-mcp-local

# Initialize a new Node.js project
npm init -y

# Install TypeScript and required dependencies
npm install typescript ts-node @types/node --save-dev
npm install langchain @langchain/core @langchain/ollama dotenv

2. Download and Install Ollama

First, download and install Ollama from https://ollama.com/download for your operating system:
For macOS:
bash# Download and install Ollama
brew install ollama

# Or use the macOS installer from the website

For Linux:
bash# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

For Windows:

Download the Windows installer from https://ollama.com/download
Run the installer and follow the prompts

3. Pull an Ollama Model
bash# Start the Ollama service
ollama serve

# In another terminal, pull a model (e.g., Llama3)
ollama pull llama3

## ollama pull gemma:7b

4. Configure Environment Variables
bash# Create .env file
echo "OLLAMA_BASE_URL=http://localhost:11434" > .env

5. Set Up Project Structure
bash# Create basic project structure
mkdir -p src/tools src/models src/handlers src/utils src/config
touch src/index.ts

6. Set Up the Ollama LLM Integration
typescript

bash# 
touch src/models/ollamaModel.ts

// src/models/ollamaModel.ts
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

7. Create Environment Configuration
typescript

bash# 
touch src/config/env.ts

// src/config/env.ts
import * as dotenv from "dotenv";
dotenv.config();

export const env = {
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
};

8. Define Tool Interfaces
typescript

bash# 
touch src/tools/toolInterfaces.ts

// src/tools/toolInterfaces.ts
export interface Tool {
  name: string;
  description: string;
  execute: (args: any) => Promise<any>;
  schema: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

9. Implement Example Tools
typescript

bash# 
touch src/tools/weatherTool.ts

// src/tools/weatherTool.ts
import { Tool } from "./toolInterfaces";

export const weatherTool: Tool = {
  name: "get_weather",
  description: "Get the current weather for a location",
  schema: {
    type: "object",
    properties: {
      location: {
        type: "string",
        description: "The city and state, e.g., San Francisco, CA",
      }
    },
    required: ["location"],
  },
  execute: async (args) => {
    const { location } = args;
    // In a real implementation, you would call a weather API here
    return {
      temperature: "72°F",
      conditions: "Sunny",
      location: location,
    };
  }
};

10. Create the Tool Registry
typescript

bash# 
touch src/tools/toolRegistry.ts

// src/tools/toolRegistry.ts
import { Tool } from "./toolInterfaces";
import { weatherTool } from "./weatherTool";

// Add more tools as you build them
const availableTools: Tool[] = [weatherTool];

export function getTools(): Tool[] {
  return availableTools;
}

11. Implement Function Calling Handler
typescript

bash# 
touch src/handlers/functionHandler.ts

// src/handlers/functionHandler.ts
import { Tool } from "../tools/toolInterfaces";

export async function handleFunctionCall(
  functionName: string,
  args: any,
  tools: Tool[]
) {
  const tool = tools.find(t => t.name === functionName);
  if (!tool) {
    throw new Error(`Function ${functionName} not found`);
  }
  
  try {
    const result = await tool.execute(args);
    return result;
  } catch (error) {
    console.error(`Error executing function ${functionName}:`, error);
    throw error;
  }
}

12. Create Function Calling Utilities for Ollama
typescript

bash# 
touch src/utils/functionCallingUtils.ts

// src/utils/functionCallingUtils.ts
import { Tool } from "../tools/toolInterfaces";

export function createSystemPrompt(tools: Tool[]) {
  const toolDefinitions = tools.map(tool => {
    return `
Function Name: ${tool.name}
Description: ${tool.description}
Parameters: ${JSON.stringify(tool.schema, null, 2)}
    `;
  }).join("\n\n");

  return `You are an AI assistant with access to the following functions:

${toolDefinitions}

When you need to use a function, respond with JSON in the following format:
{"function_call": {"name": "function_name", "arguments": {"arg1": "value1", "arg2": "value2"}}}

Otherwise, respond normally.`;
}

export function parseFunctionCall(text: string) {
  try {
    // Extract JSON from the response if it's in the expected format
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    
    const parsed = JSON.parse(jsonMatch[0]);
    if (parsed.function_call && parsed.function_call.name) {
      return {
        name: parsed.function_call.name,
        arguments: parsed.function_call.arguments,
      };
    }
    return null;
  } catch (e) {
    console.error("Failed to parse function call:", e);
    return null;
  }
}

13. Build the Main Orchestration Logic
typescript

// src/index.ts
import { setupOllamaLLM } from "./models/ollamaModel";
import { getTools } from "./tools/toolRegistry";
import { createSystemPrompt, parseFunctionCall } from "./utils/functionCallingUtils";
import { handleFunctionCall } from "./handlers/functionHandler";

async function main() {
  try {
    // Initialize the model and tools
    console.log("Setting up Ollama LLM...");
    const model = await setupOllamaLLM("llama3");
    const tools = getTools();
    
    // Create system prompt with tool definitions
    const systemPrompt = createSystemPrompt(tools);
    
    // Example user input
    const userInput = "What's the weather like in San Francisco?";
    console.log(`User: ${userInput}`);
    
    // Call the model with our system prompt
    console.log("Calling Ollama model...");
    const response = await model.invoke([
      ["system", systemPrompt],
      ["human", userInput]
    ]);
    
    console.log("Raw model response:", response);
    
    // Parse the response to check for function calls
    const functionCall = parseFunctionCall(response);
    
    if (functionCall) {
      console.log(`Model is calling function: ${functionCall.name}`);
      
      // Execute the function
      try {
        const functionResult = await handleFunctionCall(
          functionCall.name, 
          functionCall.arguments, 
          tools
        );
        
        console.log("Function result:", functionResult);
        
        // Get final response from model
        const finalResponse = await model.invoke([
          ["system", systemPrompt],
          ["human", userInput],
          ["assistant", response],
          ["human", `Function result: ${JSON.stringify(functionResult)}`]
        ]);
        
        console.log(`Assistant's final response: ${finalResponse}`);
      } catch (error) {
        console.error("Error in function execution:", error);
      }
    } else {
      // Model responded directly
      console.log(`Assistant: ${response}`);
    }
  } catch (error) {
    console.error("Error in main process:", error);
  }
}

main();

14. Create a Simple Interactive Console Interface
typescrip

bash# 
touch src/utils/consoleInterface.ts

// src/utils/consoleInterface.ts
import * as readline from "readline";

export function createConsoleInterface() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  return {
    ask: (question: string): Promise<string> => {
      return new Promise((resolve) => {
        rl.question(question, (answer) => {
          resolve(answer);
        });
      });
    },
    close: () => rl.close(),
  };
}

15. Update Main File with Interactive Console
typescript

// src/index.ts (updated with interactive console)
import { setupOllamaLLM } from "./models/ollamaModel";
import { getTools } from "./tools/toolRegistry";
import { createSystemPrompt, parseFunctionCall } from "./utils/functionCallingUtils";
import { handleFunctionCall } from "./handlers/functionHandler";
import { createConsoleInterface } from "./utils/consoleInterface";

async function main() {
  try {
    // Initialize the model and tools
    console.log("Setting up Ollama LLM...");
    const model = await setupOllamaLLM("llama3");
    const tools = getTools();
    
    // Create system prompt with tool definitions
    const systemPrompt = createSystemPrompt(tools);
    
    // Create console interface
    const consoleUI = createConsoleInterface();
    
    // Chat history
    const messages: [string, string][] = [
      ["system", systemPrompt]
    ];
    
    console.log("Chat initialized. Type 'exit' to quit.");
    
    while (true) {
      const userInput = await consoleUI.ask("\nYou: ");
      
      if (userInput.toLowerCase() === "exit") {
        break;
      }
      
      // Add user message to history
      messages.push(["human", userInput]);
      
      // Call the model
      process.stdout.write("Assistant: ");
      const response = await model.invoke(messages);
      console.log(response);
      
      // Add assistant response to history
      messages.push(["assistant", response]);
      
      // Parse for function calls
      const functionCall = parseFunctionCall(response);
      
      if (functionCall) {
        console.log(`\n[Executing function: ${functionCall.name}]`);
        
        try {
          const functionResult = await handleFunctionCall(
            functionCall.name, 
            functionCall.arguments, 
            tools
          );
          
          console.log(`[Function result: ${JSON.stringify(functionResult)}]`);
          
          // Add function result to messages
          messages.push(["human", `Function result: ${JSON.stringify(functionResult)}`]);
          
          // Get final response from model
          process.stdout.write("Assistant: ");
          const finalResponse = await model.invoke(messages);
          console.log(finalResponse);
          
          // Add final response to history
          messages.push(["assistant", finalResponse]);
        } catch (error) {
          console.error("[Error in function execution]:", error);
        }
      }
    }
    
    consoleUI.close();
    console.log("Chat ended.");
  } catch (error) {
    console.error("Error in main process:", error);
  }
}

main();

16. Create TypeScript Configuration

bash# 
touch tsconfig.json

// tsconfig.json
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"]
}
EOF

17. Add Scripts to package.json
bash# Update package.json scripts
cat > package.json << EOF
{
  "name": "ollama-mcp-local",
  "version": "1.0.0",
  "description": "MCP implementation with Ollama models",
  "main": "dist/index.js",
  "scripts": {
    "start": "ts-node src/index.ts",
    "build": "tsc",
    "dev": "ts-node-dev --respawn src/index.ts"
  },
  "keywords": ["llm", "ollama", "mcp"],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@langchain/core": "^0.1.0",
    "@langchain/ollama": "^0.0.1",
    "dotenv": "^16.3.1",
    "langchain": "^0.1.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "ts-node": "^10.9.1",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.3.2"
  }
}
EOF

18. Run Your Application

bash# Make sure Ollama is running in another terminal or as a service
ollama serve

# Run your application
npm start
This guide provides a complete setup for using Ollama models with a function calling framework in TypeScript. The implementation is specifically tailored for Ollama rather than OpenAI and includes all the necessary components for model interaction, tool definition, function calling, and user interaction.
