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

export const toggleUserStatus = createAsyncThunk(
  "auth/toggleUserStatus",
  async (userId, { getState, rejectWithValue }) => {
    try {
      // Retrieve the token from the state
      const state = getState();
      const token = state.userSlice.user.token;
      // Make the request to toggle the user's status
      const response = await axios.put(
        `${url}/auth/${userId}/toggle-status`,
        {}, // Empty body
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Return the updated user data
      return response.data;
    } catch (error) {
      // Handle errors and return a rejected value
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async (userId, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.userSlice.user.token;
      const response = await axios.delete(`${url}/auth/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      // Handle errors and return a rejected value
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
    userStatusUpdateError: null,
    userStatusUpdateLoading: false,
    userStatusUpdateSuccess: false,
    userDeleteSuccess: false,
    userDeleteError: null,
    userDeleteLoading: false,
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
    initializeUserStatusUpdateState: (state) => {
      state.userStatusUpdateError = null;
      state.userStatusUpdateLoading = false;
      state.userStatusUpdateSuccess = false;
    },
    initializeUserDeleteState: (state) => {
      state.userDeleteError = null;
      state.userDeleteSuccess = false;
      state.userDeleteLoading = false;
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
    // Toggle user status
    builder
      .addCase(toggleUserStatus.pending, (state) => {
        state.userStatusUpdateLoading = true;
        state.userStatusUpdateError = null;
        state.userStatusUpdateSuccess = false;
      })
      .addCase(toggleUserStatus.fulfilled, (state) => {
        state.userStatusUpdateLoading = false;
        state.userStatusUpdateSuccess = true;
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.userStatusUpdateLoading = false;
        state.userStatusUpdateError = action.payload || "Status update failed";
      });
    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.userDeleteLoading = true;
        state.userDeleteError = null;
        state.userDeleteSuccess = false;
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.userDeleteLoading = false;
        state.userDeleteSuccess = true;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.userDeleteLoading = false;
        state.userDeleteError = action.payload || "User deletion failed";
      });
  },
});

export const {
  logoutUser,
  initializeRegisterUserState,
  initializeUserStatusUpdateState,
  initializeUserDeleteState,
} = authSlice.actions;
export default authSlice.reducer;
