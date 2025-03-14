import { createClient } from "@/utils/supabase/server";
import { auth, currentUser, getAuth } from '@clerk/nextjs/server';
import { NextRequest } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId, getToken } = getAuth(request);
        if (!userId) {
            return new Response('Unauthorized', { status: 401 });
        }

        const supabase = await createClient();
        const { id } = await params;
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw error;
        }
        return Response.json(data);
    } catch (e: any) {
        return Response.json({
            error: e,
        }, {
            status: 500,
        });
    }
}
