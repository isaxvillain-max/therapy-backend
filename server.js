const express = require("express");
const cors = require("cors");
require("dotenv").config();
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

// API Key
const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.warn("Warning: OPENAI_API_KEY is missing.");
}

// OpenAI Client
const client = new OpenAI({
  apiKey: OPENAI_KEY
});

// POST: getAIReply
app.post("/getAIReply", async (req, res) => {
  try {
    const { text, session = [], emotion_flag = false } = req.body || {};
    if (!text) {
      return res.json({ reply: "I’m here with you. You can share anything you feel comfortable sharing." });
    }

    // System prompt: soft, safe, supportive
    const systemPrompt = `
You are a gentle, calm, supportive emotional assistant.
You help users with stress, sadness, loneliness, anxiety, overthinking, emotional pain, or confusion.
You are NOT a medical professional.
You never give medical instructions or harmful advice.
If a user expresses dangerous feelings, encourage them to reach out to a trusted person or emergency help.
Keep replies short, warm, and supportive.
Use simple language and friendly emotional tone.
`;

    // Build message array
    const messages = [{ role: "system", content: systemPrompt }];

    // Add conversation history (last 6 exchanges)
    for (const pair of session.slice(-6)) {
      if (pair.user) messages.push({ role: "user", content: pair.user });
      if (pair.ai) messages.push({ role: "assistant", content: pair.ai });
    }

    // Emotion flag
    const userMessage = emotion_flag ? `(emotionally upset) ${text}` : text;
    messages.push({ role: "user", content: userMessage });

    // OpenAI API call (new SDK)
    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
      temperature: 0.7,
      max_tokens: 300
    });

    const reply = completion.choices[0].message.content.trim();
    return res.json({ reply });

  } catch (err) {
    console.error("Error in /getAIReply:", err);
    return res.json({
      reply: "I'm still here for you. Maybe you can share a little more about what's going on?"
    });
  }
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
