"use client";

import { useState } from "react";
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

const CreateRoomPage = () => {
  const [goal, setGoal] = useState("");
  const [roomId, setRoomId] = useState("");
  const router = useRouter();

  const handleCreateRoom = () => {
    if (!goal.trim()) return;
    // TODO: Implement room creation logic
    router.push(`/room/${Date.now()}`); // Temporary implementation
  };

  const handleJoinRoom = () => {
    if (!roomId.trim()) return;
    router.push(`/room/${roomId}`);
  };

  return (
    <div className="w-full flex justify-center items-center min-h-[80vh]">
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
