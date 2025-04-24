import express from "express";
import cors from "cors";
import ollama from "ollama";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await ollama.chat({
      model: "deepseek-r1:8b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1 // controls creativity
    });

    let message = response.message.content;

    // Cleanup 
    message = message
      .replace(/<think>.*?<\/think>/gs, "")
      .replace(/\\\(|\\\)|\\\[|\\\]/g, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .trim();

    res.send(message);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server error");
  }
});

app.listen(5000, () => console.log("AI Server running on port 5000"));
