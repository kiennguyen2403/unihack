import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  console.log("POST request received");
  try {
    const body = await req.json();
    const { topic, ideas } = body;

    // Validate input
    if (!topic || !Array.isArray(ideas) || ideas.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: topic and ideas array" },
        { status: 400 }
      );
    }

    // Format ideas as a list
    const formattedIdeas = ideas
      .map((idea, index) => `${index + 1}. ${idea}`)
      .join("\n");

    // Construct the prompt
    const promptText = `You are given a list of brainstormed ideas related to a specific topic. 
Your tasks:
1. **Group similar ideas** into one.
2. **Create a short, clear title** summarizing each unique idea.
3. **Provide pros and cons** for each idea.
4. **Mention if multiple users suggested the same idea** in the explanation.

**Topic:** ${topic}

**Brainstormed Ideas:**
${formattedIdeas}

Follow this format for the response:

{
  "results": [
    { 
      "title": "[Short, descriptive title of the idea]", 
      "explanation": "[Brief summary]. Pro: [Advantage]. Con: [Disadvantage]. [If multiple users suggested this idea, mention it at the end: 'This idea was proposed by multiple users.']"
    }
  ],
  "metadata": { "additionalInfo": "[General insights on the overall ideas]" }
}

FINAL CHECKLIST:
- **Group similar ideas** instead of listing them separately.
- **Mention if multiple users proposed an idea**.
- Ensure response is **valid JSON** with **no extra text**.

Now generate the response in **valid JSON format only**.
`;

    // Call the AI API
    const msg = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 20000,
      temperature: 1,
      messages: [
        { role: "user", content: [{ type: "text", text: promptText }] },
      ],
    });

    let responseContent = "";
    if (msg.content[0].type === "text") {
      responseContent = msg.content[0].text;
    }

    // Parse the text content as JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseContent);
      console.log("Successfully parsed response:", parsedResponse);
    } catch (error) {
      console.error("Failed to parse AI response as JSON:", responseContent);
      throw new Error("AI returned invalid JSON format");
    }

    return NextResponse.json(parsedResponse);
  } catch (error: any) {
    console.error("Error processing AI feedback request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
