// src/constants/roles.js

export const ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  MEMBER: "MEMBER",
};

export const ROLE_LABELS = {
  [ROLES.OWNER]: "Organization Owner",
  [ROLES.ADMIN]: "Admin",
  [ROLES.MANAGER]: "Manager",
  [ROLES.MEMBER]: "Member",
};

export const ROLE_OPTIONS = [
  {
    value: ROLES.OWNER,
    label: ROLE_LABELS[ROLES.OWNER],
  },
  {
    value: ROLES.ADMIN,
    label: ROLE_LABELS[ROLES.ADMIN],
  },
  {
    value: ROLES.MANAGER,
    label: ROLE_LABELS[ROLES.MANAGER],
  },
  {
    value: ROLES.MEMBER,
    label: ROLE_LABELS[ROLES.MEMBER],
  },
];
