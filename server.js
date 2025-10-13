import express from "express";
import cors from "cors";
import OpenAI from "openai";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ OpenAI client
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🧠 Memory file setup
const MEMORY_FILE = "./memory.json";

// Load memory
function loadMemory() {
  try {
    if (fs.existsSync(MEMORY_FILE)) {
      const data = fs.readFileSync(MEMORY_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("⚠️ Error loading memory file:", err);
  }
  return {};
}

// Save memory
function saveMemory(data) {
  try {
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("⚠️ Error saving memory file:", err);
  }
}

let sessions = loadMemory();

function getSession(sessionId) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      name: null,
      interests: [],
      history: [],
    };
  }
  return sessions[sessionId];
}

// 🧩 AI Chat Route
app.post("/api/chat", async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    console.log(`📩 [${sessionId}] ${message}`);

    const session = getSession(sessionId);
    const userHistory = session.history.slice(-10);
    let memoryUpdated = false;

    const systemPrompt = `
      You are **Mohammed Amin's AI Assistant**, living inside his portfolio website.
      Your role:
      - Greet users politely and naturally.
      - Talk confidently about Mohammed Amin’s skills, projects, and certificates.
      - Remember facts users share (like their name or interests).
      - Never call yourself ChatGPT. Always say you are Mohammed Amin’s AI assistant.
      - Speak naturally in the same language as the user.
    `;

    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "system",
        content: `User memory: ${JSON.stringify({
          name: session.name,
          interests: session.interests,
        })}`,
      },
      ...userHistory,
      { role: "user", content: message },
    ];

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
    });

    const reply = completion.choices[0].message.content;
    console.log(`🤖 [${sessionId}] ${reply}`);

    // Save conversation
    session.history.push({ role: "user", content: message });
    session.history.push({ role: "assistant", content: reply });

    // Detect name
    const nameMatch = message.match(/my name is\s+([A-Za-z]+)/i);
    if (nameMatch) {
      const newName = nameMatch[1];
      if (session.name !== newName) {
        session.name = newName;
        memoryUpdated = true;
        console.log(`💾 Remembered new name: ${newName}`);
      }
    }

    // Detect interests
    const interestMatch = message.match(
      /(interested in|learning|love|like)\s+([A-Za-z]+)/i
    );
    if (interestMatch) {
      const interest = interestMatch[2].toLowerCase();
      if (!session.interests.includes(interest)) {
        session.interests.push(interest);
        memoryUpdated = true;
        console.log(`💾 Added new interest: ${interest}`);
      }
    }

    if (memoryUpdated) saveMemory(sessions);

    res.json({ reply, memoryUpdated });
  } catch (error) {
    console.error("❌ Chat error:", error);
    res.status(500).json({ error: error.message });
  }
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const buildPath = path.join(__dirname, "build");

app.use(express.static(buildPath));

// ✅ React Router fallback for all unmatched routes
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
