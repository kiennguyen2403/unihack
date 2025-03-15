import { createClient } from "@/utils/supabase/server";
import { auth, currentUser, getAuth } from "@clerk/nextjs/server";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ meetingId: string }> }
) {
  try {
    const { userId, getToken } = getAuth(request);
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const supabase = await createClient();
    const { meetingId } = await params;

    const { data, error } = await supabase
      .from("ideas")
      .select("*")
      .eq("meeting_id", meetingId);

    if (error) {
      throw error;
    }
    return Response.json(data);
  } catch (e) {
    return Response.json(
      {
        error: e,
      },
      {
        status: 500,
      }
    );
  }
}
