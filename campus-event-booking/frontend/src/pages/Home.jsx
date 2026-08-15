import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <span className="eyebrow">Student life, made simple</span>
          <h1>Discover and book campus events in one place.</h1>
          <p>CampusConnect helps students find workshops, societies, networking events and social activities across campus.</p>
          <div className="actions">
            <Link className="button" to="/events">Browse events</Link>
            <Link className="button secondary" to="/login">Create account</Link>
          </div>
        </div>
        <div className="hero-panel">
          <strong>Built for community</strong>
          <p>using: React · REST APIs · Microservices · Docker · Container apps · Azure</p>
        </div>
      </section>

      <section className="feature-grid">
        <article><h3>Find events</h3><p>Browse upcoming academic, social and careers activities.</p></article>
        <article><h3>Book instantly</h3><p>Reserve a place and receive a serverless confirmation code.</p></article>
        <article><h3>Manage bookings</h3><p>See your personal event schedule from any device.</p></article>
      </section>
    </>
  );
}
