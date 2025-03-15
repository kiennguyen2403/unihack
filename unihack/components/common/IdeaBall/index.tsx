import { useUser } from "@clerk/nextjs";

interface IdeaBallProps {
  idea: string;
  userId: string;
  color?: string;
}

const IdeaBall = ({ idea, userId, color }: IdeaBallProps) => {
  const { user } = useUser();
  const currentUserId = user?.id;

  // TODO: get the currentuser id from clerk
  // compare with the user id of the idea if it is the same user, then show the idea
  // if it is not the same user, then show a "A brilliant idea!"

  return (
    <div
      className="w-fit min-w-[60px] max-w-[120px] rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:shadow-md transition-shadow p-4 relative overflow-hidden"
      style={{
        position: "relative",
        backgroundColor:
          color ||
          IDEA_BALL_COLORS[Math.floor(Math.random() * IDEA_BALL_COLORS.length)],
        width: "fit-content",
        height: "fit-content",
        aspectRatio: "1/1",
      }}
    >
      <div
        className="absolute inset-0 bg-gradient-to-br from-white/25 to-transparent rounded-[100%] w-full h-full"
        style={{
          transform: `rotate(${Math.floor(Math.random() * 360)}deg)`,
        }}
      />
      <span className="relative z-10 truncate">
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
