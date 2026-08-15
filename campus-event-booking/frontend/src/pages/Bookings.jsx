import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getUser } from '../lib/api.js';

export default function Bookings() {
  const user = getUser();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) api('/api/bookings/my').then(setBookings).catch((e) => setError(e.message));
  }, []);

  if (!user) {
    return <section className="center-card"><h1>My Bookings</h1><p>Please sign in to view your bookings.</p><Link className="button" to="/login">Sign in</Link></section>;
  }

  return (
    <section>
      <div className="page-heading"><div><span className="eyebrow">Your schedule</span><h1>My Bookings</h1></div></div>
      {error && <p className="alert error">{error}</p>}
      <div className="booking-list">
        {bookings.map((booking) => (
          <article className="booking-row" key={booking.id}>
            <div><span className="badge">{booking.status}</span><h3>{booking.eventTitle}</h3><p>{new Date(booking.eventDate).toLocaleString()} · {booking.location}</p></div>
            <div className="confirmation"><span>Confirmation</span><strong>{booking.confirmationCode || 'Pending'}</strong></div>
          </article>
        ))}
      </div>
      {!error && bookings.length === 0 && <p className="empty">You have no bookings yet. <Link to="/events">Browse events</Link>.</p>}
    </section>
  );
}
