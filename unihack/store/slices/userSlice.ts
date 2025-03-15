// won't be used for  when auth is ready!

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { THUBBLE_ROLE_KEY, THUBBLE_ROOM_ID_KEY } from "../../utils/constant";
import { createClient } from "@/utils/supabase/client";

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
    updateHostData: (state, action: PayloadAction<string>) => {
      state.role = "host";
      state.roomId = action.payload;
      localStorage.setItem(THUBBLE_ROLE_KEY, "host");
      localStorage.setItem(THUBBLE_ROOM_ID_KEY, action.payload);
    },
    updateMemberData: (state, action: PayloadAction<string>) => {
      state.role = "member";
      state.roomId = action.payload;
      localStorage.setItem(THUBBLE_ROLE_KEY, "member");
      localStorage.setItem(THUBBLE_ROOM_ID_KEY, action.payload);
    },
    getDataFromLocalStorage: (state) => {
      const role = localStorage.getItem(THUBBLE_ROLE_KEY);
      const roomId = localStorage.getItem(THUBBLE_ROOM_ID_KEY);
      if (role && roomId) {
        state.role = role as "member" | "host";
        state.roomId = roomId;
      }
    },
  },
});


export const joinRoom = createAsyncThunk(
  "room/joinRoom",
  async ({ meeting_id, user_id }: { meeting_id: string; user_id: string }, { dispatch }) => {
    const supabase = createClient();
    try {

      const { error: EventError } = await supabase
        .from("events")
        .insert({
          user_id: user_id,
          meeting_id: meeting_id,
          role: "ATTEND",
          status: "JOIN"
        })

      dispatch(updateMemberData(meeting_id));

      if (EventError) throw EventError;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  }
);

export const {
  setName,
  clearName,
  setRole,
  clearRole,
  setRoomId,
  clearRoomId,
  updateHostData,
  updateMemberData,
  getDataFromLocalStorage,
} = userSlice.actions;
export default userSlice.reducer;
