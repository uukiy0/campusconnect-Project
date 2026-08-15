import { useEffect, useMemo, useState } from 'react';
import EventCard from '../components/EventCard.jsx';
import { api } from '../lib/api.js';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api('/api/events').then(setEvents).catch((e) => setError(e.message));
  }, []);

  const filtered = useMemo(() => events.filter((event) =>
    `${event.title} ${event.category} ${event.location}`.toLowerCase().includes(query.toLowerCase())
  ), [events, query]);

  return (
    <section>
      <div className="page-heading">
        <div><span className="eyebrow">Explore</span><h1>Upcoming events</h1></div>
        <input className="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events" />
      </div>
      {error && <p className="alert error">{error}</p>}
      <div className="card-grid">
        {filtered.map((event) => <EventCard key={event.id} event={event} />)}
      </div>
      {!error && filtered.length === 0 && <p className="empty">No matching events found.</p>}
    </section>
  );
}
