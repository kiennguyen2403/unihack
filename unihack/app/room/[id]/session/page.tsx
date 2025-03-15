"use client";

import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";

const SessionPage = () => {
  const [ideas, setIdeas] = useState<string[]>([]);
  const { roomId, goal } = useAppSelector((state) => state.room);
  const [currentIdea, setCurrentIdea] = useState("");
  const channel = useRef<RealtimeChannel | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentIdea.trim()) {
      const newIdea = currentIdea.trim();
      channel.current?.send({
        type: "broadcast",
        event: "ADD_IDEA",
        payload: { idea: newIdea },
      });
      setCurrentIdea("");
    }
  };

  useEffect(() => {
    const client = createClient();
    channel.current = client.channel(`room:${roomId}`, {
      config: {
        broadcast: {
          self: true, // This ensures the sender also receives their own messages
          ack: true, // Request acknowledgment
        },
      },
    });

    // Handle ADD_IDEA event
    channel.current.on("broadcast", { event: "ADD_IDEA" }, ({ payload }) => {
      console.log("Received new idea:", payload.idea);
      setIdeas((prevIdeas) => {
        // Prevent duplicate ideas
        if (!prevIdeas.includes(payload.idea)) {
          return [...prevIdeas, payload.idea];
        }
        return prevIdeas;
      });
    });

    // Handle TYPING_IDEA event (optional: could show who's typing)
    channel.current.on("broadcast", { event: "TYPING_IDEA" }, ({ payload }) => {
      console.log("Someone is typing:", payload.idea);
    });

    // Subscribe to the channel
    channel.current.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        console.log("Successfully subscribed to channel");
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        console.error("Channel error:", status);
      }
    });

    // Cleanup
    return () => {
      if (channel.current) {
        channel.current.unsubscribe();
        channel.current = null;
      }
    };
  }, [roomId]); // Add roomId as dependency since it's used in the channel name

  return (
    <div className="w-full flex justify-center items-center min-h-[80vh]">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Brainstorming Session
          </CardTitle>
          <CardDescription className="text-center">
            Goal: {goal || "No goal set"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="min-h-[200px] bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6">
            <div className="flex flex-wrap gap-4">
              {ideas.map((idea, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow animate-fade-in"
                >
                  {idea}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={currentIdea}
                onChange={(e) => {
                  channel.current?.send({
                    type: "broadcast",
                    event: "TYPING_IDEA",
                    payload: { idea: e.target.value },
                  });
                  setCurrentIdea(e.target.value);
                }}
                placeholder="Share your idea..."
              />
              <Button type="submit">Add</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionPage;
