import { Link } from 'react-router-dom';

export default function EventCard({ event }) {
  const date = new Date(event.eventDate);
  return (
    <article className="event-card">
      {event.imageUrl ? (
        <img className="event-image" src={event.imageUrl} alt={event.title} />
      ) : (
        <div className="event-image placeholder" aria-label="Event image placeholder">CC</div>
      )}
      <div className="event-card-body">
        <span className="badge">{event.category}</span>
        <h3>{event.title}</h3>
        <p className="muted">{date.toLocaleString()}</p>
        <p>{event.location}</p>
        <Link className="button small" to={`/events/${event.id}`}>View details</Link>
      </div>
    </article>
  );
}
