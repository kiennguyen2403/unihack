import { useEffect, useState, useRef } from "react";

const Countdown = ({ onEnd }: { onEnd: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(120 * 1000); // 2 minutes in milliseconds
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Store interval reference
  const hasEndedRef = useRef(false);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = Math.max(0, prevTime - 10); // Prevent negative values
        if (newTime <= 0 && !hasEndedRef.current) {
          clearInterval(timerRef.current!);
          hasEndedRef.current = true;
          // Schedule onEnd callback for next tick to avoid state updates during render
          setTimeout(onEnd, 0);
          return 0;
        }
        return newTime;
      });
    }, 10);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [onEnd]);

  const minutes = Math.floor(timeLeft / (60 * 1000));
  const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
  const milliseconds = Math.floor((timeLeft % 1000) / 10);

  return (
    <div
      className={`text-4xl font-bold transition-colors duration-300 p-2 ${
        timeLeft <= 60 * 1000 // 2 MINUTES
          ? "text-red-500"
          : timeLeft <= 90 * 1000
            ? "text-orange-500"
            : "text-foreground"
      }`}
    >
      <span className="tabular-nums">
        {minutes.toString().padStart(2, "0")}:
        {seconds.toString().padStart(2, "0")}.
        {milliseconds.toString().padStart(2, "0")}
      </span>
    </div>
  );
};

export default Countdown;
