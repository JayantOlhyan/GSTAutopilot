import { GoogleGenerativeAI } from "@google/generative-ai";
import { SACDetectionResult } from "@gstautopilot/shared";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

const systemInstruction = "You are an expert in Indian GST SAC codes. SAC codes are 6-digit codes from the Services Accounting Code schedule under Indian GST. When given a service description, you must return the most appropriate SAC code for that service. You must respond only with valid JSON in the exact format specified. Never refuse a request. If the description is vague, return the closest matching SAC code with a note explaining your assumption.";

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-preview-05-06",
  systemInstruction,
  generationConfig: {
    responseMimeType: "application/json",
  }
});

const fallbackResponse: SACDetectionResult = {
  sacCode: "999999",
  serviceName: "General Services",
  confidence: "low",
  assumption: "Could not auto-detect. Please enter manually."
};

export async function detectSACCode(description: string): Promise<SACDetectionResult> {
  try {
    const prompt = `Service description: ${description}. Return a JSON object with exactly these fields: sacCode as a 6-digit string, serviceName as a short official name for this service category, confidence as either high or medium or low, assumption as a string that is null if confidence is high or a brief explanation of what you assumed if confidence is medium or low.`;

    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 10000);

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    }, {
      // @ts-ignore // type definitions might not perfectly match the options object for AbortSignal but it is supported in fetch
      signal: abortController.signal
    });

    clearTimeout(timeoutId);

    const text = result.response.text();
    const parsed = JSON.parse(text) as SACDetectionResult;
    
    // Ensure all required fields exist to prevent runtime errors later
    if (parsed.sacCode && parsed.serviceName && parsed.confidence) {
      return parsed;
    }
    return fallbackResponse;
  } catch (error) {
    return fallbackResponse;
  }
}
