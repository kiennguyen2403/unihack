import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface DiscussionState {
  loading: boolean;
  elaborateLoading: boolean;
  error: string | null;
  elaboration: string | null;
  chatResponse: string | null;
  context: string | null;
  contextHistory: string[];
}

const initialState: DiscussionState = {
  loading: false,
  elaborateLoading: false,
  error: null,
  elaboration: null,
  chatResponse: null,
  context: null,
  contextHistory: [],
};

export const elaborateIdea = createAsyncThunk(
  "discussion/elaborateIdea",
  async ({ topic, idea }: { topic: string; idea: string }) => {
    try {
      const response = await fetch("/api/v1/ai/elaborate-idea", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, idea }),
      });

      if (!response.ok) {
        throw new Error(`API failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      throw new Error(error.message || "Failed to elaborate idea");
    }
  }
);

export const getAIChat = createAsyncThunk(
  "discussion/getAIChat",
  async ({ context, ask }: { context: string; ask: string }, { dispatch }) => {
    try {
      const response = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ context, ask }),
      });

      if (!response.ok) {
        throw new Error(`API failed: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.answer) {
        dispatch(addContext({ text: data.answer }));
        dispatch(addContextHistory({ text: data.answer }));
      }
      return data;
    } catch (error: any) {
      throw new Error(error.message || "Failed to get chat response");
    }
  }
);

// Action types
interface AddContextPayload {
  text: string;
}

interface AddContextHistoryPayload {
  text: string;
}

const discussionSlice = createSlice({
  name: "discussion",
  initialState,
  reducers: {
    clearDiscussion: (state) => {
      state.elaboration = null;
      state.chatResponse = null;
      state.error = null;
    },
    addContext: (state, action: { payload: AddContextPayload }) => {
      const { text } = action.payload;
      const newContext = `${state.context ? state.context + "\n" : ""}${text}`;
      state.context = newContext;
    },
    addContextHistory: (
      state,
      action: { payload: AddContextHistoryPayload }
    ) => {
      const { text } = action.payload;
      state.contextHistory.push(text);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(elaborateIdea.pending, (state) => {
        state.elaborateLoading = true;
        state.error = null;
      })
      .addCase(elaborateIdea.fulfilled, (state, action) => {
        state.elaborateLoading = false;
        if (action.payload && action.payload.feedback) {
          state.elaboration = action.payload.feedback;
        } else {
          state.error = "Unexpected AI response format";
        }
      })
      .addCase(elaborateIdea.rejected, (state, action) => {
        state.elaborateLoading = false;
        state.error = action.error.message || "Failed to elaborate idea";
      })
      .addCase(getAIChat.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAIChat.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload && action.payload.answer) {
          state.chatResponse = action.payload.answer;
        } else {
          state.error = "Unexpected AI response format";
        }
      })
      .addCase(getAIChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to get chat response";
      });
  },
});

export const { clearDiscussion, addContext, addContextHistory } =
  discussionSlice.actions;
export default discussionSlice.reducer;
