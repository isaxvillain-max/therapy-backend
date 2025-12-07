// server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import OpenAI from "openai";

const app = express();

// ====== CONFIG ======
const PORT = process.env.PORT || 8080;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable is missing!");
  process.exit(1);
}

// ====== CORS ======
app.use(cors({
  origin: "https://isaxvillain-max.github.io", // allow your frontend
  methods: ["POST", "GET"],
  allowedHeaders: ["Content-Type"]
}));

app.use(bodyParser.json());

// ====== OpenAI Client ======
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// ====== ROUTES ======
app.post("/getAIReply", async (req, res) => {
  try {
    const { text, session, emotion_flag } = req.body;

    // Build context for AI
    let context = "";
    session.forEach(pair => {
      context += `User: ${pair.user}\nAI: ${pair.ai}\n`;
    });
    context += `User: ${text}\nAI:`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: context }],
      temperature: 0.7,
      max_tokens: 200
    });

    const aiReply = response.choices[0].message.content.trim();
    res.json({ reply: aiReply });

  } catch (err) {
    console.error("OpenAI error:", err);
    res.json({ reply: "I am here to listen. Could you say that again?" });
  }
});

// ====== START SERVER ======
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
