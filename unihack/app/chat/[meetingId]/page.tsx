"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { getRoomDetails, fetchResult } from "@/store/slices/roomSlice";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  addContext,
  addContextHistory,
  elaborateIdea,
} from "@/store/slices/discussionSlice";
import LoadingOverlay from "@/components/common/LoadingOverlay";

const ChatPage = () => {
  const { meetingId } = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { roomDetails, result } = useAppSelector((state) => state.room);
  const { elaboration, elaborateLoading } = useAppSelector(
    (state) => state.discussion
  );
  const [selectedIdeaId, setSelectedIdeaId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(getRoomDetails(Number(meetingId)));
    dispatch(fetchResult(meetingId as string));
  }, [dispatch, meetingId]);

  const handleIdeaClick = (ideaId: number) => {
    setSelectedIdeaId(ideaId);

    if (result && roomDetails) {
      dispatch(
        elaborateIdea({
          topic: roomDetails?.goal,
          idea: result[ideaId].explanation,
        })
      );
      dispatch(
        addContextHistory({
          text: `Topic: ${roomDetails?.goal}\nIdea: ${result[ideaId].title}\nDetails: ${result[ideaId].explanation}`,
        })
      );
      dispatch(
        addContext({
          text: `Topic: ${roomDetails?.goal}\nIdea: ${result[ideaId].title}\nDetails: ${result[ideaId].explanation}`,
        })
      );
    }
  };

  useEffect(() => {
    if (elaboration && selectedIdeaId !== null) {
      dispatch(addContext({ text: elaboration }));
      dispatch(addContextHistory({ text: elaboration }));
      router.push(`/chat/${meetingId}/${selectedIdeaId}`);
    }
  }, [elaboration, selectedIdeaId, dispatch, router, meetingId]);

  return (
    <div className="container mx-auto py-8">
      {elaborateLoading && (
        <LoadingOverlay message="Elaborating your ideas..." seconds={20} />
      )}
      <h1 className="text-3xl font-bold mb-8">{roomDetails?.goal}</h1>

      {result && result.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {result.map((idea, index) => (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col"
            >
              <CardHeader>
                <h2 className="text-xl font-semibold">{idea.title}</h2>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <p className="text-gray-600 mb-4">
                  {idea.explanation
                    .replace(/\./g, ".<br/>")
                    .replace("Pro:", "💡 Pro:")
                    .replace("Con:", "⚠️ Con:")
                    .split("<br/>")
                    .map((part, i) => (
                      <span key={i}>
                        {part}
                        {i < idea.explanation.split(/\./g).length - 1 && <br />}
                      </span>
                    ))}
                </p>
                <div className="mt-auto">
                  <Button
                    onClick={() => handleIdeaClick(index)}
                    className="w-full"
                    disabled={elaborateLoading}
                  >
                    {elaborateLoading ? "Loading..." : "Elaborate Discussion"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 text-lg">
            No results have been generated for this meeting yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
