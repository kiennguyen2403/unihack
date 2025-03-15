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
import Countdown from "@/components/common/Coutdown";
import { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { TypingBubble } from "@/components/common/TypingBubble";
import { IdeaBubble } from "@/utils/types";
import IdeaBall from "@/components/common/IdeaBall";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const SessionPage = () => {
  const [ideas, setIdeas] = useState<IdeaBubble[]>([]);
  const { roomId, goal } = useAppSelector((state) => state.room);
  const { role } = useAppSelector((state) => state.user);
  const [currentIdea, setCurrentIdea] = useState("");

  const [isEnded, setIsEnded] = useState(false);
  const [isTimesUp, setIsTimesUp] = useState(false);
  const channel = useRef<RealtimeChannel | null>(null);
  const [someoneIsTyping, setSomeoneIsTyping] = useState(false);

  const { user } = useUser();
  const userId = user?.id;

  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentIdea.trim()) {
      const newIdea = currentIdea.trim();
      channel.current?.send({
        type: "broadcast",
        event: "ADD_IDEA",
        payload: { idea: newIdea, userId: userId },
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
        if (!prevIdeas.some((idea) => idea.idea === payload.idea)) {
          return [...prevIdeas, { idea: payload.idea, userId: payload.userId }];
        }
        return prevIdeas;
      });
    });

    // Handle TYPING_IDEA event (optional: could show who's typing)
    channel.current.on("broadcast", { event: "TYPING_IDEA" }, ({ payload }) => {
      setSomeoneIsTyping(!!payload.idea.trim());
    });

    // Subscribe to the channel
    channel.current.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        console.log("Successfully subscribed to channel");
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        // console.error("Channel error:", status);
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

  const handleEndSession = () => {
    channel.current?.send({
      type: "broadcast",
      event: "END_SESSION",
    });
    setIsEnded(true);
    // TODO: add a loading state for generating AI analysis and then redirect
    router.push(`/room/${roomId}/results`);
  };

  return (
    <div className="w-full flex justify-center items-center min-h-[80vh]">
      <Card className="w-full">
        <CardHeader>
          <CardDescription className="text-center">
            Brainstorming Session
          </CardDescription>
          <CardTitle className="text-2xl text-center">
            {goal || "No goal set"}
          </CardTitle>
          <div className="flex justify-center items-center gap-4">
            <Countdown onEnd={() => setIsTimesUp(true)} />
            {role === "host" && isTimesUp && (
              <Button onClick={handleEndSession}>End Session</Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="relative min-h-[60vh] bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6">
            <div className="absolute top-[-0.5em] right-[-0.5em]">
              <TypingBubble isTyping={someoneIsTyping} />
            </div>
            <div className="flex flex-wrap gap-4">
              {ideas.map((idea, index) => (
                <IdeaBall key={index} idea={idea.idea} userId={idea.userId} />
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
