import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api'; // IMPORTANTE: misma instancia que usan los hooks

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    // agrega aquí otros reducers si tenés, ej:
    // auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;