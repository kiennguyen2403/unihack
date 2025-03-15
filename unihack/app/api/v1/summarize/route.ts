import { createDataStaxClient } from "@/utils/datastax";
import { NextRequest } from "next/server"; 

export async function POST(req: NextRequest) {
    try {
        const db = createDataStaxClient();
        const {
            meetingId,
            goal,
            ideas,
        } = await req.json();
        const table = await db.createCollection(`meeting ${meetingId}`)
        table.insertOne({
            goal,
            ideas,
        });
        return new Response('Success', { status: 200 });

    } catch (error) {
        console.error(error);
        return new Response('Error', { status: 500 });
    }
}