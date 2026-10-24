
import { useState } from "react";
import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { getIssues, updateIssueStatus } from "./api/issues";
import { useIssueEvents } from "./hooks/useIssueEvents";
import CreateIssueForm from "./components/CreateIssueForm";
import Auth from "./Auth";

function getSavedUser() {
  try {
    return JSON.parse(localStorage.getItem("pulseboard_user") || "null");
  } catch {
    return null;
  }
}

function getInitials(name = "User") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "U"
  );
}

function IssueList({ issues, onStatusChange, statusPending, limit }) {
  const visibleIssues =
    typeof limit === "number" ? issues.slice(0, limit) : issues;

  if (issues.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">◎</span>
        <h3>No issues found</h3>
        <p>When campus problems are reported, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="issue-list">
      {visibleIssues.map((issue) => (
        <article className="issue-card" key={issue.id}>
          <div className="issue-main">
            <div className="issue-tags">
              <span className="category">{issue.category}</span>
              <span className={`priority ${issue.priority.toLowerCase()}`}>
                {issue.priority}
              </span>
            </div>

            <h3>{issue.title}</h3>
            <p className="description">{issue.description}</p>
            <p className="reporter">
              Reported by {issue.reporter?.name ?? "Campus member"}
            </p>
          </div>

          <div className="issue-actions">
            <span className={`status status-${issue.status.toLowerCase()}`}>
              {issue.status.replace("_", " ")}
            </span>

            <label className="status-control">
              <span>Update status</span>
              <select
                aria-label={`Change status for ${issue.title}`}
                value={issue.status}
                disabled={statusPending}
                onChange={(event) =>
                  onStatusChange(issue.id, event.target.value)
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
  );
}

function DashboardPage({ issues, counts, isPending, isError, error, refetch, onStatusChange, statusPending }) {
  return (
    <>
      <section className="dashboard-welcome">
        <div>
          <p className="eyebrow">CAMPUS COMMUNITY</p>
          <h1>Your campus, <span>better together.</span></h1>
          <p className="subtitle">
            Report problems, follow progress, and help improve campus life.
          </p>
          <NavLink to="/report" className="primary-link">
            + Report an issue
          </NavLink>
        </div>
        <div className="welcome-decoration" aria-hidden="true">✳</div>
      </section>

      <section className="stats">
        <article className="stat-card">
          <span>Total issues</span>
          <strong>{issues.length}</strong>
          <small className="stat-note">All campus reports</small>
        </article>
        <article className="stat-card">
          <span>Open</span>
          <strong>{counts.open}</strong>
          <small className="stat-note">Awaiting attention</small>
        </article>
        <article className="stat-card">
          <span>In progress</span>
          <strong>{counts.inProgress}</strong>
          <small className="stat-note">Being worked on</small>
        </article>
        <article className="stat-card">
          <span>Resolved</span>
          <strong>{counts.resolved}</strong>
          <small className="stat-note">Successfully addressed</small>
        </article>
      </section>

      <section className="issues-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">LATEST ACTIVITY</p>
            <h2>Recent issues</h2>
            <p className="section-description">
              A quick look at the latest campus reports.
            </p>
          </div>
          <NavLink to="/issues" className="text-link">
            View all issues →
          </NavLink>
        </div>

        {isPending && <p className="message">Loading campus issues...</p>}

        {isError && (
          <div className="error-message">
            <p>We couldn't load the issues.</p>
            <p>{error?.message}</p>
            <button onClick={() => refetch()} type="button">Try again</button>
          </div>
        )}

        {!isPending && !isError && (
          <IssueList
            issues={issues}
            limit={5}
            onStatusChange={onStatusChange}
            statusPending={statusPending}
          />
        )}
      </section>
    </>
  );
}

function AllIssuesPage({ issues, isPending, isError, error, refetch, onStatusChange, statusPending }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const categories = [...new Set(issues.map((issue) => issue.category).filter(Boolean))];

  const filteredIssues = issues.filter((issue) => {
    const term = search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      issue.title?.toLowerCase().includes(term) ||
      issue.description?.toLowerCase().includes(term) ||
      issue.category?.toLowerCase().includes(term);

    return (
      matchesSearch &&
      (statusFilter === "ALL" || issue.status === statusFilter) &&
      (priorityFilter === "ALL" || issue.priority === priorityFilter) &&
      (categoryFilter === "ALL" || issue.category === categoryFilter)
    );
  });

  return (
    <section className="issues-section page-panel">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">CAMPUS REPORTS</p>
          <h1>All issues</h1>
          <p className="section-description">
            Search, filter, and track reports across your campus.
          </p>
        </div>
        <NavLink to="/report" className="primary-link">+ Report an issue</NavLink>
      </div>

      <div className="issue-filters">
        <input
          aria-label="Search issues"
          placeholder="Search by title, description, or category..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="ALL">All statuses</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>

        <select aria-label="Filter by priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
          <option value="ALL">All priorities</option>
          <option value="HIGH">High priority</option>
          <option value="MEDIUM">Medium priority</option>
          <option value="LOW">Low priority</option>
        </select>

        <select aria-label="Filter by category" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
          <option value="ALL">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <p className="results-count">
        Showing {filteredIssues.length} of {issues.length} issues
      </p>

      {isPending && <p className="message">Loading campus issues...</p>}

      {isError && (
        <div className="error-message">
          <p>We couldn't load the issues.</p>
          <p>{error?.message}</p>
          <button onClick={() => refetch()} type="button">Try again</button>
        </div>
      )}

      {!isPending && !isError && (
        <IssueList
          issues={filteredIssues}
          onStatusChange={onStatusChange}
          statusPending={statusPending}
        />
      )}
    </section>
  );
}

function ReportPage() {
  return (
    <section className="report-page">
      <div className="page-title-row">
        <div>
          <p className="eyebrow">MAKE A DIFFERENCE</p>
          <h1>Report an issue</h1>
          <p className="section-description">
            Share the details so your campus team can take action.
          </p>
        </div>
      </div>
      <CreateIssueForm />
    </section>
  );
}

function PulseBoardApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );
  const [user, setUser] = useState(getSavedUser);
  const [profileOpen, setProfileOpen] = useState(false);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Please log in to update an issue.");
      return updateIssueStatus(id, status, token);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["issues"] }),
  });

  const handleLogin = () => {
    setUser(getSavedUser());
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("pulseboard_user");
    queryClient.clear();
    setUser(null);
    setProfileOpen(false);
    setIsLoggedIn(false);
    navigate("/");
  };

  if (!isLoggedIn) {
    return <Auth onLogin={handleLogin} />;
  }

  const counts = {
    open: issues.filter((issue) => issue.status === "OPEN").length,
    inProgress: issues.filter((issue) => issue.status === "IN_PROGRESS").length,
    resolved: issues.filter((issue) => issue.status === "RESOLVED").length,
  };

  const displayName = user?.name || user?.email?.split("@")[0] || "Campus member";
  const displayEmail = user?.email || "Account details unavailable";

  const handleStatusChange = (id, status) => {
    statusMutation.mutate({ id, status });
  };

  return (
    <main className="app">
      <header className="dashboard-header">
        <NavLink to="/" className="dashboard-brand" onClick={() => setProfileOpen(false)}>
          <span className="dashboard-brand-mark">P</span>
          <span>
            <strong>PulseBoard</strong>
            <span>Campus issue management</span>
          </span>
        </NavLink>

        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/issues">All issues</NavLink>
          <NavLink to="/report">Report an issue</NavLink>
        </nav>

        <div className="header-actions">
          <button className="refresh-button" onClick={() => refetch()} type="button">
            ↻ Refresh
          </button>

          <div className="profile-wrapper">
            <button
              className={`profile-trigger ${profileOpen ? "is-open" : ""}`}
              type="button"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              onClick={() => setProfileOpen((open) => !open)}
            >
              <span className="profile-avatar">{getInitials(displayName)}</span>
              <span className="profile-trigger-text">
                <strong>{displayName}</strong>
                <small>My account</small>
              </span>
              <span className="profile-chevron">{profileOpen ? "⌃" : "⌄"}</span>
            </button>

            {profileOpen && (
              <>
                <button className="profile-dismiss" type="button" aria-label="Close profile menu" onClick={() => setProfileOpen(false)} />
                <div className="profile-menu">
                  <div className="profile-menu-heading">
                    <span className="profile-avatar profile-avatar-large">{getInitials(displayName)}</span>
                    <div><strong>{displayName}</strong><span>{displayEmail}</span></div>
                  </div>
                  <div className="profile-menu-divider" />
                  <div className="profile-account-info">
                    <span className="profile-info-label">SIGNED IN TO</span>
                    <strong>PulseBoard</strong>
                    <span>Campus Community</span>
                  </div>
                  <button className="profile-logout" type="button" onClick={handleLogout}>↪ Log out</button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <DashboardPage
              issues={issues}
              counts={counts}
              isPending={isPending}
              isError={isError}
              error={error}
              refetch={refetch}
              onStatusChange={handleStatusChange}
              statusPending={statusMutation.isPending}
            />
          }
        />
        <Route
          path="/issues"
          element={
            <AllIssuesPage
              issues={issues}
              isPending={isPending}
              isError={isError}
              error={error}
              refetch={refetch}
              onStatusChange={handleStatusChange}
              statusPending={statusMutation.isPending}
            />
          }
        />
        <Route path="/report" element={<ReportPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {statusMutation.isError && (
        <p className="error-message status-error" role="alert">
          Couldn't update status: {statusMutation.error.message}
        </p>
      )}

      <footer className="app-footer">
        <span>PulseBoard</span>
        <span>Making campus life better, together.</span>
      </footer>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PulseBoardApp />
    </BrowserRouter>
  );
}
