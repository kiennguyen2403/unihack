interface TypingBubbleProps {
  isTyping: boolean;
}

export const TypingBubble = ({ isTyping }: TypingBubbleProps) => {
  if (!isTyping) return null;

  return (
    <div className="flex items-center justify-center gap-1 bg-gray-100 px-4 py-4 rounded-full">
      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
    </div>
  );
};
