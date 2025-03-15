"use client";

import { useParams } from "next/navigation";

const ChatPage = () => {
  const { meetingId } = useParams();

  return <div>ChatPage</div>;
};

export default ChatPage;
