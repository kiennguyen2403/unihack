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
import { useParams, useRouter } from "next/navigation";
import { getDataFromLocalStorage } from "@/store/slices/userSlice";

const RoomPage = () => {
  const { roomDetails, loading } = useAppSelector((state) => state.room);
  const { user } = useAppSelector((state) => state.auth);
  const { role, roomId: userRoomId } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const [editableGoal, setEditableGoal] = useState(roomDetails?.goal || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [members, setMembers] = useState<
    { id: string; email: string; role: string }[]
  >([]);
  const channel = useRef<RealtimeChannel | null>(null);
  const { id: roomId } = useParams();
  const router = useRouter();
  const currentUserId = user?.id; // Assuming user object has an id field

  // Fetch room details on mount or roomId change
  useEffect(() => {
    if (roomId) {
      dispatch(getRoomDetails(Number(roomId)));
    }
  }, [roomId, dispatch]);

  // Sync local state with roomDetails.goal
  useEffect(() => {
    setEditableGoal(roomDetails?.goal || "");
  }, [roomDetails?.goal]);

  // Fetch user data from local storage
  useEffect(() => {
    dispatch(getDataFromLocalStorage());
  }, [dispatch]);

  // Determine if user is host
  useEffect(() => {
    console.log(role === "host" && userRoomId == roomId);
    if (role === "host" && userRoomId == roomId) {
      setIsHost(true);
    } else {
      setIsHost(false);
    }
  }, [role, userRoomId, roomId]);

  // Real-time subscription setup
  useEffect(() => {
    if (!roomId || channel.current) return;

    const client = createClient();
    channel.current = client.channel(`waitingroom:${roomId}`, {
      config: { broadcast: { self: true } },
    });

    channel.current
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "events",
          filter: `meeting_id=eq.${roomId}`,
        },
        (payload) => {
          const updatedEvent = payload.new;
          if (updatedEvent.user_id) {
            handleMemberUpdate(updatedEvent.user_id, updatedEvent.role);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "events",
          filter: `meeting_id=eq.${roomId}`,
        },
        (payload) => {
          const newEvent = payload.new;
          console.log("New event:", newEvent);
          if (newEvent.user_id) {
            handleMemberInsert(newEvent.user_id, newEvent.role);
          }
        }
      )
      .on("broadcast", { event: "START_SESSION" }, () => {
        router.push(`/room/${roomId}/session`);
      })
      .on("broadcast", { event: "LEAVE_ROOM" }, () => {
        router.push(`/user`);
      })
      .subscribe(async (status) => {
        console.log("Subscription status:", status);
        if (status === "SUBSCRIBED") {
          fetchInitialMembers();
        } else {
          await client
            .from("events")
            .update({
              status: "LEAVE",
            })
            .eq("meeting_id", roomId)
            .eq("user_id", currentUserId);

          if (channel.current && isHost) {
            client.removeChannel(channel.current);
          }
        }
      });

    return () => {
      if (channel.current) {
        channel.current.unsubscribe();
        channel.current = null;
      }
    };
  }, [roomId, dispatch, router, currentUserId]);

  const generateRandomName = () => {
    const adjectives = [
      "Adorable",
      "Beautiful",
      "Clever",
      "Delightful",
      "Eager",
      "Fierce",
      "Gentle",
      "Happy",
      "Innocent",
      "Jolly",
    ];
    const nouns = [
      "Apple",
      "Banana",
      "Cherry",
      "Date",
      "Elderberry",
      "Fig",
      "Grape",
      "Honeydew",
    ];
    const randomAdjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${randomAdjective} ${randomNoun}`;
  };

  // Fetch initial members and generate names
  const fetchInitialMembers = async () => {
    try {
      const client = createClient();
      const { data, error } = await client
        .from("events")
        .select("user_id, role") // Fetch both user_id and role
        .eq("meeting_id", roomId);

      if (error) throw error;

      const newMembers =
        data?.map((event: { user_id: string; role: string | null }) => {
          if (event.user_id === currentUserId) {
            // Use actual user data for current user
            return {
              id: event.user_id,
              email: user?.email || "You",
              role: event.role || "ATTENDEE", // Preserve role from events or default to ATTENDEE
            };
          } else {
            // Generate random name and set role to ATTENDEE for others
            return {
              id: event.user_id,
              email: generateRandomName(),
              role: "ATTENDEE",
            };
          }
        }) || [];
      console.log("Initial members:", newMembers);
      setMembers(newMembers);
    } catch (error) {
      console.error("Error fetching initial members:", error);
    }
  };

  // Handle member update from real-time subscription
  const handleMemberUpdate = (userId: string, role: string) => {
    setMembers((prev) => {
      const exists = prev.some((m) => m.id === userId);
      if (!exists) {
        if (userId === currentUserId) {
          return [
            ...prev,
            {
              id: userId,
              email: user?.email || "You",
              role: role || role, // Use role from event or Redux
            },
          ];
        } else {
          return [
            ...prev,
            {
              id: userId,
              email: generateRandomName(),
              role: role || "ATTENDEE",
            },
          ];
        }
      }
      return prev; // If already exists, no change
    });
  };

  // Handle member insert from real-time subscription
  const handleMemberInsert = (userId: string, role: string) => {
    console.log("New member:", userId, role);
    setMembers((prev) => {
      if (!prev.some((m) => m.id === userId)) {
        if (userId === currentUserId) {
          return [
            ...prev,
            {
              id: userId,
              email: user?.email || "You",
              role, // Use role from event or Redux
            },
          ];
        } else {
          return [
            ...prev,
            {
              id: userId,
              email: generateRandomName(),
              role,
            },
          ];
        }
      }
      return prev;
    });
  };

  const handleEditGoal = () => {
    setIsEditing(true);
  };

  const handleSaveGoal = () => {
    if (editableGoal.trim() && editableGoal !== roomDetails?.goal) {
      dispatch(
        patchGoal({ goal: editableGoal.trim(), meetingId: Number(roomId) })
      );
    }
    setIsEditing(false);
  };

  const handleStartSession = () => {
    if (!isHost) return;
    channel.current?.send({
      type: "broadcast",
      event: "START_SESSION",
      payload: {},
    });
    router.push(`/room/${roomId}/session`);
  };

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
                  placeholder="Enter session goal"
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
              {members.map((member) => (
                <Badge
                  key={member.id}
                  variant="secondary"
                  className="text-sm py-2 px-4"
                >
                  {member.email} (
                  {role?.toUpperCase() != "HOST" ? "ATTENDEE" : "HOST"})
                </Badge>
              ))}
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
