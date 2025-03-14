import { createClient } from "@/utils/supabase/server";
import { auth, currentUser } from '@clerk/nextjs/server';

export async function GET(
    request: Request, 
    { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { userId, getToken } = await auth()

        if (!userId) {
            return new Response('Unauthorized', { status: 401 })
        }

        const token = await getToken({ template: 'supabase' })

        const supabase = await createClient();
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('userId', userId);
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