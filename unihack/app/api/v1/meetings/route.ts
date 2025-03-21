import { createClient } from "@/utils/supabase/server";
import { auth, currentUser, getAuth } from '@clerk/nextjs/server';
import { NextRequest } from "next/server";


export async function GET(request: NextRequest) {
    try {
        const { userId, getToken } = getAuth(request);
        if (!userId) {
            return new Response('Unauthorized', { status: 401 });
        }

        const supabase = await createClient();
        const { data, error } = await supabase
            .from('meetings')
            .select('*');
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

export async function POST(request: NextRequest) {
    try {
        const { userId, getToken } = getAuth(request);
        if (!userId) {
            return new Response('Unauthorized', { status: 401 });
        }
        // const token = await getToken({ template: 'supabase' })

        const supabase = await createClient();

        const { data, error } = await supabase
            .from('meetings')
            .insert(await request.json())
            .select()
            .single();

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

