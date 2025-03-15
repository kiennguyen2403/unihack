import { createDataStaxClient } from "@/utils/datastax";
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const db = createDataStaxClient();

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return new Response('Unauthorized', { status: 401 });
        }

        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const question = searchParams.get('question');
        if (!question) {
            return new Response('Bad Request: question parameter is required', { status: 400 });
        }

        // Query vector database for relevant ideas
        const collection = db.collection(`meeting${id}`);
        const ideas = collection.find(
            {},
            {
                sort: { $vectorize: question },
                limit: 3,
            }
        );

        const results = [];
        for await (const idea of ideas) {
            results.push(idea);
        }

        // Modified prompt to answer the question directly using the retrieved ideas
        const msg = await anthropic.messages.create({
            model: "claude-3-7-sonnet-20250219",
            max_tokens: 20000,
            temperature: 1,
            messages: [
                {
                    role: "user",
                    content: `Based on the following ideas from a meeting, please provide a direct answer to this question: "${question}"
                    
                    Context ideas from the meeting:
                    ${results.map((idea, index) => `${index + 1}. ${JSON.stringify(idea)}`).join('\n')}
                    
                    Please provide a clear, concise answer to the question using the provided context. If the context doesn't contain enough information to fully answer the question, state that and provide the best possible answer based on what's available.`
                }
            ],
        });

        let response = "";
        if (msg.content[0].type === "text") {
            response = msg.content[0].text;
        }

        return new Response(JSON.stringify({
            response,
        }), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response('Error', { status: 500 });
    }
}