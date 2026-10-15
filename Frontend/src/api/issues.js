
import apiClient from "./client";

// Fetch all campus issues.
export const getIssues = async () => {
  const response = await apiClient.get("/issues");
  return response.data.issues;
};

// Create a campus issue.
export const createIssue = async (issueData, token) => {
  const response = await apiClient.post("/issues", issueData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.issue;
};

// Update an issue's status.
export const updateIssueStatus = async (id, status, token) => {
  const response = await apiClient.patch(
    `/issues/${id}/status`,
    { status },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.issue;
};
