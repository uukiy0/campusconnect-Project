import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api, getUser } from '../lib/api.js';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/api/events/${id}`).then(setEvent).catch((e) => setError(e.message));
  }, [id]);

  async function book() {
    if (!getUser()) return navigate('/login');
    setBusy(true); setMessage(''); setError('');
    try {
      const booking = await api('/api/bookings', {
        method: 'POST',
        body: JSON.stringify({ eventId: id })
      });
      setMessage(`Booked successfully. Confirmation: ${booking.confirmationCode}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (error && !event) return <p className="alert error">{error}</p>;
  if (!event) return <p>Loading event…</p>;

  return (
    <section className="details-layout">
      <div>
        {event.imageUrl ? <img className="details-image" src={event.imageUrl} alt={event.title} /> : <div className="details-image placeholder">CampusConnect</div>}
      </div>
      <div className="details-copy">
        <span className="badge">{event.category}</span>
        <h1>{event.title}</h1>
        <p className="lead">{event.description}</p>
        <dl className="details-list">
          <div><dt>Date</dt><dd>{new Date(event.eventDate).toLocaleString()}</dd></div>
          <div><dt>Location</dt><dd>{event.location}</dd></div>
          <div><dt>Capacity</dt><dd>{event.capacity} attendees</dd></div>
        </dl>
        {message && <p className="alert success">{message}</p>}
        {error && <p className="alert error">{error}</p>}
        <div className="actions">
          <button className="button" disabled={busy} onClick={book}>{busy ? 'Booking…' : 'Book this event'}</button>
          <Link className="button secondary" to="/events">Back to events</Link>
        </div>
      </div>
    </section>
  );
}
