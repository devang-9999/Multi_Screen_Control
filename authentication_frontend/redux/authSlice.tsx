/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import api from "@/app/lib/axios";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

interface LoginPayload {
  email: string;
  password: string;
}

interface User {
  userid: number;
  email: string;
}

interface AuthState {
  loading: boolean;
  success: boolean;
  error: string | null;
  user: User | null;
}

const initialState: AuthState = {
  loading: false,
  success: false,
  error: null,
  user: null,
};

export const registerUserThunk = createAsyncThunk(
  "auth/register",
  async (
    data: { username: string; useremail: string; userPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post("/auth/register", data);
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data?.message);
      }
      return rejectWithValue("Registration failed");
    }
  }
);


export const loginUserThunk = createAsyncThunk(
  "auth/login",
  async (data: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", data);
      return res.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        return rejectWithValue(error.response?.data?.message);
      }
      return rejectWithValue("Login failed");
    }
  }
);

export const fetchMeThunk = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/auth/me");
      return res.data;
    } catch(error:any) {
      if( error.response.status === 401){
        return rejectWithValue("Session is expired login in again");
      }
      return rejectWithValue("Not authenticated");
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await api.post("/auth/logout");
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(registerUserThunk.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(registerUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as string;
      })
      .addCase(loginUserThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUserThunk.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMeThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchMeThunk.rejected, (state,action) => {
        if(action.payload === "Session is expired login in again")
     {
         state.user = null;
     }
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.success = false;
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;
