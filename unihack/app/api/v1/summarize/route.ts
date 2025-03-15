import { createDataStaxClient, Idea } from "@/utils/datastax";
import { NextRequest } from "next/server";

const db = createDataStaxClient();

export async function POST(req: NextRequest) {
    try {

        const {
            meetingId,
            title,
            ideas,
        } = await req.json();
        const collection = await db.createCollection<Idea>(`meeting${meetingId}`, {
            vector: {
                service: {
                    provider: 'nvidia',
                    modelName: "NV-Embed-QA",
                }
            }
        })

        await collection.insertMany(ideas.map((idea: Idea) => ({
            ...idea,
            title,
            $vectorize: `idea: ${idea} | risk_level: ${idea.risk_level}`
        })));
        return new Response('Success', { status: 200 });

    } catch (error) {
        console.error(error);
        return new Response('Error', { status: 500 });
    }
}