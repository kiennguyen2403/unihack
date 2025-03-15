"use client";

import { useEffect, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  getRoomDetails,
  patchGoal,
  updateGoal,
} from "@/store/slices/roomSlice";
import { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";

const RoomPage = () => {
  const { roomDetails } = useAppSelector((state) => state.room);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const [editableGoal, setEditableGoal] = useState(roomDetails?.goal || "");
  const [isEditing, setIsEditing] = useState(false);
  const channel = useRef<RealtimeChannel | null>(null);

  const roomId = useParams().id as string;

  useEffect(() => {
    if (roomId) {
      dispatch(getRoomDetails(Number(roomId)));
    }
  }, [roomId]);

  const handleEditGoal = () => {
    setIsEditing(true);
    setEditableGoal(roomDetails?.goal || "");
  };

  const handleSaveGoal = () => {
    if (editableGoal.trim()) {
      dispatch(
        patchGoal({ goal: editableGoal.trim(), meetingId: Number(roomId) })
      );
    }
    setIsEditing(false);
  };

  useEffect(() => {
    if (!channel.current) {
      const client = createClient();
      channel.current = client.channel(`waitingroom:${roomId}`, {
        config: {
          broadcast: {
            self: true,
          },
        },
      });

      channel.current
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "events" },
          (payload) => {
            {
              console.log("Received payload", payload);
            }
          }
        )
        .subscribe();
    }

    return () => {
      channel.current?.unsubscribe();
      channel.current = null;
    };
  }, []);

  return (
    <div className="w-[50%] flex justify-center items-center min-h-[80vh]">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Waiting Room</CardTitle>
          <CardDescription className="text-center">
            Configure your brainstorming session
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between items-center">
              <Label className="text-lg">Goal</Label>
              {!isEditing && (
                <Button onClick={handleEditGoal} variant="ghost" size="sm">
                  Edit
                </Button>
              )}
            </div>
            {isEditing ? (
              <div className="flex gap-2 mt-2">
                <Input
                  value={editableGoal}
                  onChange={(e) => setEditableGoal(e.target.value)}
                />
                <Button onClick={handleSaveGoal}>Save</Button>
              </div>
            ) : (
              <div className="mt-2 p-4 rounded-lg border">
                <p className="text-gray-700">
                  {roomDetails?.goal || "No goal set"}
                </p>
              </div>
            )}
          </div>

          <div>
            <Label className="text-lg">Members</Label>
            <div className="flex flex-wrap gap-2 mt-4">
              <Badge variant="secondary" className="text-sm py-2 px-4">
                {user?.email || "You"} (You)
              </Badge>
            </div>
          </div>

          <Button asChild className="w-full">
            <Link href={`/room/${roomId}/session`}>Start Session</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomPage;
