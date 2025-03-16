import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import authReducer from "./slices/authSlice";
import roomReducer from "./slices/roomSlice";
import userReducer from "./slices/userSlice";
import discussionReducer from "./slices/discussionSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    room: roomReducer,
    user: userReducer,
    discussion: discussionReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom hooks for TypeScript support
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
