// src/utils/permissions.js

export const ROLES = {
  OWNER: "OWNER",
  ADMIN: "ADMIN",
  MANAGER: "MANAGER",
  MEMBER: "MEMBER",
};

export const hasRole = (user, roles = []) => {
  if (!user?.role) {
    return false;
  }

  if (!Array.isArray(roles)) {
    roles = [roles];
  }

  return roles.includes(user.role);
};

export const isOwner = (user) => {
  return user?.role === ROLES.OWNER;
};

export const isAdmin = (user) => {
  return user?.role === ROLES.ADMIN;
};

export const isManager = (user) => {
  return user?.role === ROLES.MANAGER;
};

export const isMember = (user) => {
  return user?.role === ROLES.MEMBER;
};

export const canManageOrganization = (user) => {
  return hasRole(user, [ROLES.OWNER, ROLES.ADMIN]);
};

export const canManageOrganizationMembers = (user) => {
  return hasRole(user, [ROLES.OWNER, ROLES.ADMIN]);
};

export const canCreateProject = (user) => {
  return hasRole(user, [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER]);
};

export const canManageProject = (user) => {
  return hasRole(user, [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER]);
};

export const canManageProjectMembers = (user) => {
  return hasRole(user, [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER]);
};

export const canCreateTask = (user) => {
  return hasRole(user, [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER]);
};

export const canManageTask = (user) => {
  return hasRole(user, [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER]);
};

export const canAssignTask = (user) => {
  return hasRole(user, [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER]);
};

export const canUpdateAssignedTask = (user) => {
  return hasRole(user, [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER, ROLES.MEMBER]);
};

export const canDeleteTask = (user) => {
  return hasRole(user, [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER]);
};

export const canComment = (user) => {
  return Boolean(user);
};

export const canManageComment = (user, comment) => {
  if (!user || !comment) {
    return false;
  }

  // Comment author can manage their own comment
  if (comment.author?._id === user._id) {
    return true;
  }

  // Admin/Manager can manage comments
  return hasRole(user, [ROLES.OWNER, ROLES.ADMIN, ROLES.MANAGER]);
};
