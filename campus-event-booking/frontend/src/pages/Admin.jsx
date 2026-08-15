import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getUser } from '../lib/api.js';

const initial = { title: '', category: 'Technology', description: '', location: '', eventDate: '', capacity: 30 };

export default function Admin() {
  const user = getUser();
  const [form, setForm] = useState(initial);
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (!user) return <section className="center-card"><h1>Admin</h1><p>Sign in with the configured admin account to create events.</p><Link className="button" to="/login">Sign in</Link></section>;
  if (user.role !== 'admin') return <section className="center-card"><h1>Admin</h1><p>Your account does not have admin access.</p></section>;

  function update(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function submit(e) {
    e.preventDefault(); setBusy(true); setMessage(''); setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => data.append(key, value));
      if (image) data.append('image', image);
      const created = await api('/api/events', { method: 'POST', body: data });
      setMessage(`Event created: ${created.title}`);
      setForm(initial); setImage(null); e.target.reset();
    } catch (err) {
      setError(err.message);
    } finally { setBusy(false); }
  }

  return (
    <section className="form-page">
      <div><span className="eyebrow">Administration</span><h1>Create an event</h1><p>Event images are stored in Azure Blob Storage in the deployed version.</p></div>
      <form className="form-card" onSubmit={submit}>
        <label>Title<input name="title" required value={form.title} onChange={update} /></label>
        <div className="form-grid">
          <label>Category<select name="category" value={form.category} onChange={update}><option>Technology</option><option>Careers</option><option>Social</option><option>Sports</option><option>Academic</option></select></label>
          <label>Capacity<input name="capacity" type="number" min="1" value={form.capacity} onChange={update} /></label>
        </div>
        <label>Description<textarea name="description" required rows="4" value={form.description} onChange={update} /></label>
        <div className="form-grid">
          <label>Location<input name="location" required value={form.location} onChange={update} /></label>
          <label>Date and time<input name="eventDate" type="datetime-local" required value={form.eventDate} onChange={update} /></label>
        </div>
        <label>Event image<input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} /></label>
        {message && <p className="alert success">{message}</p>}
        {error && <p className="alert error">{error}</p>}
        <button className="button" disabled={busy}>{busy ? 'Creating…' : 'Create event'}</button>
      </form>
    </section>
  );
}
