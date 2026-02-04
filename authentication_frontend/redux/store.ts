"use client";

import {
  persistStore,
  persistReducer,
} from "redux-persist";

import { combineReducers } from "@reduxjs/toolkit";

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import storage from "./persistStorage";


const rootReducer = combineReducers({
  auth: authReducer,

});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], 
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
   middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;