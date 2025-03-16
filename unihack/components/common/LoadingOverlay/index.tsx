import { Stars } from "lucide-react";
import { useEffect, useState } from "react";

interface LoadingOverlayProps {
  message?: string;
  onComplete?: () => void;
  seconds?: number;
}

const LoadingOverlay = ({
  message = "Analyzing and cooking your brainstorms bubbles...",
  onComplete,
  seconds = 8,
}: LoadingOverlayProps) => {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) {
        onComplete();
      }
    }, seconds * 1000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 100 / seconds, 100));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center w-screen h-screen">
      <div className="bg-card p-12 rounded-xl shadow-2xl flex flex-col items-center gap-8 w-[90%] max-w-lg">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-300 via-pink-200 to-blue-300 animate-[spin_3s_linear_infinite]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Stars className="text-white" />
          </div>
        </div>
        <p className="text-2xl font-medium bg-gradient-to-r from-purple-300 via-pink-200 to-blue-300 bg-clip-text text-transparent animate-pulse text-center">
          {message}
        </p>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-300 via-pink-200 to-blue-300 transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
