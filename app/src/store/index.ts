// app/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { api } from '../services/api';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [api.reducerPath]: api.reducer
  },
  middleware: (gDM) => gDM().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;