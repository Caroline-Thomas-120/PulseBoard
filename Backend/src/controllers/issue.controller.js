
import { prisma } from "../lib/prisma.js";
import { sendIssueEvent } from "../services/issueEvents.js";

// Create a new campus issue.
export const createIssue = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    if (
      !title?.trim() ||
      !description?.trim() ||
      !category?.trim()
    ) {
      return res.status(400).json({
        message: "Title, description, and category are required.",
      });
    }

    const allowedPriorities = ["LOW", "MEDIUM", "HIGH"];

    if (
      priority !== undefined &&
      !allowedPriorities.includes(priority)
    ) {
      return res.status(400).json({
        message: "Priority must be LOW, MEDIUM, or HIGH.",
      });
    }

    const issue = await prisma.issue.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        priority: priority ?? "MEDIUM",
        reporterId: req.user.id,
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: "Campus issue created successfully.",
      issue,
    });
  } catch (error) {
    console.error("Create issue failed:", error);

    sendIssueEvent("issue-created", issue);
    return res.status(500).json({
      message: "Something went wrong while creating the issue.",
    });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "OPEN",
      "IN_PROGRESS",
      "RESOLVED",
      "CLOSED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid issue status.",
      });
    }

    const existingIssue = await prisma.issue.findUnique({
      where: { id },
    });

    if (!existingIssue) {
      return res.status(404).json({
        message: "Issue not found.",
      });
    }

    const issue = await prisma.issue.update({
      where: { id },
      data: { status },
    });
sendIssueEvent("issue-updated", issue);

    return res.status(200).json({
      message: "Issue status updated successfully.",
      issue,
    });
  } catch (error) {
    console.error("Update issue status failed:", error);
sendIssueEvent("issue-updated", issue);

    return res.status(500).json({
      message: "Something went wrong while updating the issue.",
    });
  }
};

// Get all campus issues.
export const getIssues = async (req, res) => {
  try {
    const issues = await prisma.issue.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        reporter: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return res.status(200).json({ issues });
  } catch (error) {
    console.error("Get issues failed:", error);

    return res.status(500).json({
      message: "Something went wrong while fetching issues.",
    });
  }
};
