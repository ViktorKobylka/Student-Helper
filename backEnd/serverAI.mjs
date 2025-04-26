import express from "express";
import cors from "cors";
import ollama from "ollama";

const app = express();
app.use(express.json());
app.use(cors());

// API endpoint to handle chat requests
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body; // Extract the 'prompt' from the incoming request body

    // Sending the 'prompt' to the Ollama API to generate a response using 'llama3.2' model
    const response = await ollama.chat({
      model: "llama3.2",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3 // controls creativity
    });

    let message = response.message.content; // Extract the content of the response

    // Cleanup 
    message = message
      .replace(/<think>.*?<\/think>/gs, "") // Remove <think> tags
      .replace(/\\\(|\\\)|\\\[|\\\]/g, "") // Remove escaped brackets
      .replace(/\*\*(.*?)\*\*/g, "$1") // Remove bold markdown formatting
      .trim(); // Remove extra whitespace from the beginning and end

    res.send(message);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server error");
  }
});

app.listen(5000, () => console.log("AI Server running on port 5000")); // Start the server on port 5000 
