// src/features/organizations/api/organizationApi.js

import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "../../../app/baseQuery";

export const organizationApi = createApi({
  reducerPath: "organizationApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Organization", "OrganizationDetail", "OrganizationMembers"],
  endpoints: (builder) => ({
    // Get My Organizations
    getMyOrganizations: builder.query({
      query: () => "/organizations",
      providesTags: ["Organization"],
    }),

    // Get Organization Details
    getOrganization: builder.query({
      query: (organizationId) => `/organizations/${organizationId}`,
      providesTags: (result, error, organizationId) => [
        { type: "OrganizationDetail", id: organizationId },
      ],
    }),

    // Create Organization
    createOrganization: builder.mutation({
      query: (data) => ({
        url: "/organizations",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Organization"],
    }),

    // Update Organization
    updateOrganization: builder.mutation({
      query: ({ organizationId, ...data }) => ({
        url: `/organizations/${organizationId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { organizationId }) => [
        "Organization",
        { type: "OrganizationDetail", id: organizationId },
      ],
    }),

    // Get Organization Members
    getMembers: builder.query({
      query: (organizationId) => `/organizations/${organizationId}/members`,
      providesTags: (result, error, organizationId) => [
        { type: "OrganizationMembers", id: organizationId },
      ],
    }),

    // Add Member to Organization
    addMember: builder.mutation({
      query: ({ organizationId, ...data }) => ({
        url: `/organizations/${organizationId}/members`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { organizationId }) => [
        { type: "OrganizationMembers", id: organizationId },
      ],
    }),

    // Update Member Role
    updateMemberRole: builder.mutation({
      query: ({ organizationId, userId, role }) => ({
        url: `/organizations/${organizationId}/members/${userId}`,
        method: "PATCH",
        body: { role },
      }),
      invalidatesTags: (result, error, { organizationId }) => [
        { type: "OrganizationMembers", id: organizationId },
      ],
    }),

    // Remove Member
    removeMember: builder.mutation({
      query: ({ organizationId, userId }) => ({
        url: `/organizations/${organizationId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { organizationId }) => [
        { type: "OrganizationMembers", id: organizationId },
      ],
    }),
  }),
});

export const {
  useGetMyOrganizationsQuery,
  useGetOrganizationQuery,
  useCreateOrganizationMutation,
  useUpdateOrganizationMutation,
  useGetMembersQuery,
  useAddMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} = organizationApi;
