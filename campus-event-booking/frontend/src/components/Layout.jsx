import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearSession, getUser } from '../lib/api.js';

export default function Layout() {
  const navigate = useNavigate();
  const user = getUser();

  function logout() {
    clearSession();
    navigate('/');
    window.location.reload();
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink className="brand" to="/">CampusConnect</NavLink>
        <nav className="main-nav" aria-label="Primary navigation">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/events">Events</NavLink>
          <NavLink to="/bookings">My Bookings</NavLink>
          <NavLink to="/admin">Admin</NavLink>
          {!user ? <NavLink to="/login">Login</NavLink> : <button className="link-button" onClick={logout}>Logout</button>}
        </nav>
      </header>
      <main className="page-wrap"><Outlet /></main>
      <footer className="footer">CampusConnect · Cloud Computing Microservices Project</footer>
    </div>
  );
}
