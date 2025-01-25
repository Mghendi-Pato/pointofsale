import { combineReducers } from "redux";
import userSlice from "./user";
import adminSlice from "./admin";
import sidebarSlice from "./ sidebar";
import regionSlice from "./region";

const rootReducer = combineReducers({
  userSlice: userSlice,
  adminSlice: adminSlice,
  sidebar: sidebarSlice,
  regionSlice: regionSlice,
});

export default rootReducer;
