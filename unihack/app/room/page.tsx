"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { createRoom } from "@/store/slices/roomSlice";
import {
  clearUserData,
  joinRoom,
  updateHostData,
  updateMemberData,
} from "@/store/slices/userSlice";
import { useUser } from "@clerk/nextjs";

const CreateRoomPage = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const [goal, setGoal] = useState("");
  const [roomId, setRoomId] = useState("");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { createdRoomId, loading } = useAppSelector((state) => state.room);

  const handleCreateRoom = () => {
    if (!goal.trim() || !user?.id) return;
    dispatch(createRoom(goal));
  };

  const handleJoinRoom = () => {
    if (!roomId.trim() || !user?.id) return;
    dispatch(joinRoom({ meeting_id: roomId, user_id: user?.id }));
    dispatch(updateMemberData(roomId));
    router.push(`/room/${roomId}`);
  };

  useEffect(() => {
    if (createdRoomId) {
      dispatch(updateHostData(createdRoomId));
      router.push(`/room/${createdRoomId}`);
    }
  }, [createdRoomId]);

  // useEffect(() => {
  //   dispatch(clearUserData());
  // }, []);

  return (
    <div className="w-[50%] flex justify-center items-center min-h-[80vh]">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Start Brainstorming!
          </CardTitle>
          <CardDescription className="text-center">
            Create or join a brainstorming room
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Room</TabsTrigger>
              <TabsTrigger value="join">Join Room</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter brainstorming goal"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                />
                <Button
                  className={`w-full ${loading ? "bg-gray-300 text-gray-500" : ""}`}
                  onClick={handleCreateRoom}
                  disabled={loading}
                >
                  {loading ? "Creating Room..." : "Create Room"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="join" className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                />
                <Button
                  className={`w-full ${loading ? "bg-gray-300 text-gray-500" : ""}`}
                  onClick={handleJoinRoom}
                  disabled={loading}
                >
                  {loading ? "Joining Room..." : "Join Room"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateRoomPage;
