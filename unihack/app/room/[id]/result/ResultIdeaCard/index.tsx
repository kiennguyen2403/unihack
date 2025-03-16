import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  addContext,
  addContextHistory,
  elaborateIdea,
} from "@/store/slices/discussionSlice";
import { useEffect } from "react";
import LoadingOverlay from "@/components/common/LoadingOverlay";
import { useRouter } from "next/navigation";

interface ResultIdeaCardProps {
  title: string;
  explanation: string;
  stars?: number;
  onStarClick?: () => void;
  id?: string;
}

const ResultIdeaCard = ({
  title,
  explanation,
  stars = 0,
  onStarClick,
  id,
}: ResultIdeaCardProps) => {
  const dispatch = useAppDispatch();
  const { roomDetails } = useAppSelector((state) => state.room);
  const { elaboration, elaborateLoading } = useAppSelector(
    (state) => state.discussion
  );
  const router = useRouter();

  const handleElaborate = () => {
    if (roomDetails) {
      dispatch(
        elaborateIdea({
          topic: roomDetails?.goal,
          idea: `"${title}"\n${explanation}`,
        })
      );
    }
  };

  useEffect(() => {
    if (elaboration) {
      dispatch(addContext({ text: elaboration }));
      dispatch(addContextHistory({ text: elaboration }));
      router.push(`/chat/${roomDetails?.id}/${id}`);
    }
  }, [elaboration, router, roomDetails, id]);

  return (
    <Card className="w-full">
      {elaborateLoading && (
        <LoadingOverlay message="Elaborating..." seconds={25} />
      )}
      <CardHeader className="w-full flex justify-between">
        <div className="flex w-full justify-between items-center gap-2">
          <CardTitle>{title}</CardTitle>
          <button
            onClick={onStarClick}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3"
          >
            <Star
              className={`w-4 h-4 mr-1 ${stars > 0 ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
            />
            <span className="text-sm text-muted-foreground">{stars}</span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          {explanation
            .replace(/\./g, ".<br/>")
            .replace("Pro:", "💡 Pro:")
            .replace("Con:", "⚠️ Con:")
            .split("<br/>")
            .map((part, i) => (
              <span key={i}>
                {part}
                {i < explanation.split(/\./g).length - 1 && <br />}
              </span>
            ))}
        </p>
        <Button variant="outline" className="w-full" onClick={handleElaborate}>
          Elaborate on This
        </Button>
      </CardContent>
    </Card>
  );
};

export default ResultIdeaCard;
