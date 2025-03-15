"use client";

import { useEffect, useRef, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import Countdown from "@/components/common/Coutdown"; // Typo: should be "Countdown"
import { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { TypingBubble } from "@/components/common/TypingBubble";
import { Idea } from "@/utils/types";
import IdeaBall, { IDEA_BALL_COLORS } from "@/components/common/IdeaBall";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import {
  endSessionAndGetResult,
  getRoomDetails,
} from "@/store/slices/roomSlice";

const SessionPage = () => {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const { roomDetails, result } = useAppSelector((state) => state.room);
  const { role } = useAppSelector((state) => state.user);
  const [currentIdea, setCurrentIdea] = useState("");
  const [isEnded, setIsEnded] = useState(false);
  const [isTimesUp, setIsTimesUp] = useState(false);
  const channel = useRef<RealtimeChannel | null>(null);
  const [someoneIsTyping, setSomeoneIsTyping] = useState(false);

  const { user } = useUser();
  const userId = user?.id;

  const params = useParams();
  const roomId = typeof params.id === "string" ? parseInt(params.id) : null;

  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentIdea.trim()) {
      const newIdea = {
        idea: currentIdea.trim(),
        userId: userId,
        color:
          IDEA_BALL_COLORS[Math.floor(Math.random() * IDEA_BALL_COLORS.length)],
      };

      channel.current?.send({
        type: "broadcast",
        event: "ADD_IDEA",
        payload: newIdea,
      });

      setCurrentIdea(""); // This will trigger handleIdeaChange to send END_TYPING
    }
  };

  const handleEndSession = () => {
    channel.current?.send({
      type: "broadcast",
      event: "END_SESSION",
    });
    setIsEnded(true);
    dispatch(
      endSessionAndGetResult({
        roomId: Number(roomId),
        ideas: ideas.map((idea) => idea.idea),
        goal: roomDetails?.goal || "",
      })
    );
  };

  const handleIdeaChange = (value: string) => {
    if (value.trim()) {
      channel.current?.send({
        type: "broadcast",
        event: "TYPING_IDEA",
        payload: { idea: value },
      });
    } else {
      channel.current?.send({
        type: "broadcast",
        event: "END_TYPING",
        payload: {},
      });
    }
    setCurrentIdea(value);
  };

  useEffect(() => {
    if (result && isEnded) {
      router.push(`/room/${roomId}/results`);
    }
  }, [result, isEnded, roomId, router]);

  useEffect(() => {
    if (roomId) {
      dispatch(getRoomDetails(roomId));
    }
  }, [roomId, dispatch]);

  useEffect(() => {
    const client = createClient();
    channel.current = client.channel(`room:${roomId}`, {
      config: {
        broadcast: {
          self: true,
          ack: true,
        },
      },
    });

    channel.current.on("broadcast", { event: "ADD_IDEA" }, ({ payload }) => {
      setIdeas((prevIdeas) => {
        if (!prevIdeas.some((idea) => idea.idea === payload.idea)) {
          return [...prevIdeas, payload];
        }
        return prevIdeas;
      });
    });

    channel.current.on("broadcast", { event: "END_SESSION" }, () => {
      setIsEnded(true);
      router.push(`/room/${roomId}/result`);
    });

    channel.current.on("broadcast", { event: "TYPING_IDEA" }, ({ payload }) => {
      setSomeoneIsTyping(!!payload.idea.trim());
    });

    channel.current.on("broadcast", { event: "END_TYPING" }, () => {
      setSomeoneIsTyping(false);
    });

    channel.current.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        console.log("Successfully subscribed to channel");
      }
    });

    return () => {
      if (channel.current) {
        channel.current.unsubscribe();
        channel.current = null;
      }
    };
  }, [roomId]);

  return (
    <div className="w-full flex justify-center items-center min-h-[80vh]">
      <Card className="w-full">
        <CardHeader>
          <CardDescription className="text-center">
            Brainstorming Session
          </CardDescription>
          <CardTitle className="text-2xl text-center">
            {roomDetails?.goal || "No goal set"}
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
                disabled={isEnded}
                value={currentIdea}
                onChange={(e) => handleIdeaChange(e.target.value)}
                placeholder="Share your idea..."
              />
              <Button type="submit" disabled={isEnded}>
                Add
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SessionPage;
