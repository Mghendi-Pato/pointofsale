import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
const url = import.meta.env.VITE_API_URL;

// Fetch admins with Authorization Header
const fetchAdmin = createAsyncThunk(
  "admin/fetchAdmins",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.userSlice.user.token;

      const response = await axios.get(`${url}/admin/`, {
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

const adminSlice = createSlice({
  name: "admin",
  initialState: {
    admins: [], // Fixed typo
    error: null,
    loading: false,
    success: false,
  },
  reducers: {
    initializeAdminState: (state) => {
      state.error = null;
      state.loading = false;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch admins
      .addCase(fetchAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = action.payload; // Fixed key
        state.success = true;
      })
      .addCase(fetchAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch admins"; // Improved error message
        state.admins = [];
      });
  },
});

export const { initializeAdminState } = adminSlice.actions;
export { fetchAdmin };
export default adminSlice.reducer;
