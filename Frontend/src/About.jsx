
import "./About.css";

export default function About() {
  const members = [
    { initials: "CT", name: "Caroline Thomas" },
    { initials: "VS", name: "Vygha Sreekaram" },
    { initials: "CHLVL", name: "C H Lakshmi Venkata Lohitha" },
  ];

  return (
    <main className="about-page">
      <section className="about-heading">
        <p className="about-label">MEET THE TEAM</p>
        <h1>About Dev Collab</h1>
        <p>
          We are the team behind PulseBoard, working together to make
          campus issue reporting easier.
        </p>
      </section>

      <section className="team-grid">
        {members.map((member) => (
          <article className="team-card" key={member.initials}>
            <div className="member-avatar">{member.initials}</div>
            <h2>{member.name}</h2>
            <p>PulseBoard Team Member</p>
          </article>
        ))}
      </section>
    </main>
  );
}
