import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, saveSession } from '../lib/api.js';

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function update(e) { setForm({ ...form, [e.target.name]: e.target.value }); }

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const path = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login' ? { email: form.email, password: form.password } : form;
      const data = await api(path, { method: 'POST', body: JSON.stringify(body) });
      saveSession(data);
      navigate(data.user.role === 'admin' ? '/admin' : '/events');
      window.location.reload();
    } catch (e2) { setError(e2.message); }
    finally { setBusy(false); }
  }

  return (
    <section className="auth-layout">
      <div className="auth-copy"><span className="eyebrow">Welcome</span><h1>{mode === 'login' ? 'Sign in to CampusConnect' : 'Create your account'}</h1><p>Book campus activities and keep your schedule in one place.</p></div>
      <form className="form-card auth-card" onSubmit={submit}>
        <div className="tabs"><button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Login</button><button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Register</button></div>
        {mode === 'register' && <label>Name<input name="name" required value={form.name} onChange={update} /></label>}
        <label>Email<input name="email" type="email" required value={form.email} onChange={update} /></label>
        <label>Password<input name="password" type="password" minLength="6" required value={form.password} onChange={update} /></label>
        {error && <p className="alert error">{error}</p>}
        <button className="button" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
    </section>
  );
}
