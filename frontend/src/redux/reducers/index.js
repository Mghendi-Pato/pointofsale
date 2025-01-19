import { combineReducers } from "redux";
import userSlice from "./user";
import adminSlice from "./admin";
import sidebarSlice from "./ sidebar";

const rootReducer = combineReducers({
  userSlice: userSlice,
  adminSlice: adminSlice,
  sidebar: sidebarSlice,
});

export default rootReducer;
