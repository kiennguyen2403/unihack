import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  console.log("POST request received");

  try {
    const body = await req.json();
    const { topic, idea } = body;

    // Validate input
    if (!topic || !idea) {
      return NextResponse.json(
        { error: "Missing required fields: idea, topic" },
        { status: 400 }
      );
    }

    // Construct the AI prompt
    const promptText = `You are an AI assistant that evaluates ideas with a structured approach.

Please provide a detailed analysis of the following idea, including:

1. Pros and cons
2. Pre-mortem analysis:
   - Potential failure points
   - Mitigation strategies
3. Relevant research and case studies

Topic: ${topic}
Idea: ${idea}

Provide your analysis as a clear, well-structured response. Do not use any special formatting or JSON structure - just write naturally.`;

    // Call the AI API
    const msg = await anthropic.messages.create({
      model: "claude-3-7-sonnet-20250219",
      max_tokens: 20000,
      temperature: 1,
      messages: [
        { role: "user", content: [{ type: "text", text: promptText }] },
      ],
    });

    let feedback = "";
    if (msg.content[0].type === "text") {
      feedback = msg.content[0].text;
    }

    return NextResponse.json({ feedback });
  } catch (error: any) {
    console.error("Error processing AI feedback request:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
