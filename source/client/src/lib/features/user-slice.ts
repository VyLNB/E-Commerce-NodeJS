import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserAuth } from "../types";

export interface AvatarPayload {
  avatar: string;
}

const initialState: UserAuth = {
  _id: null,
  email: null,
  fullName: null,
  avatar: null,
  loyaltyPoints: null,
  accessToken: null,
  isAuthenticated: false,
};

// This payload is the data received after a successful login
export interface AuthPayload {
  _id: string;
  email: string;
  fullName: string;
  avatar: string;
  loyaltyPoints: number;
  accessToken: string;
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthPayload>) => {
      state._id = action.payload._id;
      state.email = action.payload.email;
      state.fullName = action.payload.fullName;
      state.avatar = action.payload.avatar;
      state.loyaltyPoints = action.payload.loyaltyPoints;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    setAvatar: (state, action: PayloadAction<AvatarPayload>) => {
      state.avatar = action.payload.avatar;
    },
    clearCredentials: (state) => {
      state._id = null;
      state.email = null;
      state.fullName = null;
      state.avatar = null;
      state.loyaltyPoints = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, clearCredentials, setAvatar } =
  userSlice.actions;

export default userSlice.reducer;
