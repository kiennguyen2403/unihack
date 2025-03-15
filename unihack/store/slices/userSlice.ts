// won't be used for  when auth is ready!

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { THUBBLE_ROLE_KEY, THUBBLE_ROOM_ID_KEY } from "../../utils/constant";

interface UserState {
  name: string | null;
  role: "member" | "host" | null;
  roomId: string | null;
}

const initialState: UserState = {
  name: null,
  role: null,
  roomId: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    clearName: (state) => {
      state.name = null;
    },
    setRole: (state, action: PayloadAction<"member" | "host">) => {
      state.role = action.payload;
    },
    clearRole: (state) => {
      state.role = null;
    },
    setRoomId: (state, action: PayloadAction<string>) => {
      state.roomId = action.payload;
    },
    clearRoomId: (state) => {
      state.roomId = null;
    },
    createRoom: (state, action: PayloadAction<string>) => {
      state.role = "host";
      state.roomId = action.payload;
      localStorage.setItem(THUBBLE_ROLE_KEY, "host");
      localStorage.setItem(THUBBLE_ROOM_ID_KEY, action.payload);
    },
    joinRoom: (state, action: PayloadAction<string>) => {
      state.role = "member";
      state.roomId = action.payload;
      localStorage.setItem(THUBBLE_ROLE_KEY, "member");
      localStorage.setItem(THUBBLE_ROOM_ID_KEY, action.payload);
    },
  },
});

export const {
  setName,
  clearName,
  setRole,
  clearRole,
  setRoomId,
  clearRoomId,
  createRoom,
  joinRoom,
} = userSlice.actions;
export default userSlice.reducer;
