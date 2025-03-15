import { NextRequest, NextResponse } from 'next/server';
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  console.log('POST request received');
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
                    "text": `You are tasked with providing feedback on a list of brainstormed ideas related to a specific topic. Your goal is to analyze each idea and provide pros and cons for each. You will present your feedback in a specific JSON format. Here is the topic: <topic> {{TOPIC}} </topic> Here is the list of brainstormed ideas: <brainstormed_ideas> {{BRAINSTORMED_IDEAS}} </brainstormed_ideas> For each idea in the list, follow these steps: Carefully consider the idea in the context of the given topic. Identify at least one pro (advantage or positive aspect) of the idea. Identify at least one con (disadvantage or negative aspect) of the idea. Summarize your analysis in a brief explanation. CRITICAL INSTRUCTION: Your response MUST be ONLY valid, parseable JSON with absolutely nothing else before or after. No explanations, no markdown formatting (like \`\`\`json), no introductions, no conclusions. Use exactly this format: { "results": [ { "title": "Idea 1", "explanation": "Pro: [Advantage of the idea]. Con: [Disadvantage of the idea]. [Brief summary of analysis]." }, { "title": "Idea 2", "explanation": "Pro: [Advantage of the idea]. Con: [Disadvantage of the idea]. [Brief summary of analysis]." } ], "metadata": { "additionalInfo": "[Any overall observations, patterns, or suggestions related to the brainstormed ideas as a whole]" } } In the "metadata" section, provide additional insights about the ideas as a whole. FINAL CHECKLIST BEFORE RESPONDING: Is your entire response valid JSON that could be parsed by a JSON parser? Did you remove ALL text outside the JSON structure? Did you ensure all quotes within strings are properly escaped? Did you avoid using any markdown formatting symbols? Are you certain your response begins with { and ends with } with nothing else?`
                  }
                ]
              }
            ]
          });

          let responseContent = '';
          if (msg.content[0].type === 'text') {
              responseContent = msg.content[0].text;
          }
          
          // Parse the text content as JSON
          let parsedResponse;
          try {
              parsedResponse = JSON.parse(responseContent);
              console.log('Successfully parsed response:', parsedResponse);
          } catch (error) {
              console.error('Failed to parse AI response as JSON:', responseContent);
              throw new Error('AI returned invalid JSON format');
          }
        
        return NextResponse.json(parsedResponse);
    } catch (error: any) {
        console.error('Error processing AI feedback request:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process request' },
            { status: 500 }
        );
    }
}