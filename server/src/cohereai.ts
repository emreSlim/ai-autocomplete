import { CohereClientV2 } from "cohere-ai";
import dotenv from "dotenv";

dotenv.config();



const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY,
});



export async function generateSuggestion(
  input: string
): Promise<string | null> {
  if (!input) return null;

  const prompt = `Provide the next letters, words, or sentences to complete the input without the input itself. Strictly excluding the input, complete this sentence:\n\n${input}\n\nSuggestion:`;

  try {
    const response = await cohere.chat({
      model: "command-a-03-2025",
      messages: [
        { role: "system", content: "You are an autocomplete assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 20,
    });

    console.log("Cohere response:", response);
    console.log("Cohere response message:", response.message);


    const suggestion = response.message?.content?.[0]?.text?.trim() ?? null;

    console.log("Cohere suggestion:", suggestion);

    return suggestion;

  } catch (error) {
    console.error("Cohere error:", error);
    return null;
  }
}
