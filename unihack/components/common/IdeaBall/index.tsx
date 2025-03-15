import { useUser } from "@clerk/nextjs";

interface IdeaBallProps {
  idea: string;
  userId: string;
  color?: string;
}

const IdeaBall = ({ idea, userId, color }: IdeaBallProps) => {
  const { user } = useUser();
  const currentUserId = user?.id;

  return (
    <div
      className="w-[200px] h-[200px] rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-shadow p-4 relative overflow-hidden"
      style={{
        backgroundColor: color, // Now uses the pre-assigned color
      }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rounded-[100%] w-full h-full"
        style={{
          transform: `rotate(${Math.floor(Math.random() * 360)}deg)`,
        }}
      />
      <span className="relative z-10 text-center w-full truncate text-black">
        {userId === currentUserId ? idea : "A brilliant idea!"}
      </span>
    </div>
  );
};

export default IdeaBall;

export const IDEA_BALL_COLORS = [
  "#FF1493", // Deep pink
  "#00FF00", // Lime green
  "#00BFFF", // Deep sky blue
  "#FF4500", // Orange red
  "#FF00FF", // Magenta
  "#32CD32", // Lime green
];
