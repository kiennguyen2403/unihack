import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createClient } from "@/utils/supabase/client";
import {
  BrainstormResult,
  BrainstormResultMetadata,
  Idea,
  Meeting,
} from "@/utils/types";
import { setLoading } from "./authSlice";

interface RoomState {
  roomId: string | null;
  goal: string | null;
  ideas: Idea[];
  result: BrainstormResult[] | null; // the analysis of the ideas from AI
  resultMetadata: BrainstormResultMetadata | null;
  loadingResult: boolean;
  createdRoomId: string | null;
  roomDetails: Meeting | null;
  loading: boolean;
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
        title: result.title,
        explanation: result.explanation,
      }));
      console.log("results", results);
      state.result = results;
    },
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goal }),
      });
      if (!response.ok) {
        throw new Error("Failed to create room");
      }
      const data = await response.json();
      console.debug("Created room:", data);
      dispatch(setCreatedRoomId(data.id));
      dispatch(updateGoal(goal));
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
      dispatch(setLoadingResult(true));
      const response = await fetch(`/api/v1/ideas/meetings/${roomId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      dispatch(setStoredResult(data));
    } catch (error) {
      console.error("Error fetching result:", error);
    } finally {
      dispatch(setLoadingResult(false));
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
        method: "PATCH", // Using your PATCH endpoint
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goal }), // Only sending the field to update
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update goal");
      }

      const data = await response.json();

      // Same Redux updates as before
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
      // Call your API route instead of Supabase directly
      const response = await fetch(`/api/v1/meetings/${meetingId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get meeting details");
      }

      const data = await response.json();

      // Same Redux updates as before
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

      // Call AI feedback endpoint
      const aiResponse = await fetch("/api/v1/ai/get-feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: goal,
          ideas: ideas,
        }),
      });
      if (!aiResponse.ok) {
        throw new Error(`AI feedback request failed: ${aiResponse.statusText}`);
      }

      const aiData = await aiResponse.json();

      // Ensure aiData has the expected shape
      if (!aiData.results || !aiData.metadata) {
        throw new Error("Invalid AI response format");
      }

      // Set AI results in the store
      dispatch(
        setResult({
          result: aiData.results,
          metadata: aiData.metadata,
        })
      );

      const [ideasResponse, summaryResponse] = await Promise.all([
        fetch(`/api/v1/ideas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            meetingId: roomId,
            title: goal,
            ideas: ideas,
          }),
        }),
      ]);

      // Check responses
      if (!ideasResponse.ok) {
        throw new Error(`Ideas API failed: ${ideasResponse.statusText}`);
      }
      if (!summaryResponse.ok) {
        throw new Error(`Summary API failed: ${summaryResponse.statusText}`);
      }

      // Optionally parse responses if you need the data
      const ideasData = await ideasResponse.json();
      const summaryData = await summaryResponse.json();

      return { aiData, ideasData, summaryData }; // Return data for potential use in fulfilled case
    } catch (error: any) {
      console.error("Error in endSessionAndGetResult:", error);
      return rejectWithValue(error.message);
    } finally {
      dispatch(setLoadingResult(false));
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
} = roomSlice.actions;
export default roomSlice.reducer;
