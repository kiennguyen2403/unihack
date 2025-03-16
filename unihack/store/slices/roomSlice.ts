import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  BrainstormResult,
  BrainstormResultMetadata,
  Idea,
  Meeting,
} from "@/utils/types";
import { setLoading } from "./authSlice";
import { createClient } from "@/utils/supabase/client";

interface RoomState {
  roomId: string | null;
  goal: string | null;
  ideas: Idea[];
  result: BrainstormResult[] | null;
  resultMetadata: BrainstormResultMetadata | null;
  loadingResult: boolean;
  createdRoomId: string | null;
  roomDetails: Meeting | null;
  loading: boolean;
  pastRooms: Meeting[];
}

const initialState: RoomState = {
  roomId: null,
  goal: null,
  ideas: [],
  result: null,
  resultMetadata: null,
  loadingResult: false,
  createdRoomId: null,
  roomDetails: null,
  loading: false,
  pastRooms: [],
};

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    clearRoom: (state) => {
      state.roomId = null;
      state.goal = null;
      state.ideas = [];
    },
    setCreatedRoomId: (state, action: PayloadAction<string | null>) => {
      state.createdRoomId = action.payload;
    },
    updateGoal: (state, action: PayloadAction<string>) => {
      state.goal = action.payload;
    },
    setLoadingResult: (state, action: PayloadAction<boolean>) => {
      state.loadingResult = action.payload;
    },
    setIdeas: (state, action: PayloadAction<Idea[]>) => {
      state.ideas = action.payload;
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
    setRoomDetails: (state, action: PayloadAction<Meeting>) => {
      state.roomDetails = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setStoredResult: (state, action: PayloadAction<BrainstormResult[]>) => {
      const results = action.payload.map((result) => ({
        id: result.id,
        title: result.title,
        explanation: result.explanation,
        votes: result.votes,
      }));
      state.result = results;
    },
    setPastRooms: (state, action: PayloadAction<Meeting[]>) => {
      state.pastRooms = action.payload;
    },
    updateResultVote: (
      state,
      action: PayloadAction<{ id: number; votes: number }>
    ) => {
      if (state.result) {
        state.result = state.result.map((item) =>
          item.id === action.payload.id
            ? { ...item, votes: action.payload.votes }
            : item
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateVotes.fulfilled, (state, action) => {
      // Update the result array with the new vote data
      const updatedIdea = action.payload;
      if (state.result) {
        state.result = state.result.map((item) =>
          item.title === updatedIdea.title
            ? { ...item, votes: updatedIdea.votes }
            : item
        );
      }
    });
  },
});

export const createRoom = createAsyncThunk(
  "room/createRoom",
  async (goal: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setCreatedRoomId(null));
      const response = await fetch("/api/v1/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });
      if (!response.ok) throw new Error("Failed to create room");
      const data = await response.json();
      dispatch(setCreatedRoomId(data.id));
      dispatch(updateGoal(goal));
      return data;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const fetchResult = createAsyncThunk(
  "room/fetchResult",
  async (roomId: string, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`/api/v1/ideas/meetings/${roomId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      dispatch(setStoredResult(data));
      return data;
    } catch (error) {
      console.error("Error fetching result:", error);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const patchGoal = createAsyncThunk(
  "room/patchGoal",
  async (
    { goal, meetingId }: { goal: string; meetingId: number },
    { dispatch }
  ) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`/api/v1/meetings/${meetingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update goal");
      }
      const data = await response.json();
      dispatch(updateGoal(goal));
      dispatch(setRoomDetails(data));
      return data;
    } catch (error) {
      console.error("Error updating goal:", error);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const getRoomDetails = createAsyncThunk(
  "room/getRoomDetails",
  async (meetingId: number, { dispatch }) => {
    try {
      const response = await fetch(`/api/v1/meetings/${meetingId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get meeting details");
      }
      const data = await response.json();
      dispatch(setRoomDetails(data));
      return data;
    } catch (error) {
      console.error("Error getting room details:", error);
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const endSessionAndGetResult = createAsyncThunk(
  "room/endSessionAndAnalyze",
  async (
    { roomId, ideas, goal }: { roomId: number; ideas: string[]; goal: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setLoadingResult(true));
      const aiResponse = await fetch("/api/v1/ai/get-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: goal, ideas }),
      });
      if (!aiResponse.ok)
        throw new Error(`AI feedback request failed: ${aiResponse.statusText}`);
      const aiData = await aiResponse.json();
      if (!aiData.results || !aiData.metadata)
        throw new Error("Invalid AI response format");

      dispatch(
        setResult({ result: aiData.results, metadata: aiData.metadata })
      );

      const [ideasResponse, summaryResponse] = await Promise.all([
        fetch(`/api/v1/ideas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ideas: aiData.results.map((result: any) => ({
              meeting_id: roomId,
              title: result.title,
              explanation: result.explanation,
            })),
          }),
        }),
        fetch(`/api/v1/summarize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ meetingId: roomId, title: goal, ideas }),
        }),
      ]);

      if (!ideasResponse.ok)
        throw new Error(`Ideas API failed: ${ideasResponse.statusText}`);
      if (!summaryResponse.ok)
        throw new Error(`Summary API failed: ${summaryResponse.statusText}`);

      const ideasData = await ideasResponse.json();
      const summaryData = await summaryResponse.json();

      return { aiData, ideasData, summaryData };
    } catch (error: any) {
      console.error("Error in endSessionAndGetResult:", error);
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoadingResult(false));
    }
  }
);

export const fetchPastRooms = createAsyncThunk(
  "room/fetchPastRooms",
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));
      const response = await fetch(`/api/v1/meetings`);
      const data = await response.json();
      dispatch(setPastRooms(data));
    } catch (error) {
      console.error("Error fetching past rooms:", error);
    } finally {
      dispatch(setLoading(false));
    }
  }
);

export const updateVotes = createAsyncThunk(
  "room/updateVotes",
  async (
    { title, votes, id }: { title: string; votes: number; id: string },
    {}
  ) => {
    try {
      const client = createClient();
      const { data, error } = await client
        .from("ideas")
        .update({ votes })
        .eq("title", title)
        .eq("meeting_id", id)
        .select()
        .single();

      if (error) throw error;
      return data; // Return the updated idea to update the store
    } catch (error) {
      console.error("Error updating votes:", error);
      throw error;
    }
  }
);

export const {
  clearRoom,
  updateGoal,
  setLoadingResult,
  setResult,
  setCreatedRoomId,
  setRoomDetails,
  setStoredResult,
  updateResultVote,
  setPastRooms,
} = roomSlice.actions;

export default roomSlice.reducer;
