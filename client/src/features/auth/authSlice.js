// src/features/auth/authSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialToken = localStorage.getItem("token") || null;

let initialUser = null;
try {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    initialUser = JSON.parse(storedUser);
  }
} catch (e) {
  initialUser = null;
}

let initialOrg = null;
try {
  const storedOrg = localStorage.getItem("currentOrg");
  if (storedOrg) {
    initialOrg = JSON.parse(storedOrg);
  }
} catch (e) {
  initialOrg = null;
}

const initialState = {
  user: initialUser,
  token: initialToken,
  isAuthenticated: Boolean(initialToken),
  currentOrganization: initialOrg,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { user, accessToken } = action.payload;
      if (user) {
        state.user = user;
        localStorage.setItem("user", JSON.stringify(user));
      }
      if (accessToken) {
        state.token = accessToken;
        state.isAuthenticated = true;
        localStorage.setItem("token", accessToken);
      }
    },
    setAuthUser: (state, action) => {
      state.user = action.payload;
      if (action.payload) {
        localStorage.setItem("user", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("user");
      }
    },
    setCurrentOrganization: (state, action) => {
      state.currentOrganization = action.payload;
      if (action.payload) {
        localStorage.setItem("currentOrg", JSON.stringify(action.payload));
      } else {
        localStorage.removeItem("currentOrg");
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.currentOrganization = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("currentOrg");
    },
  },
});

export const {
  setCredentials,
  setAuthUser,
  setCurrentOrganization,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
