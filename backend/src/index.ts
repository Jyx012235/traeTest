import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const openai = new OpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434/v1',
  apiKey: 'ollama',
});

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma4:e4b'; 

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', model: OLLAMA_MODEL });
});

app.post('/api/guess', async (req: Request, res: Response) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image data provided' });
    }

    const response = await openai.chat.completions.create({
      model: OLLAMA_MODEL,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "You are a 'Draw and Guess' game AI. Please look at this user drawing and guess what it is. Provide only the name of the object in 1-3 words." },
            {
              type: "image_url",
              image_url: {
                "url": image,
              },
            },
          ],
        },
      ],
    });

    const guess = response.choices[0]?.message?.content || "I couldn't identify the drawing.";
    res.json({ guess });
  } catch (error: any) {
    console.error('Error with Ollama API:', error);
    res.status(500).json({ error: 'Failed to guess the drawing', details: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
