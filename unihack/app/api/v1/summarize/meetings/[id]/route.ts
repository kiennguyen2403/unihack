import { createDataStaxClient } from "@/utils/datastax";
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }) {
    try {
        const { userId, getToken } = getAuth(req);
        if (!userId) {
            return new Response('Unauthorized', { status: 401 });
        }
        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const question = searchParams.get('question');
        const db = createDataStaxClient();
        const table = db.collection(`meetings ${id}`);
        
    } catch (error) {
        console.error(error);
    }
}
