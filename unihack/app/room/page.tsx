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
import { updateHostData, updateMemberData } from "@/store/slices/userSlice";

const CreateRoomPage = () => {
  const [goal, setGoal] = useState("");
  const [roomId, setRoomId] = useState("");
  const router = useRouter();
  const dispatch = useAppDispatch();
  const createdRoomId = useAppSelector((state) => state.room.createdRoomId);

  const handleCreateRoom = () => {
    if (!goal.trim()) return;
    dispatch(createRoom(goal));
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) return;
    dispatch(updateMemberData(roomId));
    router.push(`/room/${roomId}`);
  };

  useEffect(() => {
    if (createdRoomId) {
      dispatch(updateHostData(createdRoomId));
      router.push(`/room/${createdRoomId}`);
    }
  }, [createdRoomId]);

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
                <Button className="w-full" onClick={handleCreateRoom}>
                  Create Room
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
                <Button className="w-full" onClick={handleJoinRoom}>
                  Join Room
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
