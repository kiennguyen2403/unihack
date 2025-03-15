import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

interface ResultIdeaCardProps {
  title: string;
  explanation: string;
  stars?: number;
  onStarClick?: () => void;
}

const ResultIdeaCard = ({
  title,
  explanation,
  stars = 0,
  onStarClick,
}: ResultIdeaCardProps) => {
  return (
    <Card className="w-full">
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
      <CardContent>
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
      </CardContent>
    </Card>
  );
};

export default ResultIdeaCard;
