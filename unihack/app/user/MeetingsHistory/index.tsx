import { Meeting } from "@/utils/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatDate } from "@/lib/utils";
import Link from "next/link";
interface MeetingsHistoryProps {
  meetings: Meeting[];
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function MeetingsHistory({
  meetings,
  collapsed,
  setCollapsed,
}: MeetingsHistoryProps) {
  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-screen bg-background border-r transition-all duration-300",
        collapsed ? "w-[40px]" : "w-[300px]"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 rounded-full border bg-background shadow-sm"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </Button>

      <div className={cn(collapsed ? "hidden" : "p-4")}>
        <h2 className="text-sm font-semibold mb-8">Meeting History</h2>
        <ScrollArea className="h-[calc(100vh-100px)]">
          <div className="space-y-3">
            {meetings.map((meeting) => (
              <Button
                key={meeting.id}
                variant="ghost"
                className="w-full justify-start text-sm font-normal"
                onClick={() => {
                  setCollapsed(true);
                }}
              >
                <Link href={`/chat/${meeting.id}`} className="w-full">
                  <div className="flex flex-col items-start gap-1 py-2">
                    <span className="font-bold">{meeting.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(meeting.created_at)}
                    </span>
                  </div>
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
