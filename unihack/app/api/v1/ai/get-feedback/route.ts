import { NextRequest, NextResponse } from 'next/server';
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { topic, ideas } = body;

        // Validate input
        if (!topic || !Array.isArray(ideas) || ideas.length === 0) {
            return NextResponse.json(
                { error: 'Missing required fields: topic and ideas array' },
                { status: 400 }
            );
        }

        const msg = await anthropic.messages.create({
            model: "claude-3-7-sonnet-20250219",
            max_tokens: 20000,
            temperature: 1,
            messages: [
              {
                "role": "user",
                "content": [
                  {
                    "type": "text",
                    "text": "You are tasked with providing feedback on a list of brainstormed ideas related to a specific topic. Your goal is to analyze each idea and provide pros and cons for each. You will present your feedback in a specific JSON format.\n\nHere is the topic:\n<topic>\n{{TOPIC}}\n</topic>\n\nHere is the list of brainstormed ideas:\n<brainstormed_ideas>\n{{BRAINSTORMED_IDEAS}}\n</brainstormed_ideas>\n\nFor each idea in the list, follow these steps:\n1. Carefully consider the idea in the context of the given topic.\n2. Identify at least one pro (advantage or positive aspect) of the idea.\n3. Identify at least one con (disadvantage or negative aspect) of the idea.\n4. Summarize your analysis in a brief explanation.\n\nStructure your feedback in the following JSON format:\n\n{\n  \"results\": [\n    {\n      \"title\": \"Idea 1\",\n      \"explanation\": \"Pro: [Advantage of the idea]. Con: [Disadvantage of the idea]. [Brief summary of analysis].\"\n    },\n    {\n      \"title\": \"Idea 2\",\n      \"explanation\": \"Pro: [Advantage of the idea]. Con: [Disadvantage of the idea]. [Brief summary of analysis].\"\n    },\n    // ... repeat for each idea\n  ],\n  \"metadata\": {\n    \"additionalInfo\": \"[Any overall observations, patterns, or suggestions related to the brainstormed ideas as a whole]\"\n  }\n}\n\nIn the \"metadata\" section, provide any additional information or insights you have about the brainstormed ideas as a whole. This could include overall trends, suggestions for improvement, or any other relevant observations.\n\nBefore submitting your response, double-check that your output strictly adheres to the required JSON format. Ensure that all ideas are included, each with a title and explanation, and that the metadata section is properly filled out.\n\nPresent your complete analysis within <analysis> tags."
                  }
                ]
              }
            ]
          });

        const responseContent = JSON.stringify(msg.content[0].type === 'text' && msg.content[0].text);

        const parsedResponse = JSON.parse(responseContent);
        
        return NextResponse.json(parsedResponse);
    } catch (error: any) {
        console.error('Error processing AI feedback request:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process request' },
            { status: 500 }
        );
    }
}