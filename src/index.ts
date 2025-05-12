import { setupOllamaLLM } from "./models/ollamaModel";
import { getTools } from "./tools/toolRegistry";
import { createSystemPrompt, parseFunctionCall } from "./utils/functionCallingUtils";
import { handleFunctionCall } from "./handlers/functionHandler";
import { createConsoleInterface } from "./utils/consoleInterface";

async function main() {
  try {
    // Initialize the model and tools
    console.log("Setting up Ollama LLM...");
    const model = await setupOllamaLLM("gemma3");
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

async function main2() {
  try {
    // Initialize the model and tools
    console.log("Setting up Ollama LLM...");
    const model = await setupOllamaLLM("gemma3");
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