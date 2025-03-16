import { BrainstormResult, BrainstormResultMetadata } from "./types";

export const THUBBLE_ROLE_KEY = "thubble_role";
export const THUBBLE_ROOM_ID_KEY = "thubble_room_id";

export const JSONToPagragraph = (json: any) => {
  return json.map((item: any) => item.text).join("\n");
};
