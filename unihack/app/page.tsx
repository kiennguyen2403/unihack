import { Button } from "@/components/ui/button";
import { Brain, ShieldCheck, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 items-center max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-5xl font-bold text-center bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
        Thubble: AI-Powered Team Brainstorming
      </h1>

      <p className="text-xl text-center text-muted-foreground max-w-2xl">
        Brainstorm freely with your team in a judgment-free zone. Share ideas
        privately, let AI analyze and synthesize everyone's thoughts, and get
        actionable insights.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button asChild size="lg" variant="default">
          <Link href="/auth">Sign Up / Login</Link>
        </Button>

        <Button asChild size="lg" variant="outline">
          <Link href="/room">Get Started</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16">
        <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
          <ShieldCheck className="w-12 h-12 text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">Private & Secure</h3>
          <p className="text-muted-foreground">
            Share ideas privately without fear of judgment
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
          <Brain className="w-12 h-12 text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI-Powered Analysis</h3>
          <p className="text-muted-foreground">
            Let AI process and synthesize team insights
          </p>
        </div>

        <div className="flex flex-col items-center text-center p-6 rounded-lg border bg-card">
          <Users className="w-12 h-12 text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
          <p className="text-muted-foreground">
            Brainstorm effectively as a team
          </p>
        </div>
      </div>

      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent mt-16" />
    </div>
  );
}
