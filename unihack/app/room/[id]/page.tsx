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
import { getRoomDetails, patchGoal } from "@/store/slices/roomSlice";
import { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { Input } from "@/components/ui/input";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { getDataFromLocalStorage } from "@/store/slices/userSlice";

const RoomPage = () => {
  const { roomDetails, loading } = useAppSelector((state) => state.room);
  const user = useAppSelector((state) => state.auth.user);
  const { role, roomId: userRoomId } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [editableGoal, setEditableGoal] = useState(roomDetails?.goal || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const channel = useRef<RealtimeChannel | null>(null);
  const roomId = useParams().id as string;
  const router = useRouter();

  useEffect(() => {
    if (roomId) {
      dispatch(getRoomDetails(Number(roomId)));
    }
  }, [roomId]);

  useEffect(() => {
    dispatch(getDataFromLocalStorage());
  }, [roomId]);

  useEffect(() => {
    if (role === "host") {
      if (userRoomId == roomId) {
        setIsHost(true);
      }
    }
  }, [userRoomId, roomId]);

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

  const handleStartSession = () => {
    router.push(`/room/${roomId}/session`);
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
              {!isEditing && isHost && (
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
                {user?.email || "You"} ({role})
              </Badge>
            </div>
          </div>

          <Button
            className={`w-full ${!isHost || loading ? "bg-gray-300 text-gray-500" : ""}`}
            disabled={!isHost || loading}
            onClick={handleStartSession}
          >
            {isHost ? "Start Thubbling" : "Waiting for host to start..."}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomPage;
