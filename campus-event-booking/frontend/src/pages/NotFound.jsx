import { Link } from 'react-router-dom';
export default function NotFound() {
  return <section className="center-card"><h1>Page not found</h1><p>The page you requested does not exist.</p><Link className="button" to="/">Go home</Link></section>;
}
