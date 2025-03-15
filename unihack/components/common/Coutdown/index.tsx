import { useEffect, useState } from "react";

const Countdown = ({ onEnd }: { onEnd: () => void }) => {
  const [endTime, setEndTime] = useState(Date.now() + 30 * 1000); // Set end time 3 minutes from now

  useEffect(() => {
    const timer = setInterval(() => {
      const timeLeft = endTime - Date.now();
      if (timeLeft <= 0) {
        clearInterval(timer);
        onEnd();
      }
    }, 10);

    return () => {
      clearInterval(timer);
    };
  }, [endTime, onEnd]);

  const timeLeft = Math.max(0, endTime - Date.now());
  const minutes = Math.floor(timeLeft / (60 * 1000));
  const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000);
  const milliseconds = Math.floor((timeLeft % 1000) / 10);

  return (
    <div
      className={`text-4xl font-bold transition-colors duration-300 p-2 ${
        minutes <= 1
          ? "text-red-500"
          : minutes <= 2
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
