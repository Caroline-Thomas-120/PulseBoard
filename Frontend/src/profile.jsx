
import { useState } from "react";
import "./Profile.css";

const emptyProfile = {
  fullName: "",
  email: "",
  studentId: "",
  department: "",
  year: "2nd Year",
  bio: "",
};

export default function Profile() {
  const [profile, setProfile] = useState(() => {
    try {
      return {
        ...emptyProfile,
        ...JSON.parse(localStorage.getItem("pulseboard_profile") || "{}"),
      };
    } catch {
      return emptyProfile;
    }
  });

  const [message, setMessage] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    localStorage.setItem("pulseboard_profile", JSON.stringify(profile));
    setMessage("Profile saved successfully!");
  }

  const initials = profile.fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");

  return (
    <main className="profile-page">
      <section className="profile-heading">
        <p className="profile-eyebrow">YOUR ACCOUNT</p>
        <h1>Profile Setup</h1>
        <p>Manage your personal information on PulseBoard.</p>
      </section>

      <section className="profile-card">
        <div className="profile-banner">
          <div className="profile-avatar">
            {initials || "?"}
          </div>

          <div>
            <h2>{profile.fullName || "Your Name"}</h2>
            <p>{profile.department || "Your Department"}</p>
            <span className="profile-badge">
              {profile.year} Student
            </span>
          </div>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <h3>Personal Information</h3>

          <div className="profile-fields">
            <label>
              Full Name
              <input
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </label>

            <label>
              Email Address
              <input
                name="email"
                type="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              Student ID
              <input
                name="studentId"
                value={profile.studentId}
                onChange={handleChange}
                placeholder="Enter your student ID"
              />
            </label>

            <label>
              Department
              <select
                name="department"
                value={profile.department}
                onChange={handleChange}
                required
              >
                <option value="">Select department</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">
                  Information Technology
                </option>
                <option value="Electronics">Electronics</option>
                <option value="Mechanical">Mechanical</option>
                <option value="Civil">Civil</option>
                <option value="Other">Other</option>
              </select>
            </label>

            <label>
              Year of Study
              <select
                name="year"
                value={profile.year}
                onChange={handleChange}
              >
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </label>

            <label className="profile-bio-field">
              About Me
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Tell us a little about yourself..."
                rows={4}
              />
            </label>
          </div>

          {message && (
            <p className="profile-success" role="status">
              {message}
            </p>
          )}

          <div className="profile-actions">
            <button type="submit" className="profile-save">
              Save Profile
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
