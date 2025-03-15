"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function UserPage() {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[80vh] gap-4">
      <h1 className="text-4xl font-bold">Welcome to Thubble</h1>
      <p className="text-lg text-muted-foreground">
        Start brainstorming with your team
      </p>
      <Button size="lg" onClick={() => router.push("/room")}>
        Get Started
      </Button>
    </div>
  );
}
