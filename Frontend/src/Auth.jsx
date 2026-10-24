
import { useState } from "react";
import { loginUser, registerUser } from "./auth/auth";

export default function Auth({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      if (isRegistering) {
        await registerUser({ name, email, password });
      }

      const result = await loginUser({ email, password });

      if (!result.token) {
        throw new Error("The server did not return a login token.");
      }

      localStorage.setItem("token", result.token);
   const savedUser = {
  ...(result.user || {}),
  name: result.user?.name || name || "",
  email: result.user?.email || email,
};

localStorage.setItem("pulseboard_user", JSON.stringify(savedUser));
onLogin();
    } catch (err) {
      if (!err.response) {
        setError(
          "We couldn't connect to PulseBoard. Check that the server is running and try again."
        );
      } else {
        setError(
          err.response.data?.message ||
            "We couldn't log you in. Check your details and try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering((current) => !current);
    setError("");
    setName("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
  };

  return (
    <main className="auth-layout">
      <aside className="auth-visual">
        <div className="auth-brand">
          <span className="brand-mark" aria-hidden="true">
            P
          </span>
          <span>PulseBoard</span>
        </div>

        <div className="auth-visual-content">
          <span className="visual-label">YOUR CAMPUS. YOUR VOICE.</span>

          <h1>
            Make your
            <br />
            campus <span>better.</span>
          </h1>

          <p>
            Report problems, follow progress, and help make your
            campus a better place for everyone.
          </p>

          <div className="visual-note">
            <span className="note-icon" aria-hidden="true">
              ✓
            </span>
            <span>Every report can make a difference.</span>
          </div>
        </div>

        <p className="auth-visual-footer">
          A better campus starts with you.
        </p>
      </aside>

      <section className="auth-panel">
        <div className="auth-card">
          <p className="eyebrow">CAMPUS COMMUNITY</p>

          <h2>
            {isRegistering ? "Create your account" : "Welcome back"}
          </h2>

          <p className="auth-description">
            {isRegistering
              ? "Join your campus community and report issues."
              : "Log in to report and track campus issues."}
          </p>

          <form onSubmit={handleSubmit}>
            {isRegistering && (
              <div className="auth-field">
                <label htmlFor="auth-name">Full name</label>
                <input
                  id="auth-name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div className="auth-field">
              <label htmlFor="auth-email">Email address</label>
              <input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@campus.edu"
                required
              />
            </div>

            <div className="auth-field">
              <label htmlFor="auth-password">Password</label>

              <div className="password-wrapper">
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    isRegistering ? "new-password" : "current-password"
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  minLength={8}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {error && (
              <p className="auth-error" role="alert">
                {error}
              </p>
            )}

            <button
              className="auth-submit"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Please wait..."
                : isRegistering
                  ? "Create account"
                  : "Log in"}
              {!isSubmitting && <span aria-hidden="true">→</span>}
            </button>
          </form>

          <p className="auth-switch">
            {isRegistering
              ? "Already have an account?"
              : "New to PulseBoard?"}{" "}
            <button
              type="button"
              className="text-button"
              onClick={toggleMode}
            >
              {isRegistering ? "Log in" : "Create account"}
            </button>
          </p>

          <p className="auth-privacy">
            Your campus community, connected.
          </p>
        </div>
      </section>
    </main>
  );
}
