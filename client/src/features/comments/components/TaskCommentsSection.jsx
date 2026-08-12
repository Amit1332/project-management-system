// src/features/comments/components/TaskCommentsSection.jsx

import React, { useState, useRef } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  TextField,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Collapse,
  Popover,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
} from "@mui/material";
import { Send, Edit2, Trash2, Check, X, MessageSquare, ChevronDown, ChevronUp, AtSign } from "lucide-react";

import {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "../api/commentApi";
import { useGetMembersQuery } from "../../organizations/api/organizationApi";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import EmptyState from "../../../components/common/EmptyState";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { formatError } from "../../../utils/formatError";
import { formatRelativeDate } from "../../../utils/formatDate";
import { getSocket, joinRoom, onSocketEvent } from "../../../services/socket";

import { useGetProjectMembersQuery } from "../../projects/api/projectApi";

const TaskCommentsSection = ({ projectId, taskId, canManageTask = false }) => {
  const { user: currentUser, currentOrganization } = useSelector((state) => state.auth);

  const {
    data: commentsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetCommentsQuery(
    { projectId, taskId, organizationId: currentOrganization?._id },
    { skip: !projectId || !taskId }
  );

  const { data: membersData } = useGetMembersQuery(currentOrganization?._id, {
    skip: !currentOrganization?._id,
  });

  const { data: projectMembersData } = useGetProjectMembersQuery(
    { projectId, organizationId: currentOrganization?._id },
    { skip: !projectId }
  );

  const membersList = membersData?.data || [];
  const projectMembersList = projectMembersData?.data || [];

  const myOrgMember = membersList.find((m) => (m.userId?._id || m.userId) === currentUser?._id);
  const myProjectMember = projectMembersList.find((m) => (m.userId?._id || m.userId) === currentUser?._id);

  const canManage =
    canManageTask ||
    ["OWNER", "ADMIN"].includes(myOrgMember?.role) ||
    ["MANAGER", "OWNER"].includes(myProjectMember?.role);

  // Real-time socket listeners for comment create, update, and delete
  React.useEffect(() => {
    if (taskId) {
      joinRoom("task", taskId);
    }
    if (projectId) {
      joinRoom("project", projectId);
    }

    const handleCommentChange = () => {
      refetch();
    };

    const unsubs = [
      onSocketEvent("comment:created", handleCommentChange),
      onSocketEvent("comment:updated", handleCommentChange),
      onSocketEvent("comment:deleted", handleCommentChange),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub && unsub());
    };
  }, [projectId, taskId, refetch]);

  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();

  const [newContent, setNewContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [actionError, setActionError] = useState("");

  // Track collapsed comment cards
  const [collapsedMap, setCollapsedMap] = useState({});

  // @Mention autocomplete states
  const [mentionAnchorEl, setMentionAnchorEl] = useState(null);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(-1);
  const textFieldInputRef = useRef(null);

  const toggleCollapse = (commentId) => {
    setCollapsedMap((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const comments = commentsData?.data || [];

  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewContent(value);

    const cursorPosition = e.target.selectionStart || value.length;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const match = textBeforeCursor.match(/@([a-zA-Z0-9._-]*)$/);

    if (match) {
      const query = match[1];
      setMentionQuery(query);
      setMentionIndex(cursorPosition - match[0].length);
      setMentionAnchorEl(textFieldInputRef.current);
    } else {
      setMentionAnchorEl(null);
      setMentionQuery("");
    }
  };

  const handleSelectMention = (memberUser) => {
    if (!memberUser) return;
    const mentionText = memberUser.email || memberUser.name;
    const beforeMention = newContent.slice(0, mentionIndex);
    const cursorPosition = textFieldInputRef.current?.selectionStart || newContent.length;
    const afterMention = newContent.slice(cursorPosition);

    const updatedText = `${beforeMention}@${mentionText} ${afterMention}`;
    setNewContent(updatedText);
    setMentionAnchorEl(null);
    setMentionQuery("");

    if (textFieldInputRef.current) {
      textFieldInputRef.current.focus();
    }
  };

  const filteredMembers = membersList.filter((m) => {
    const u = m.userId || {};
    const q = mentionQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setActionError("");

    try {
      await createComment({
        projectId,
        taskId,
        content: newContent.trim(),
        organizationId: currentOrganization?._id,
      }).unwrap();
      setNewContent("");
      setMentionAnchorEl(null);
    } catch (err) {
      setActionError(formatError(err));
    }
  };

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditContent(comment.content || "");
    setCollapsedMap((prev) => ({ ...prev, [comment._id]: false }));
  };

  const handleSaveEdit = async (commentId) => {
    if (!editContent.trim()) return;
    setActionError("");

    try {
      await updateComment({
        projectId,
        taskId,
        commentId,
        content: editContent.trim(),
        organizationId: currentOrganization?._id,
      }).unwrap();
      setEditingCommentId(null);
    } catch (err) {
      setActionError(formatError(err));
    }
  };

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;
    setActionError("");

    try {
      await deleteComment({
        projectId,
        taskId,
        commentId: commentToDelete._id,
        organizationId: currentOrganization?._id,
      }).unwrap();
      setCommentToDelete(null);
    } catch (err) {
      setActionError(formatError(err));
      setCommentToDelete(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper to highlight @mentions with a soft blue badge styling
  const renderCommentWithMentions = (content) => {
    if (!content) return null;
    const mentionRegex = /(@[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}|@[a-zA-Z0-9._-]+)/g;
    const parts = content.split(mentionRegex);

    return parts.map((part, idx) => {
      if (part.match(/^@[a-zA-Z0-9._-]+/)) {
        return (
          <span
            key={idx}
            style={{
              color: "#2563EB",
              backgroundColor: "#EFF6FF",
              border: "1px solid #BFDBFE",
              padding: "2px 8px",
              borderRadius: "6px",
              fontWeight: 700,
              fontSize: "0.85rem",
              margin: "0 3px",
              display: "inline-flex",
              alignItems: "center",
              gap: "2px",
            }}
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <Box>
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
        <MessageSquare size={20} color="#eb4634" />
        <Typography variant="h6" fontWeight={800} color="text.primary" letterSpacing="-0.02em">
          Comments ({comments.length})
        </Typography>
      </div>

      {actionError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setActionError("")}>
          {actionError}
        </Alert>
      )}

      {/* Add New Comment Box */}
      <Paper
        elevation={0}
        component="form"
        onSubmit={handleCreate}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-start",
            gap: "16px",
            width: "100%",
          }}
        >
          <Avatar
            src={currentUser?.avatar}
            sx={{
              width: 38,
              height: 38,
              bgcolor: "#eb4634",
              fontSize: "0.85rem",
              fontWeight: 700,
              borderRadius: "10px",
              flexShrink: 0,
              mt: 0.5,
            }}
          >
            {getInitials(currentUser?.name)}
          </Avatar>

          <div style={{ flex: 1, minWidth: 0, position: "relative" }}>
            <TextField
              inputRef={textFieldInputRef}
              value={newContent}
              onChange={handleInputChange}
              placeholder="Add a comment... Type @ to mention organization members"
              multiline
              rows={2}
              fullWidth
              size="medium"
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  transition: "border-color 0.2s",
                  "&:hover fieldset": {
                    borderColor: "#eb4634",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#eb4634",
                  },
                },
              }}
            />

            {/* Mention Suggestions Popover Dropdown */}
            <Popover
              open={Boolean(mentionAnchorEl) && filteredMembers.length > 0}
              anchorEl={mentionAnchorEl}
              onClose={() => setMentionAnchorEl(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              disableAutoFocus
              disableEnforceFocus
              slotProps={{
                paper: {
                  sx: {
                    width: 320,
                    maxHeight: 240,
                    mt: 0.5,
                    borderRadius: 3,
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
                    border: "1px solid #E2E8F0",
                    overflowY: "auto",
                  },
                },
              }}
            >
              <Box p={1}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", marginBottom: 4 }}>
                  <AtSign size={14} color="#eb4634" />
                  <Typography variant="caption" color="text.secondary" fontWeight={800}>
                    SELECT MEMBER TO MENTION
                  </Typography>
                </div>
                <List disablePadding>
                  {filteredMembers.map((m) => {
                    const u = m.userId || {};
                    return (
                      <ListItem
                        key={u._id || m._id}
                        onClick={() => handleSelectMention(u)}
                        sx={{
                          borderRadius: 2,
                          py: 1,
                          px: 1.5,
                          cursor: "pointer",
                          transition: "background-color 0.15s",
                          "&:hover": { bgcolor: "#EEF2FF" },
                        }}
                      >
                        <ListItemAvatar sx={{ minWidth: 40 }}>
                          <Avatar
                            src={u.avatar}
                            sx={{ width: 32, height: 32, bgcolor: "#eb4634", fontSize: "0.75rem", fontWeight: 700 }}
                          >
                            {getInitials(u.name)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={700} color="#0F172A">
                              {u.name}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {u.email}
                            </Typography>
                          }
                        />
                        <Chip
                          label={m.role || "MEMBER"}
                          size="small"
                          sx={{ fontSize: "0.65rem", height: 18, fontWeight: 700, bgcolor: "#F1F5F9" }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            </Popover>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isCreating || !newContent.trim()}
                startIcon={
                  isCreating ? <CircularProgress size={14} color="inherit" /> : <Send size={14} />
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  px: 3,
                  py: 1,
                  borderRadius: 2.5,
                  boxShadow: "0 4px 14px rgba(79, 70, 229, 0.3)",
                }}
              >
                {isCreating ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>
        </div>
      </Paper>

      {/* Comments List */}
      {isLoading ? (
        <LoadingSpinner label="Loading comments..." py={4} />
      ) : isError ? (
        <ErrorState message={formatError(error)} onRetry={refetch} />
      ) : comments.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No comments yet"
          description="Be the first to leave a comment or update on this task."
        />
      ) : (
        <div>
          {comments.map((comment) => {
            const author = comment.authorId || comment.author || {};
            const isAuthor = author._id === currentUser?.id || author._id === currentUser?._id;
            const isEditing = editingCommentId === comment._id;
            const isCollapsed = Boolean(collapsedMap[comment._id]);

            return (
              <Paper
                key={comment._id}
                elevation={0}
                sx={{
                  p: 3,
                  mb: 2.5,
                  borderRadius: 3.5,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  boxShadow: "0 2px 6px rgba(15, 23, 42, 0.03)",
                  transition: "all 0.2s ease-in-out",
                }}
              >
                {/* Comment Card Header */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "14px",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: "12px",
                      flex: 1,
                      minWidth: 0,
                      cursor: "pointer",
                    }}
                    onClick={() => toggleCollapse(comment._id)}
                  >
                    <Avatar
                      src={author.avatar}
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "#eb4634",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        borderRadius: "10px",
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(author.name)}
                    </Avatar>

                    <div style={{ minWidth: 0 }}>
                      <Typography variant="subtitle2" fontWeight={800} color="text.primary" lineHeight={1.2}>
                        {author.name || "User"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatRelativeDate(comment.createdAt)}
                      </Typography>
                    </div>
                  </div>

                  {/* Actions & Collapse Toggle */}
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                    {canManage && !isEditing && (
                      <>
                        <IconButton size="small" onClick={() => handleStartEdit(comment)} title="Edit comment">
                          <Edit2 size={15} color="#64748B" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => setCommentToDelete(comment)} title="Delete comment">
                          <Trash2 size={15} color="#DC2626" />
                        </IconButton>
                      </>
                    )}

                    <IconButton
                      size="small"
                      onClick={() => toggleCollapse(comment._id)}
                      title={isCollapsed ? "Expand comment" : "Collapse comment"}
                    >
                      {isCollapsed ? <ChevronDown size={18} color="#64748B" /> : <ChevronUp size={18} color="#64748B" />}
                    </IconButton>
                  </div>
                </div>

                {/* Collapsible Content Body */}
                <Collapse in={!isCollapsed} timeout="auto" unmountOnExit>
                  <Box mt={2}>
                    {isEditing ? (
                      <Box>
                        <TextField
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          multiline
                          rows={2}
                          fullWidth
                          size="medium"
                          sx={{ mb: 1.5 }}
                        />
                        <Box display="flex" gap={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            color="inherit"
                            onClick={() => setEditingCommentId(null)}
                            startIcon={<X size={14} />}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            onClick={() => handleSaveEdit(comment._id)}
                            disabled={isUpdating}
                            startIcon={<Check size={14} />}
                          >
                            Save
                          </Button>
                        </Box>
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{ lineHeight: 1.6, whiteSpace: "pre-wrap", pl: "48px" }}
                      >
                        {renderCommentWithMentions(comment.content)}
                      </Typography>
                    )}
                  </Box>
                </Collapse>
              </Paper>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={Boolean(commentToDelete)}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        confirmColor="error"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setCommentToDelete(null)}
      />
    </Box>
  );
};

export default TaskCommentsSection;
