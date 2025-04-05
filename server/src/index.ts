import express, { Request, Response } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { generateSuggestion as cohereAIMethod } from "./cohereai";
import { generateSuggestion as openAIMethod } from "./openai";
import dotenv from "dotenv";

dotenv.config();

let generateSuggestion: (input: string) => Promise<string | null>;
if (process.env.USE_COHEREAI === "true") {
  generateSuggestion = cohereAIMethod;
} else {
  generateSuggestion = openAIMethod;
}


const app = express();
const PORT = 3000;

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    error: "Too many requests. Please try again in a minute.",
  },
});

app.use(cors());
app.use(express.json());
app.use(limiter); //

app.post("/suggest", async (req: Request, res: Response) => {
  const { input } = req.body;

  console.log("Received input:", input);


  if (!input || typeof input !== "string") {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const suggestion = await generateSuggestion(input);
  res.json({ suggestion });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
