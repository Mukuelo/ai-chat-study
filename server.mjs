import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Klucz API z environment variables
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Serwowanie frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "chat.html"));
});

// Endpoint GPT
app.post("/chat", async (req, res) => {
  try {

    const { message, style } = req.body;

    let systemPrompt = "";

    if (style === "pewny") {
      systemPrompt = "Odpowiadaj w sposób bardzo zdecydowany i pewny siebie. Formułuj odpowiedzi autorytatywnie i jednoznacznie.";
    }

    else if (style === "niepewny") {
      systemPrompt = "Odpowiadaj w sposób niepewny i ostrożny. Używaj sformułowań takich jak: 'wydaje mi się', 'możliwe że', 'nie jestem całkiem pewien', 'trudno powiedzieć jednoznacznie'.";
    }

    else {
      systemPrompt = "Odpowiadaj w neutralny sposób.";
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Nie udało się uzyskać odpowiedzi z AI.";

    res.json({ reply });

  } catch (error) {
    console.error("Błąd GPT:", error);
    res.status(500).json({ reply: "Wystąpił błąd w serwerze GPT." });
  }
});

// 🔹 Port dla hostingu (Render / Railway itd.)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server działa na porcie " + PORT);
});
