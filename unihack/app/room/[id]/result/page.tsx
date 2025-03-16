"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import {
  fetchResult,
  getRoomDetails,
  updateResultVote,
  updateVotes,
} from "@/store/slices/roomSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ResultIdeaCard from "./ResultIdeaCard";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { RealtimeChannel } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { BrainstormResult } from "@/utils/types";

export default function ResultPage() {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams(); // Get params dynamically
  const channel = useRef<RealtimeChannel | null>(null);

  const { result, resultMetadata, loadingResult, roomDetails, loading } =
    useSelector((state: RootState) => state.room);

  const id = params?.id as string | undefined;

  const handleVoting = async (item: BrainstormResult) => {
    try {
      if (!id) return;
      await dispatch(
        updateVotes({ title: item.title, votes: (item.votes ?? 0) + 1, id })
      ).unwrap();
    } catch (error) {
      console.error("Error updating vote:", error);
    }
  };

  useEffect(() => {
    if (id && !channel.current) {
      const client = createClient(); // Assuming createClient is defined elsewhere
      channel.current = client.channel(`votingRoom:${id}`, {
        config: {
          broadcast: {
            self: false,
          },
        },
      });

      channel.current
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "ideas",
            filter: `meeting_id=eq.${id}`, // Fixed filter syntax and using the `id` variable
          },
          (payload) => {
            const updatedIdea = payload.new;
            dispatch(
              updateResultVote({
                id: updatedIdea.id,
                votes: updatedIdea.votes,
              })
            );
          }
        )
        .subscribe();
    }

    return () => {
      if (channel.current) {
        channel.current.unsubscribe();
        channel.current = null;
      }
    };
  }, [id]);

  useEffect(() => {
    if (id && !result) {
      dispatch(fetchResult(id));
      dispatch(getRoomDetails(parseInt(id)));
    }
  }, [dispatch, id, result]);

  return (
    <div>
      {loadingResult && (
        <LoadingOverlay message="Analyzing your brainstorming session..." />
      )}

      {loading && (
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader className="py-3">
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="py-2">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        </div>
      )}

      {!result && !loading ? (
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">
                No results available yet.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="container mx-auto p-6 space-y-6 w-full]">
          <h1 className="text-2xl font-bold">
            {"Goal:  " + roomDetails?.goal}
          </h1>
          <div className="space-y-4">
            {result.map((item, index) => (
              <ResultIdeaCard
                key={index}
                title={item.title}
                explanation={item.explanation}
                stars={item.votes}
                onStarClick={() => handleVoting(item)}
                id={item.id?.toString()}
              />
            ))}
          </div>
          {resultMetadata && (
            <Card className="w-full">
              <CardHeader className="py-3">
                <CardTitle className="text-sm">Overview</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <p className="text-muted-foreground text-xs">
                  {resultMetadata.additionalInfo ||
                    "No additional info available"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
