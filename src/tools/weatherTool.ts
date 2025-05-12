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
// -----------------------------------------

// import axios from "axios";

// execute: async (args) => {
//     const { location } = args;

//     // Replace with your OpenWeatherMap API key
//     const apiKey = "YOUR_API_KEY";
//     const apiUrl = `https://api.openweathermap.org/data/2.5/weather`;

//     try {
//       // Call the weather API
//       const response = await axios.get(apiUrl, {
//         params: {
//           q: location,
//           appid: apiKey,
//           units: "imperial", // Use "metric" for Celsius
//         },
//       });

//       const data = response.data;

//       // Extract relevant weather information
//       return {
//         temperature: `${data.main.temp}°F`,
//         conditions: data.weather[0].description,
//         location: `${data.name}, ${data.sys.country}`,
//       };
//     } catch (error) {
//       console.error("Error fetching weather data:", error);
//       throw new Error("Failed to fetch weather data. Please check the location or try again later.");
//     }
//   },