// src/app/baseQuery.js

import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { logout } from "../features/auth/authSlice";

const isProductionDomain =
  typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1";

const defaultBackendUrl = isProductionDomain
  ? "https://project-management-system-31oc.onrender.com"
  : "http://localhost:3001";

const rawApiUrl = import.meta.env.VITE_API_URL || defaultBackendUrl;
const baseUrl = rawApiUrl.replace(/\/+$/, "");

const rawBaseQuery = fetchBaseQuery({
  baseUrl: baseUrl.endsWith("/api") ? baseUrl : `${baseUrl}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token || localStorage.getItem("token");
    const currentOrg = getState().auth.currentOrganization;

    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    if (currentOrg?._id) {
      headers.set("x-organization-id", currentOrg._id);
    }
    return headers;
  },
});

export const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Stale or expired token received -> auto logout
    api.dispatch(logout());
  }

  return result;
};
