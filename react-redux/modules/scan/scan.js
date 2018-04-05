import BookEntryList from "./components/bookEntryList";
import reducer from "./reducers/reducer";

import "./redirectScan";

console.log("scanVar == ", scanVar);

export default {
  reducer: reducer,
  component: BookEntryList
};
