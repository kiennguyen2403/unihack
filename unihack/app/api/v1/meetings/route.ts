import { createClient } from "@/utils/supabase/server";

export async function GET(
    request: Request) {
    try {
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

export async function POST(
    request: Request) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('meetings')
            .insert(await request.json());
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

