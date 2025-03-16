"use client";

import { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { useParams, useRouter } from "next/navigation";
import { getRoomDetails, fetchResult } from "@/store/slices/roomSlice";
import { getAIChat } from "@/store/slices/discussionSlice";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";

const IdeaDiscussionPage = () => {
  const { meetingId, ideaId } = useParams();
  const dispatch = useAppDispatch();
  const [userQuestion, setUserQuestion] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { result } = useAppSelector((state) => state.room);
  const { elaborateLoading } = useAppSelector((state) => state.discussion);
  const { loading, context, contextHistory } = useAppSelector(
    (state) => state.discussion
  );

  useEffect(() => {
    dispatch(getRoomDetails(Number(meetingId)));
    dispatch(fetchResult(meetingId as string));
  }, [dispatch, meetingId]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [contextHistory]);

  const handleSubmit = async () => {
    if (!userQuestion.trim() || !context) return;

    await dispatch(
      getAIChat({
        context: context,
        ask: userQuestion,
      })
    );
    setUserQuestion("");
  };

  return (
    <div className="flex flex-col ">
      <div className="flex-1 p-4">
        <div className="max-w-3xl mx-auto">
          <ScrollArea ref={scrollAreaRef} className="h-[calc(70vh)]">
            {result && result[Number(ideaId)] && (
              <Card className="mb-8">
                <CardContent className="pt-6">
                  <h2 className="text-2xl font-bold mb-4">
                    {result[Number(ideaId)].title}
                  </h2>
                  <div className="text-gray-600">
                    <ReactMarkdown>
                      {result[Number(ideaId)].explanation}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}

            {elaborateLoading && (
              <Card className="animate-pulse mb-8">
                <CardContent className="pt-6">
                  <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-gray-200 rounded"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                  </div>
                  <div className="text-center mt-4 text-gray-500">
                    Loading elaboration...
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              {contextHistory.map((text, index) => (
                <Card key={index} className="bg-gray-50">
                  <CardContent className="pt-6">
                    <div className="prose dark:prose-invert">
                      <ReactMarkdown>{text}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="border-t bg-background p-4">
        <div className="max-w-3xl mx-auto flex gap-4">
          <Textarea
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            placeholder="Ask a question about this idea..."
            className="flex-1"
          />
          <Button
            onClick={handleSubmit}
            disabled={loading || !userQuestion.trim()}
            className="self-end"
          >
            {loading ? "Thinking..." : "Ask"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IdeaDiscussionPage;
