import { useEffect, useState } from "react";

const Countdown = ({ onEnd }: { onEnd: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(3 * 60 * 1000); // 3 minutes in milliseconds
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    // Add beforeunload event listener for refresh
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ""; // Required for Chrome
      return "Are you sure you want to leave? The timer will be reset.";
    };

    // Add popstate event listener for back button
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      const confirmLeave = window.confirm(
        "Are you sure you want to leave? The timer will be reset."
      );
      if (!confirmLeave) {
        window.history.pushState(null, "", window.location.pathname);
      }
    };

    // Push initial state to enable back button detection
    window.history.pushState(null, "", window.location.pathname);

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    if (timeLeft <= 0) {
      setIsEnded(true);
      onEnd();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 10); // Decrease by 10ms
    }, 10);

    return () => {
      clearInterval(timer);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [timeLeft, onEnd]);

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
