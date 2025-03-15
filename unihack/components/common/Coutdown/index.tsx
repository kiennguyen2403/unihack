import { useEffect, useState, useRef } from "react";

const Countdown = ({ onEnd }: { onEnd: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(30 * 1000); // 30 seconds in milliseconds
  const timerRef = useRef<NodeJS.Timeout | null>(null); // Store interval reference

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 10) {
          clearInterval(timerRef.current!);
          onEnd();
          return 0;
        }
        return prevTime - 10;
      });
    }, 10);

    return () => clearInterval(timerRef.current!); // Cleanup
  }, [onEnd]);

  const minutes = Math.floor(timeLeft / (60 * 1000));
  const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
  const milliseconds = Math.floor((timeLeft % 1000) / 10);

  return (
    <div
      className={`text-4xl font-bold transition-colors duration-300 p-2 ${
        timeLeft <= 10 * 1000
          ? "text-red-500"
          : timeLeft <= 20 * 1000
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
