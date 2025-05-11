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