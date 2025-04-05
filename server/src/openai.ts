import { OpenAI } from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function generateSuggestion(input: string): Promise<string | null> {
  if (!input) return null;

  const prompt = `Provide the next letters, words, or sentences to complete the input without the input itself and strictly excluding the input. \n\n${input}\n\nSuggestion:`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an autocomplete assistant." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 30
    });

    const suggestion = response.choices[0]?.message?.content?.trim();
    if (suggestion && suggestion.toLowerCase().startsWith(input.toLowerCase())) {
      return suggestion;
    } else {
      return input + suggestion;
    }
  } catch (error) {
    console.error("OpenAI error:", error);
    return null;
  }
}
