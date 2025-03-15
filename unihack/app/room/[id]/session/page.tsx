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
      setIdeas([...ideas, currentIdea.trim()]);
      setCurrentIdea("");
    }
  };

  useEffect(() => {
    if (!channel.current) {
      const client = createClient();
      channel.current = client.channel(`room:${roomId}`, {
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
                onChange={(e) => setCurrentIdea(e.target.value)}
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
