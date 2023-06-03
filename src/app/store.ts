import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit";
import outletReducer from "../modules/outlets/outletsSlice";

export const store = configureStore({
  reducer: {
    outlet: outletReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
