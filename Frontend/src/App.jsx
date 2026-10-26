
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Auth from "./Auth";
import About from "./About";
import CreateIssueForm from "./components/CreateIssueForm";
import "./index.css";
import { useQuery } from "@tanstack/react-query";
import { getIssues } from "./api/issues";
import Profile from "./profile";

const queryClient = new QueryClient();

function DashboardPage() {
  const statuses = [
    {
      title: "Open Issues",
      count: 0,
      description: "Waiting for attention",
      icon: "📂",
      color: "#e9a23b",
    },
    {
      title: "In Progress",
      count: 0,
      description: "Currently being worked on",
      icon: "⚙️",
      color: "#5b7cfa",
    },
    {
      title: "Resolved",
      count: 0,
      description: "Successfully fixed",
      icon: "✅",
      color: "#20a779",
    },
    {
      title: "Closed",
      count: 0,
      description: "Work officially completed",
      icon: "🔒",
      color: "#8b5cf6",
    },
  ];

  return (
    <main className="dashboard">
     
<section className="dashboard-welcome">
  <div className="welcome-copy">
    <span className="dashboard-eyebrow">
      YOUR CAMPUS, YOUR VOICE
    </span>
    <h1>
      Campus issues,
      <br />
      <span>handled together.</span>
    </h1>
    <p>
      Welcome to PulseBoard. Report problems, follow progress,
      and help make your campus better.
    </p>
  </div>

  <div className="welcome-illustration" aria-hidden="true">
    <div className="illustration-circle">
      <span>✓</span>
    </div>
    <div className="illustration-note note-one">Issues tracked</div>
    <div className="illustration-note note-two">Campus connected</div>
  </div>
</section>

    </main>
  );
}


function AllIssuesPage() {
   const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["issues"],
    queryFn: () => getIssues(),
  });

  // Support APIs that return either an array or { issues: [...] }.
  const issues = Array.isArray(response)
    ? response
    : response?.issues || [];

  const statuses = [
    { label: "Open", value: "OPEN", color: "#e9a23b", icon: "📂" },
    {
      label: "In Progress",
      value: "IN_PROGRESS",
      color: "#5b7cfa",
      icon: "⚙️",
    },
    { label: "Resolved", value: "RESOLVED", color: "#20a779", icon: "✓" },
    { label: "Closed", value: "CLOSED", color: "#8b5cf6", icon: "🔒" },
  ];

  const countStatus = (status) =>
    issues.filter(
      (issue) => issue.status?.toUpperCase().replace(/[\s-]+/g, "_") === status
    ).length;

  return (
    <main className="all-issues-page">
      <section className="issues-heading">
        <div>
          <p className="dashboard-eyebrow">ISSUE MANAGEMENT</p>
          <h1>All Campus Issues</h1>
          <p>Track reported problems and monitor their status.</p>
        </div>

        <div className="issues-total">
          <span>Total Issues</span>
          <strong>{isLoading ? "..." : issues.length}</strong>
        </div>
      </section>

      {isLoading && <p>Loading issues...</p>}

      {isError && (
        <p role="alert">
          Could not load issues. Check that your backend is running.
        </p>
      )}

      {!isLoading && !isError && (
        <>
          <section className="status-grid">
            {statuses.map((status) => (
              <article className="status-card" key={status.value}>
                <div className="status-icon">{status.icon}</div>
                <p className="status-title">{status.label}</p>
                <strong
                  className="status-count"
                  style={{ color: status.color }}
                >
                  {countStatus(status.value)}
                </strong>
                <p className="status-description">
                  {status.label} issues
                </p>
              </article>
            ))}
          </section>

          <section className="issues-list-section">
            <h2>Reported Issues</h2>

            {issues.length === 0 ? (
              <p className="empty-issues">
                No issues have been reported yet.
              </p>
            ) : (
              <div className="issues-table-wrapper">
                <table className="issues-table">
                  <thead>
                    <tr>
                      <th>Issue</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue) => (
                      <tr key={issue.id}>
                        <td>
                          <strong>{issue.title || "Untitled issue"}</strong>
                          <p>{issue.description || ""}</p>
                        </td>
                        <td>{issue.category || "Other"}</td>
                        <td>{issue.priority || "Medium"}</td>
                        <td>
                          <span className="issue-status">
                            {issue.status || "Open"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function ReportPage() {
  return (
    <main className="page-container">
      <h1>Report an Issue</h1>
      <p>Report a problem on campus so the team can address it.</p>
      <CreateIssueForm />
    </main>
  );
}

function PulseBoardApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  function handleLogin() {
    setIsLoggedIn(true);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  }

  if (!isLoggedIn) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          
<header className="app-header">
  <div className="header-content">
    <NavLink to="/" className="brand">
      <span className="brand-icon">P</span>
      <span>PulseBoard</span>
    </NavLink>

    <nav className="main-nav">
      <NavLink to="/" end>Dashboard</NavLink>
      <NavLink to="/issues">All Issues</NavLink>
      <NavLink to="/report">Report an Issue</NavLink>
      <NavLink to="/profile">My Profile</NavLink>
      <NavLink to="/about">About Our Team</NavLink>
    </nav>

    <button
      type="button"
      className="logout-button"
      onClick={handleLogout}
    >
      Logout
    </button>
  </div>
</header>

        </div>
      </header>

      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/issues" element={<AllIssuesPage />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>

      <footer className="app-footer">
        <p>PulseBoard — Built by Dev Collab</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <PulseBoardApp />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
