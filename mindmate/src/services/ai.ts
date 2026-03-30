import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are an empathetic, non-judgmental AI mental health companion.
Your goal is to provide emotional support, use Cognitive Behavioral Therapy (CBT) techniques, and help users track their mood.
- Always be supportive and validating.
- If the user expresses thoughts of self-harm, suicide, or severe crisis, you MUST immediately provide emergency resources (e.g., "Please call 988 or go to the nearest emergency room") and encourage them to seek professional help.
- Keep responses concise, conversational, and easy to read.
- Ask open-ended questions to encourage reflection.
- Do not diagnose or prescribe medication.`;

export async function generateChatResponse(history: { role: string, parts: { text: string }[] }[], message: string): Promise<string> {
  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    // We need to send the history first if there is any, but the SDK doesn't support initializing chat with history directly in the create method easily without sending messages sequentially, or we can just use generateContent with the full history.
    // Let's use generateContent with full history.
    
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: msg.parts
    }));
    
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text || "I'm here for you. Could you tell me more?";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "I'm having a little trouble connecting right now, but please know I'm here for you. Let's try again in a moment.";
  }
}

export async function analyzeMood(text: string): Promise<{ mood: string, score: number }> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the sentiment of the following text and return a JSON object with two fields: 'mood' (one of: happy, sad, anxious, stressed, neutral, angry, calm) and 'score' (a number from 1 to 10, where 1 is extremely negative and 10 is extremely positive). Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            mood: { type: "STRING" },
            score: { type: "NUMBER" }
          },
          required: ["mood", "score"]
        }
      }
    });
    
    const result = JSON.parse(response.text || '{"mood":"neutral","score":5}');
    return result;
  } catch (error) {
    console.error("Error analyzing mood:", error);
    return { mood: 'neutral', score: 5 };
  }
}
