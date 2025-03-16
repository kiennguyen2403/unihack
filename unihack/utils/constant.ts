import { BrainstormResult, BrainstormResultMetadata } from "./types";

export const THUBBLE_ROLE_KEY = "thubble_role";
export const THUBBLE_ROOM_ID_KEY = "thubble_room_id";

export const DUMMY_RESULT: BrainstormResult[] = [
  {
    title: "Dummy Result 1",
    explanation: "Dummy explanation 1",
  },
  {
    title: "Dummy Result 1",
    explanation: "Dummy explanation 1",
  },
  {
    title: "Dummy Result 1",
    explanation: "Dummy explanation 1",
  },
  {
    title: "Dummy Result 1",
    explanation: "Dummy explanation 1",
  },
  {
    title: "Dummy Result 1",
    explanation: "Dummy explanation 1",
  },
  {
    title: "Dummy Result 1",
    explanation: "Dummy explanation 1",
  },
];

export const DUMMY_RESULT_METADATA: BrainstormResultMetadata = {
  additionalInfo: "Dummy explanation for the result",
};

export const JSONToPagragraph = (json: any) => {
  return json.map((item: any) => item.text).join("\n");
};
