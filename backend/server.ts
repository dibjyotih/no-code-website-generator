import express from "express";
import cors from "cors";
import multer from "multer";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Part } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: "backend/.env" });

const app = express();
const port = 8000;
const upload = multer({ storage: multer.memoryStorage() });

const MODEL_NAME = "gemini-2.5-flash";
const API_KEY = process.env.GEMINI_API_KEY || "";

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

/**
 * --- 🔧 FIXED CLEAN PARSER ---
 * Extracts HTML, CSS, and JS safely from Gemini output
 */
const parseContent = (content: string) => {
  if (!content) return { html: "", css: "", js: "" };

  // Remove markdown & explanations
  let cleanContent = content
    .replace(/```(html|css|javascript|js)?/gi, "")
    .replace(/```/g, "")
    .replace(/(^|\n)(Here.?|Okay|Sure|Let's|You can|Below|###|---).*\n?/gi, "")
    .replace(/^.*?(?=<\s*html|<\s*body)/is, "")
    .replace(/<\/html>.*$/is, "</html>")
    .trim();

  // Extract code using regex
  const styleMatch = cleanContent.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const scriptMatch = cleanContent.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  const htmlMatch = cleanContent.match(/<html[\s\S]*<\/html>/i) || cleanContent.match(/<body[\s\S]*<\/body>/i);

  const html = htmlMatch
    ? htmlMatch[0]
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .trim()
    : cleanContent;

  const css = styleMatch ? styleMatch[1].trim() : "";
  const js = scriptMatch ? scriptMatch[1].trim() : "";

  return { html, css, js };
};

/**
 * --- 🧠 /generate Endpoint ---
 * Explicitly instructs Gemini to produce only HTML/CSS/JS (no text)
 */
app.post("/generate", upload.single("file"), async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const { prompt } = req.body;
    const file = req.file;

    if (!prompt) {
      return res.status(400).json({ error: "A prompt is required." });
    }

    // 🧠 Strong system-style instruction for clean output
    const systemInstruction = `
You are a website generator AI.
Generate a complete, responsive webpage based on the user’s prompt using HTML, CSS, and JavaScript only.
Return code only — no explanations, markdown, or comments.
Always include:
1. <html> ... </html>
2. <style> ... </style>
3. <script> ... </script>
Do not describe what you are doing and no extra content just a clean output with mordern styling.
`;

    const parts: Part[] = [
      { text: systemInstruction },
      { text: `User request: ${prompt}` },
    ];

    if (file) {
      parts.push({
        inlineData: {
          mimeType: file.mimetype,
          data: file.buffer.toString("base64"),
        },
      });
    }

    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.7,
        topK: 64,
        topP: 0.9,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const responseText = result.response.text();
    const parsed = parseContent(responseText);

    // 🧩 Ensure valid structure for the preview iframe
    const safeHtml =
      parsed.html.startsWith("<!DOCTYPE") || parsed.html.startsWith("<html")
        ? parsed.html
        : `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${parsed.html}</body></html>`;

    res.json({
      html: safeHtml,
      css: parsed.css,
      js: parsed.js,
    });
  } catch (error) {
    console.error("❌ Backend error:", error);
    res.status(500).json({ error: "An error occurred while generating content." });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
