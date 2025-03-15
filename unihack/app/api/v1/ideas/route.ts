import { createClient } from "@/utils/supabase/server";
import { auth, currentUser, getAuth } from '@clerk/nextjs/server';
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { userId, getToken } = await auth();
        if (!userId) {
            return new Response('Unauthorized', { status: 401 });
        }
        const { idea, meetingId } = await request.json();

        const supabase = await createClient();
        const { data, error } = await supabase
            .from('ideas')
            .insert({
                idea,
                user_id: userId,
                meeting_id: meetingId
            });
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

