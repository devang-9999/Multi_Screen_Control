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
  otpRequired?: boolean;
  otpUserId?: number;

}

const initialState: AuthState = {
  loading: false,
  success: false,
  error: null,
  user: null,
  otpRequired: false,
  otpUserId: undefined,
};

export const registerUserThunk = createAsyncThunk(
  "auth/register",
  async (
    data: { username: string; useremail: string; userPassword: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await api.post("/auth/signup", data);
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
      .addCase(loginUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user=action.payload

        if (action.payload?.otpRequired) {
          state.otpRequired = true;
          state.otpUserId = action.payload.userId;
          state.success = false;
        } else {
          localStorage.setItem("token", action.payload.token);
          localStorage.setItem("sessionId", action.payload.sessionId);
          state.success = true;
          state.otpRequired = false;
        }
      })
      .addCase(loginUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
        state.success = false;
      });
  },
});

export const { resetAuthState } = authSlice.actions;
export default authSlice.reducer;
