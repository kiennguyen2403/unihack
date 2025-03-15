import { createDataStaxClient, Idea } from "@/utils/datastax";
import { vector } from "@datastax/astra-db-ts";
import { NextRequest } from "next/server";


export async function POST(req: NextRequest) {
    try {
        const db = createDataStaxClient();
        const {
            meetingId,
            title,
            ideas,
        } = await req.json();
        const collection = await db.createCollection<Idea>(`meeting ${meetingId}`, {
            vector: {
                service: {
                    provider: 'nvidia',
                    modelName: "NV-Embed-QA",
                }
            }
        })
        collection.insertMany(ideas.map((idea: Idea) => ({ ...idea, title })));
        return new Response('Success', { status: 200 });

    } catch (error) {
        console.error(error);
        return new Response('Error', { status: 500 });
    }
}