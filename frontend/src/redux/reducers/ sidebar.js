import { createSlice } from "@reduxjs/toolkit";

const sidebarSlice = createSlice({
  name: "sidebar",
  initialState: {
    showSideBar: false,
  },
  reducers: {
    toggleSidebar: (state) => {
      state.showSideBar = !state.showSideBar;
    },
    setSidebar: (state, action) => {
      state.showSideBar = action.payload;
    },
  },
});

export const { toggleSidebar, setSidebar } = sidebarSlice.actions;
export default sidebarSlice.reducer;
