import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/user-slice";
import cartReducer from "./features/cart-slice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      user: userReducer,
      cart: cartReducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
