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
    });

    let message = response.message.content;

    //removes everything inside <think>...</think>
    message = message.replace(/<think>.*?<\/think>/gs, "").trim();

    //removes \( \), \[ \]
    message = message.replace(/\\\(|\\\)|\\\[|\\\]/g, "");

    //removes **...**
    message = message.replace(/\*\*(.*?)\*\*/g, "$1");

    res.send(message); //sends the cleaned message as plain text
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Server error");
  }
});




app.listen(5000, () => console.log("Server running on port 5000"));