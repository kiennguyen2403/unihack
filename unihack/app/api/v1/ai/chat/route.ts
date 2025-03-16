import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  console.log("POST request received");

  try {
    const body = await req.json();
    const { context, ask } = body;

    // Validate input
    if (!context || !ask) {
      return NextResponse.json(
        { error: "Missing required fields: context and ask" },
        { status: 400 }
      );
    }

    // Construct the AI prompt with enforced JSON format
    const promptText = `You are an AI assistant that provides concise answers in a structured JSON format.  

### **Context:**  
${context}  

### **User Question:**  
${ask}  

### **Response Format (Return JSON only):**  
\`\`\`json
{ "answer": "[Your concise response here]" }
\`\`\`

---

### **FINAL CHECKLIST:**  
✅ **Respond with a JSON object ONLY**: \`{ "answer": "..." }\`  
✅ **No additional text or explanations**  
✅ **Ensure JSON is syntactically correct**  

---

### **Now, generate the response in valid JSON format only.**
`;

    // Call the AI API
    const msg = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 500,
      temperature: 0.7, // Reduce temperature for more deterministic responses
      messages: [
        { role: "user", content: [{ type: "text", text: promptText }] },
      ],
    });

    let responseContent = "";
    if (msg.content[0].type === "text") {
      responseContent = msg.content[0].text.trim();
    }

    console.log("Raw AI response:", responseContent);

    // Ensure response is valid JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);

      // Validate that it's in the expected format
      if (!parsedResponse.answer || typeof parsedResponse.answer !== "string") {
        throw new Error("Invalid AI response format");
      }
    } catch (error) {
      console.error("Failed to parse AI response as JSON:", responseContent);
      return NextResponse.json(
        { error: "AI returned invalid JSON format" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedResponse);
  } catch (error: any) {
    console.error("Error processing AI request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
