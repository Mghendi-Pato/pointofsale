import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducers";
import { persistReducer, persistStore } from "redux-persist";
import storageSession from "redux-persist/lib/storage/session";
import { thunk } from "redux-thunk";

const persistConfig = {
  key: "root",
  storage: storageSession,
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  devTools: process.env.NODE_ENV !== "production",
  middleware: () => [thunk],
});

export const persistor = persistStore(store);
