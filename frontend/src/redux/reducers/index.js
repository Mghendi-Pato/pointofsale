import { combineReducers } from "redux";
import userSlice from "./user";
import sidebarSlice from "./ sidebar";

const rootReducer = combineReducers({
  userSlice: userSlice,
  sidebar: sidebarSlice,
});

export default rootReducer;
