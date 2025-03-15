// won't be used for  when auth is ready!

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  name: string | null;
}

const initialState: UserState = {
  name: null,
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
  },
});

export const { setName, clearName } = userSlice.actions;
export default userSlice.reducer;
