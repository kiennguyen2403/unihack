import { createClient } from "@/utils/supabase/server";
import { auth, currentUser, getAuth } from '@clerk/nextjs/server';
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { userId, getToken } = getAuth(request);
        if (!userId) {
            return new Response('Unauthorized', { status: 401 });
        }
        const { ideas } = await request.json();

        const supabase = await createClient();
        const { data, error } = await supabase
            .from('ideas')
            .insert(ideas);
        if (error) {
            throw error;
        }
        return Response.json(data);

    } catch (e) {
        return Response.json({
            error: e,
        }, {
            status: 500,
        });
    }
}

