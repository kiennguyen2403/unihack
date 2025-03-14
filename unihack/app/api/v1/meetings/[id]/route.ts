import { createClient } from "@/utils/supabase/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const { id } = await params;
        const { data, error } = await supabase
            .from('meetings')
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

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const { id } = await params;
        const { data, error } = await supabase
            .from('meetings')
            .update(await request.json())
            .eq('id', id);
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

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }) {
    try {
        const supabase = await createClient();
        const { id } = await params;
        const { data, error } = await supabase
            .from('meetings')
            .delete()
            .eq('id', id);
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