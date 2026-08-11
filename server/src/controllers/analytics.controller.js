const Projects = require("../models/projects.models");
const Tasks = require("../models/tasks.model");

const getDashboardAnalytics = async (req, res) => {
  try {
    const { organizationId, projectId } = req.query;

    if (!organizationId) {
      return res.status(400).json({
        success: false,
        message: "organizationId query parameter is required.",
      });
    }

    const projectFilter = { organizationId };
    const taskFilter = { organizationId, archived: false };

    if (projectId) {
      taskFilter.projectId = projectId;
    }

    // 1. Projects metrics
    const totalProjects = await Projects.countDocuments(projectFilter);
    const activeProjects = await Projects.countDocuments({ ...projectFilter, status: "ACTIVE" });
    const completedProjects = await Projects.countDocuments({ ...projectFilter, status: "COMPLETED" });

    // 2. Tasks metrics
    const totalTasks = await Tasks.countDocuments(taskFilter);
    const completedTasks = await Tasks.countDocuments({
      ...taskFilter,
      status: { $in: ["DONE", "COMPLETED"] },
    });

    const now = new Date();
    const overdueTasks = await Tasks.countDocuments({
      ...taskFilter,
      status: { $nin: ["DONE", "COMPLETED"] },
      dueDate: { $lt: now },
    });

    const myTasksCount = await Tasks.countDocuments({
      ...taskFilter,
      assigneeId: req.user._id,
    });

    // 3. Tasks breakdown by status
    const statusCounts = {
      TODO: await Tasks.countDocuments({ ...taskFilter, status: "TODO" }),
      IN_PROGRESS: await Tasks.countDocuments({ ...taskFilter, status: "IN_PROGRESS" }),
      IN_REVIEW: await Tasks.countDocuments({ ...taskFilter, status: "IN_REVIEW" }),
      DONE: completedTasks,
    };

    // 4. Tasks breakdown by priority
    const priorityCounts = {
      LOW: await Tasks.countDocuments({ ...taskFilter, priority: "LOW" }),
      MEDIUM: await Tasks.countDocuments({ ...taskFilter, priority: "MEDIUM" }),
      HIGH: await Tasks.countDocuments({ ...taskFilter, priority: "HIGH" }),
      CRITICAL: await Tasks.countDocuments({ ...taskFilter, priority: "CRITICAL" }),
    };

    // 5. Recent My Tasks
    const myTasks = await Tasks.find({
      ...taskFilter,
      assigneeId: req.user._id,
    })
      .populate("projectId", "name")
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(6);

    return res.status(200).json({
      success: true,
      data: {
        totalProjects,
        activeProjects,
        completedProjects,
        totalTasks,
        completedTasks,
        overdueTasks,
        myTasksCount,
        tasksByStatus: statusCounts,
        tasksByPriority: priorityCounts,
        myTasks,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch dashboard analytics",
    });
  }
};

module.exports = {
  getDashboardAnalytics,
};
