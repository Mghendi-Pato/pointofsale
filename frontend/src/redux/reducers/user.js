import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const url = import.meta.env.VITE_API_URL;

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${url}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      console.error(error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.userSlice.user.token;
      const response = await axios.post(`${url}/auth/register`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    isLoading: false,
    user: null,
    error: null,
    registerUserError: null,
    registerUserLoading: false,
    registerUserSuccess: false,
  },
  reducers: {
    logoutUser: (state) => {
      state.user = null;
      state.error = null;
    },
    initializeRegisterUserState: (state) => {
      state.registerUserError = null;
      state.registerUserLoading = false;
      state.registerUserSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Login failed";
      });
    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.registerUserLoading = true;
        state.registerUserError = null;
        state.registerUserSuccess = false;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.registerUserLoading = false;
        state.registerUserSuccess = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerUserLoading = false;
        state.registerUserError = action.payload || "Registration failed";
      });
  },
});

export const { logoutUser, initializeRegisterUserState } = authSlice.actions;
export default authSlice.reducer;
