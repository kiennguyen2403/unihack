import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createClient } from "@/utils/supabase/client";
import {
  BrainstormResult,
  BrainstormResultMetadata,
  Idea,
  Meeting,
} from "@/utils/types";

interface RoomState {
  roomId: string | null;
  goal: string | null;
  ideas: Idea[];
  result: BrainstormResult[] | null; // the analysis of the ideas from AI
  resultMetadata: BrainstormResultMetadata | null;
  loadingResult: boolean;
  createdRoomId: string | null;
  roomDetails: Meeting | null;
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
  },
});

export const createRoom = createAsyncThunk(
  "room/createRoom",
  async (goal: string, { dispatch }) => {
    const supabase = createClient();
    try {
      dispatch(setCreatedRoomId(null));
      const { data, error } = await supabase
        .from("meetings")
        .insert([
          {
            goal: goal,
          },
        ])
        .select();

      if (error) throw error;

      dispatch(setCreatedRoomId(data[0].id));
      dispatch(updateGoal(goal));
      return data[0].id;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  }
);

export const endRoomSession = createAsyncThunk(
  "room/endRoomSession",
  async (roomId: string, { dispatch }) => {
    const supabase = createClient();
  }
);

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

export const patchGoal = createAsyncThunk(
  "room/patchGoal",
  async (
    { goal, meetingId }: { goal: string; meetingId: number },
    { dispatch }
  ) => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("meetings")
        .update({ goal })
        .eq("id", meetingId)
        .select(); // Add .select() to return the updated data
      if (error) throw error;

      dispatch(updateGoal(goal));
      dispatch(setRoomDetails(data[0]));
      return data;
    } catch (error) {
      console.error("Error updating goal:", error);
      throw error;
    }
  }
);

export const getRoomDetails = createAsyncThunk(
  "room/getRoomDetails",
  async (meetingId: number, { dispatch }) => {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .eq("id", meetingId)
        .single();

      if (error) throw error;
      if (!data) throw new Error("Meeting not found");
      dispatch(setRoomDetails(data));
      return data;
    } catch (error) {
      console.error("Error getting room details:", error);
      throw error;
    }
  }
);

export const endSessionAndGetResult = createAsyncThunk(
  "room/endSessionAndAnalyze",
  async (
    { roomId, ideas, goal }: { roomId: number; ideas: string[]; goal: string },
    { dispatch }
  ) => {
    try {
      dispatch(setLoadingResult(true));
      // First, call the AI feedback endpoint
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
        throw new Error("Failed to get AI feedback");
      }

      const aiData = await aiResponse.json();

      console.log("aiData", aiData);

      // Set the results in the store
      dispatch(
        setResult({
          result: aiData.results,
          metadata: aiData.metadata,
        })
      );

      const supabase = createClient();

      // Insert all results as separate rows
      const { data, error } = await supabase.from("ideas").insert(
        aiData.results.map((result: BrainstormResult) => ({
          meeting_id: roomId,
          title: result.title,
          explanation: result.explanation,
        }))
      );

      if (error) throw error;

      return aiData;
    } catch (error) {
      console.error("Error in endSessionAndGetResult:", error);
      throw error;
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
} = roomSlice.actions;
export default roomSlice.reducer;
