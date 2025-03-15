import { Brain, Diamond, Sparkles } from "lucide-react";

const PageFooter = () => {
  return (
    <footer className="w-full border-t py-16">
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <h5 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            Thubble
          </h5>
          <p className="text-muted-foreground text-sm">
            Where great ideas take flight
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 w-full max-w-3xl">
          <div className="flex flex-col items-center text-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            <p className="text-sm text-muted-foreground">
              "When minds unite, innovation ignites"
            </p>
          </div>

          <div className="flex flex-col items-center text-center gap-2">
            <Diamond className="w-6 h-6 text-primary" />
            <p className="text-sm text-muted-foreground">
              "Every idea is a diamond in the rough"
            </p>
          </div>

          <div className="flex flex-col items-center text-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <p className="text-sm text-muted-foreground">
              "Fear not judgment, embrace creativity"
            </p>
          </div>
        </div>

        <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Thubble. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;
