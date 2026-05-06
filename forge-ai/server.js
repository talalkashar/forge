import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log("SERVER WITH AI LOADED");

/* FORGE AI ROUTE */
app.post("/forge", async (req, res) => {
  try {
    const { message } = req.body;

    const systemPrompt = `
You are a FORGE gym gear sales assistant.

Be confident and direct.

Products:
- Zeus Lever Belt → best for heavy squats and deadlifts
- Berserk Lever Belt → strong support + aesthetic
- Lifting Straps → best for grip on deadlifts

Recommend ONE product based on the user's goal.
Keep it short and persuasive.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
    });

    res.json({
      reply: completion.choices[0].message.content,
    });

  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});