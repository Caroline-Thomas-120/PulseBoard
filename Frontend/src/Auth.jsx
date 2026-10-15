
import { useState } from "react";
import { loginUser, registerUser } from "./auth/auth";

export default function Auth({ onLogin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
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

      onLogin();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Authentication failed. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-card">
      <p className="eyebrow">CAMPUS COMMUNITY</p>

      <h2>{isRegistering ? "Create your account" : "Welcome back"}</h2>

      <p>
        {isRegistering
          ? "Join PulseBoard to report campus issues."
          : "Log in to report and track campus issues."}
      </p>

      <form onSubmit={handleSubmit}>
        {isRegistering && (
          <>
            <label htmlFor="auth-name">Full name</label>
            <input
              id="auth-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter your name"
              required
            />
          </>
        )}

        <label htmlFor="auth-email">Email</label>
        <input
          id="auth-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="student@example.com"
          required
        />

        <label htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          minLength={8}
          required
        />

        {error && <p className="auth-error" role="alert">{error}</p>}
        {message && <p role="status">{message}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Please wait..."
            : isRegistering
              ? "Register and log in"
              : "Log in"}
        </button>
      </form>

      <p className="auth-switch">
        {isRegistering ? "Already have an account?" : "New to PulseBoard?"}{" "}
        <button
          type="button"
          className="text-button"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError("");
            setMessage("");
          }}
        >
          {isRegistering ? "Log in" : "Create account"}
        </button>
      </p>
    </section>
  );
}
