import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const url = import.meta.env.VITE_API_URL;

// Create a region
export const createRegion = createAsyncThunk(
  "region/createRegion",
  async (data, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.userSlice.user.token;
      const response = await axios.post(`${url}/region/region`, data, {
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

// Fetch all regions
export const fetchRegions = createAsyncThunk(
  "region/fetchRegions",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.userSlice.user.token;
      const response = await axios.get(`${url}/region/regions`, {
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

// Update a region
export const updateRegion = createAsyncThunk(
  "region/updateRegion",
  async ({ id, data }, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.userSlice.user.token;
      const response = await axios.put(`${url}/region/${id}`, data, {
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

// Delete a region
export const deleteRegion = createAsyncThunk(
  "region/deleteRegion",
  async (id, { getState, rejectWithValue }) => {
    try {
      const state = getState();
      const token = state.userSlice.user.token;
      const response = await axios.delete(`${url}/region/${id}`, {
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

// Slice
const regionSlice = createSlice({
  name: "region",
  initialState: {
    regions: [],
    isLoading: false,
    error: null,
    success: false,
    createSuccess: false,
    updateSuccess: false,
    deleteSuccess: false,
    createError: false,
    updateError: false,
    deleteError: false,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
  },
  reducers: {
    resetRegionState: (state) => {
      state.error = null;
      state.isLoading = false;
      state.success = false;
    },
    resetRegionCreateState: (state) => {
      state.createError = false;
      state.createLoading = false;
      state.createSuccess = false;
    },
    resetRegionUpdateState: (state) => {
      state.updateError = false;
      state.updateLoading = false;
      state.updateSuccess = false;
    },
    resetRegionDeleteState: (state) => {
      state.deleteError = false;
      state.deleteLoading = false;
      state.deleteSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Region
      .addCase(createRegion.pending, (state) => {
        state.createLoading = true;
        state.createSuccess = false;
        state.createError = null;
      })
      .addCase(createRegion.fulfilled, (state) => {
        state.createLoading = false;
        state.createSuccess = true;
      })
      .addCase(createRegion.rejected, (state, action) => {
        state.createLoading = false;
        state.createSuccess = false;
        state.createError = action.payload || "Failed to create region";
      })
      // Fetch Regions
      .addCase(fetchRegions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(fetchRegions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.success = true;
        state.regions = action.payload;
      })
      .addCase(fetchRegions.rejected, (state, action) => {
        state.isLoading = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch regions";
      })
      // Update Region
      .addCase(updateRegion.pending, (state) => {
        state.updateLoading = true;
        state.updateSuccess = false;
        state.updateError = null;
      })
      .addCase(updateRegion.fulfilled, (state) => {
        state.updateLoading = false;
        state.updateSuccess = true;
      })
      .addCase(updateRegion.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload || "Failed to update region";
        state.updateSuccess = false;
      })
      // Delete Region
      .addCase(deleteRegion.pending, (state) => {
        state.deleteLoading = true;
        state.deleteSuccess = false;
        state.deleteError = null;
      })
      .addCase(deleteRegion.fulfilled, (state) => {
        state.deleteLoading = false;
        state.deleteSuccess = true;
      })
      .addCase(deleteRegion.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = false;
        state.deleteError = action.payload || "Failed to delete region";
      });
  },
});

export const {
  resetRegionState,
  resetRegionCreateState,
  resetRegionDeleteState,
  resetRegionUpdateState,
} = regionSlice.actions;
export default regionSlice.reducer;
