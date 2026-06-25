import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY || ""
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

export interface AIAnalysisResult {
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sentiment: "Positive" | "Neutral" | "Negative" | "Angry";
}

export async function analyzeGrievance(issueDescription: string): Promise<AIAnalysisResult | null> {
  if (!genAI || !issueDescription) return null;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
You are an HR Assistant analyzing employee grievances.
Read the following grievance description and output a JSON object with exactly three fields:
1. "category": Choose the most appropriate one from [Workplace Harassment, Discrimination, Payroll Issues, Leave Issues, Manager Conduct, Safety Concerns, Policy Violation, Facilities/Maintenance, General Inquiry, Other].
2. "priority": Determine urgency based on the issue. Must be exactly one of: ["LOW", "MEDIUM", "HIGH", "CRITICAL"]. Safety concerns or severe harassment should be HIGH/CRITICAL.
3. "sentiment": Analyze the tone. Must be exactly one of: ["Positive", "Neutral", "Negative", "Angry"].

Grievance Description:
"${issueDescription}"

Respond ONLY with valid JSON. Do not use markdown blocks like \`\`\`json.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim()
    
    const parsed = JSON.parse(text)
    
    // Ensure enum correctness
    const priority = ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(parsed.priority) ? parsed.priority : "MEDIUM"
    const sentiment = ["Positive", "Neutral", "Negative", "Angry"].includes(parsed.sentiment) ? parsed.sentiment : "Neutral"
    
    return {
      category: parsed.category || "Other",
      priority,
      sentiment
    }
  } catch (error) {
    console.error("AI Analysis Failed:", error)
    return null
  }
}
