import { combineReducers } from "redux";
import userSlice from "./user";

const rootReducer = combineReducers({
  userSlice: userSlice,
});

export default rootReducer;
