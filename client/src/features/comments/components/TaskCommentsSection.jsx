// src/features/comments/components/TaskCommentsSection.jsx

import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  TextField,
  Button,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Send, Edit2, Trash2, Check, X, MessageSquare } from "lucide-react";

import {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} from "../api/commentApi";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import ErrorState from "../../../components/common/ErrorState";
import EmptyState from "../../../components/common/EmptyState";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { formatError } from "../../../utils/formatError";
import { formatRelativeDate } from "../../../utils/formatDate";

import { getSocket } from "../../../services/socket";

const TaskCommentsSection = ({ projectId, taskId }) => {
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

  // Real-time socket listener for new comments
  React.useEffect(() => {
    const socket = getSocket();
    if (socket) {
      const handleNewComment = () => {
        refetch();
      };
      socket.on("comment:created", handleNewComment);
      return () => {
        socket.off("comment:created", handleNewComment);
      };
    }
  }, [refetch]);

  const [createComment, { isLoading: isCreating }] = useCreateCommentMutation();
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();

  const [newContent, setNewContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [actionError, setActionError] = useState("");

  const comments = commentsData?.data || [];

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
    } catch (err) {
      setActionError(formatError(err));
    }
  };

  const handleStartEdit = (comment) => {
    setEditingCommentId(comment._id);
    setEditContent(comment.content || "");
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

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <MessageSquare size={20} color="#4F46E5" />
        <Typography variant="h6" fontWeight={700} color="text.primary">
          Comments ({comments.length})
        </Typography>
      </Box>

      {actionError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setActionError("")}>
          {actionError}
        </Alert>
      )}

      {/* Add New Comment Box */}
      <Paper
        elevation={0}
        component="form"
        onSubmit={handleCreate}
        sx={{
          p: 2,
          mb: 4,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box display="flex" gap={2}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "primary.main",
              fontSize: "0.85rem",
              fontWeight: 700,
            }}
          >
            {getInitials(currentUser?.name)}
          </Avatar>
          <Box flex={1}>
            <TextField
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Add a comment to this task..."
              multiline
              rows={2}
              fullWidth
              size="small"
              sx={{ mb: 1.5 }}
            />
            <Box display="flex" justifyContent="flex-end">
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="small"
                disabled={isCreating || !newContent.trim()}
                startIcon={
                  isCreating ? <CircularProgress size={14} color="inherit" /> : <Send size={14} />
                }
                sx={{ textTransform: "none", fontWeight: 700, px: 2.5 }}
              >
                {isCreating ? "Posting..." : "Post Comment"}
              </Button>
            </Box>
          </Box>
        </Box>
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
        <Box display="flex" flexDirection="column" gap={2.5}>
          {comments.map((comment) => {
            const author = comment.authorId || comment.author || {};
            const isAuthor = author._id === currentUser?.id || author._id === currentUser?._id;
            const isEditing = editingCommentId === comment._id;

            return (
              <Paper
                key={comment._id}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                }}
              >
                <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1.5}>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        bgcolor: "primary.main",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                      }}
                    >
                      {getInitials(author.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                        {author.name || "User"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatRelativeDate(comment.createdAt)}
                      </Typography>
                    </Box>
                  </Box>

                  {isAuthor && !isEditing && (
                    <Box display="flex" gap={0.5}>
                      <IconButton size="small" onClick={() => handleStartEdit(comment)}>
                        <Edit2 size={15} color="#64748B" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setCommentToDelete(comment)}
                      >
                        <Trash2 size={15} />
                      </IconButton>
                    </Box>
                  )}
                </Box>

                {isEditing ? (
                  <Box mt={1}>
                    <TextField
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      multiline
                      rows={2}
                      fullWidth
                      size="small"
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
                  <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                    {comment.content}
                  </Typography>
                )}
              </Paper>
            );
          })}
        </Box>
      )}

      {/* Delete Modal */}
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
