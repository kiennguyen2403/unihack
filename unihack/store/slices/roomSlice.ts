import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

interface RoomState {
  roomId: string | null;
  goal: string | null;
  ideas: string[];
  result: BrainstormResult[] | null; // the analysis of the ideas from AI
  resultMetadata: BrainstormResultMetadata | null;
  loadingResult: boolean;
}

const initialState: RoomState = {
  roomId: null,
  goal: null,
  ideas: [],
  result: null,
  resultMetadata: null,
  loadingResult: false,
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
    setLoadingResult: (state, action: PayloadAction<boolean>) => {
      state.loadingResult = action.payload;
    },
    setResult: (
      state,
      action: PayloadAction<{
        result: BrainstormResult[];
        metadata: BrainstormResultMetadata;
      }>
    ) => {
      state.result = action.payload.result;
      state.resultMetadata = action.payload.metadata;
    },
  },
});

export const fetchResult = createAsyncThunk(
  "room/fetchResult",
  async (roomId: string, { dispatch }) => {
    try {
      dispatch(setLoadingResult(true));
      const response = await fetch(`/api/room/${roomId}/result`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      dispatch(setResult(data.result));
    } catch (error) {
      console.error("Error fetching result:", error);
    } finally {
      dispatch(setLoadingResult(false));
    }
  }
);

export const {
  createRoom,
  clearRoom,
  updateGoal,
  setLoadingResult,
  setResult,
} = roomSlice.actions;
export default roomSlice.reducer;
