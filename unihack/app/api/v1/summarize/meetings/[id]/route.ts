import { createDataStaxClient } from "@/utils/datastax";
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }) {
    try {
        // const { userId } = getAuth(req);
        // if (!userId) {
        //     return new Response('Unauthorized', { status: 401 });
        // }
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const question = searchParams.get('question');
        const db = createDataStaxClient();
        const collection = db.collection(`meetings ${id}`);
        const ideas = collection.find({
            sort: { $vectorize: question },
            limit: 3,
        });
        const results = [];
        for await (const idea of ideas) {
            results.push(idea);
        }
        return new Response(JSON.stringify(results), { status: 200 });
    } catch (error) {
        console.error(error);
        return new Response('Error', { status: 500 });
    }
}
