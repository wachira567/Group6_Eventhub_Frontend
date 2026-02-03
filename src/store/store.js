import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import eventsReducer from "./slices/eventsSlice";
import ticketsReducer from "./slices/ticketsSlice";
import uiReducer from "./slices/uiSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    tickets: ticketsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["auth/loginSuccess", "auth/logout"],
      },
    }),
});

export { store };
export default store;