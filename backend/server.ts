import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, Part } from '@google/generative-ai';
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';

dotenv.config({ path: 'backend/.env' });

const app = express();
const port = 8000;

const upload = multer({ storage: multer.memoryStorage() });

const MODEL_NAME = "gemini-2.5-flash";
const API_KEY = process.env.GEMINI_API_KEY || "";

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

const parseContent = (content: string) => {
    // The API might wrap the code in markdown backticks.
    const cleanContent = content.replace(/```html/g, '').replace(/```/g, '').trim();

    const $ = cheerio.load(cleanContent);

    const css = $('style').text();
    const js = $('script').text();

    // Detach the tags from the DOM
    $('style').remove();
    $('script').remove();

    // Get the remaining HTML. If there's a body, get its content, otherwise get the whole content.
    const html = $('body').html() ? $('body').html() : $.html();

    return { html: (html || '').trim(), css: css.trim(), js: js.trim() };
};

app.post('/generate', upload.single('file'), async (req, res) => {
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const { prompt } = req.body;
        const file = req.file;

        if (!prompt) {
            return res.status(400).send('A prompt is required.');
        }

        const generationConfig = {
            temperature: 1,
            topK: 64,
            topP: 0.95,
            maxOutputTokens: 8192,
        };

        const safetySettings = [
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
        ];

        const parts: Part[] = [];
        if (file) {
            parts.push({
                inlineData: {
                    mimeType: file.mimetype,
                    data: file.buffer.toString("base64"),
                },
            });
        }

        if (prompt) {
            parts.push({ text: prompt });
        }

        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig,
            safetySettings,
        });

        const response = result.response;
        const parsedContent = parseContent(response.text());
        res.json(parsedContent);

    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while generating content.');
    }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
