// src/features/auth/api/authApi.js

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../app/baseQuery";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
    }),

    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),

    getMe: builder.query({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),

    searchUsers: builder.query({
      query: (search = "") => `/auth/users/search?search=${encodeURIComponent(search)}`,
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useSearchUsersQuery,
  useLogoutMutation,
} = authApi;
