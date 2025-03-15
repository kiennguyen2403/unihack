import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RoomState {
  roomId: string | null;
  goal: string | null;
  ideas: string[];
}

const initialState: RoomState = {
  roomId: null,
  goal: null,
  ideas: [],
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    createRoom: (
      state,
      action: PayloadAction<{ roomId: string; goal: string }>
    ) => {
      state.roomId = action.payload.roomId;
      state.goal = action.payload.goal;
      state.ideas = [];
    },
    clearRoom: (state) => {
      state.roomId = null;
      state.goal = null;
      state.ideas = [];
    },
    updateGoal: (state, action: PayloadAction<string>) => {
      state.goal = action.payload;
    },
  },
});

export const { createRoom, clearRoom, updateGoal } = roomSlice.actions;
export default roomSlice.reducer;
