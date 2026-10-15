import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { getIssues, updateIssueStatus } from "./api/issues";
import { useIssueEvents } from "./hooks/useIssueEvents";
import CreateIssueForm from "./components/CreateIssueForm";
import Auth from "./Auth";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  useIssueEvents();

  const {
    data: issues = [],
    isPending,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["issues"],
    queryFn: getIssues,
    enabled: isLoggedIn,
  });

  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Please log in to update an issue.");
      }

      return updateIssueStatus(id, status, token);
    },

    onSuccess: () => {
      // Fetch the latest issues and refresh the statistics.
      queryClient.invalidateQueries({
        queryKey: ["issues"],
      });
    },
  });

  if (!isLoggedIn) {
    return <Auth onLogin={() => setIsLoggedIn(true)} />;
  }

  const openCount = issues.filter(
    (issue) => issue.status === "OPEN"
  ).length;

  const inProgressCount = issues.filter(
    (issue) => issue.status === "IN_PROGRESS"
  ).length;

  const resolvedCount = issues.filter(
    (issue) => issue.status === "RESOLVED"
  ).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <main className="app">
      <header className="topbar">
        <div>
          <p className="eyebrow">CAMPUS COMMUNITY</p>
          <h1>PulseBoard</h1>
          <p className="subtitle">
            Report problems. Track progress. Improve campus life.
          </p>
        </div>

        <div>
          <button
            className="refresh-button"
            onClick={() => refetch()}
          >
            Refresh issues
          </button>

          <button onClick={handleLogout}>
            Log out
          </button>
        </div>
      </header>

      <section className="stats">
        <article className="stat-card">
          <span>Total issues</span>
          <strong>{issues.length}</strong>
        </article>

        <article className="stat-card">
          <span>Open</span>
          <strong>{openCount}</strong>
        </article>

        <article className="stat-card">
          <span>In progress</span>
          <strong>{inProgressCount}</strong>
        </article>

        <article className="stat-card">
          <span>Resolved</span>
          <strong>{resolvedCount}</strong>
        </article>
      </section>

      <CreateIssueForm />

      <section className="issues-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CAMPUS REPORTS</p>
            <h2>Recent issues</h2>
          </div>

          <span className="issue-count">
            {issues.length} reports
          </span>
        </div>

        {isPending && (
          <p className="message">Loading campus issues...</p>
        )}

        {isError && (
          <div className="error-message">
            <p>We couldn't load the issues.</p>
            <p>{error.message}</p>
            <button onClick={() => refetch()}>
              Try again
            </button>
          </div>
        )}

        {!isPending && !isError && issues.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">◎</span>
            <h3>No issues reported yet</h3>
            <p>
              Campus reports will appear here when they are submitted.
            </p>
          </div>
        )}

        {!isPending && !isError && issues.length > 0 && (
          <div className="issue-list">
            {issues.map((issue) => (
              <article className="issue-card" key={issue.id}>
                <div className="issue-main">
                  <div className="issue-tags">
                    <span className="category">
                      {issue.category}
                    </span>

                    <span
                      className={`priority ${issue.priority.toLowerCase()}`}
                    >
                      {issue.priority}
                    </span>
                  </div>

                  <h3>{issue.title}</h3>
                  <p className="description">
                    {issue.description}
                  </p>

                  <p className="reporter">
                    Reported by{" "}
                    {issue.reporter?.name ?? "Campus member"}
                  </p>
                </div>

               
<div className="issue-actions">
  <span
    className={`status status-${issue.status.toLowerCase()}`}
  >
    {issue.status.replace("_", " ")}
  </span>

  <label className="status-control">
    <span>Change status</span>

    <select
      aria-label={`Change status for ${issue.title}`}
      value={issue.status}
      disabled={statusMutation.isPending}
      onChange={(event) =>
        statusMutation.mutate({
          id: issue.id,
          status: event.target.value,
        })
      }
    >
      <option value="OPEN">Open</option>
      <option value="IN_PROGRESS">In Progress</option>
      <option value="RESOLVED">Resolved</option>
      <option value="CLOSED">Closed</option>
    </select>
  </label>
</div>

              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
