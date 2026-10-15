
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIssue } from "../api/issues";

export default function CreateIssueForm() {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Infrastructure",
    priority: "MEDIUM",
  });

  // Update the field the student changes.
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // Send the new issue to the backend.
  const mutation = useMutation({
    mutationFn: (issueData) => {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in before submitting an issue.");
      }

      return createIssue(issueData, token);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["issues"] });

      setFormData({
        title: "",
        description: "",
        category: "Infrastructure",
        priority: "MEDIUM",
      });
    },
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <section className="create-issue">
      <h2>Report a campus issue</h2>
      <p>Tell us what's wrong so the campus team can take action.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="title">Issue title</label>
        <input
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="e.g. Broken classroom projector"
          required
        />

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe the problem and where it occurred..."
          required
          rows={4}
        />

        <label htmlFor="category">Category</label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
        >
          <option value="Infrastructure">Infrastructure</option>
          <option value="Cleanliness">Cleanliness</option>
          <option value="Electrical">Electrical</option>
          <option value="Internet">Internet</option>
          <option value="Other">Other</option>
        </select>

        <label htmlFor="priority">Priority</label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Submitting..." : "Submit Issue"}
        </button>

        {mutation.isSuccess && (
          <p role="status">Issue submitted successfully!</p>
        )}

        {mutation.isError && (
          <p role="alert">
            {mutation.error.message || "Could not submit the issue."}
          </p>
        )}
      </form>
    </section>
  );
}
