import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import Events from './pages/Events.jsx';
import EventDetails from './pages/EventDetails.jsx';
import Bookings from './pages/Bookings.jsx';
import Admin from './pages/Admin.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';
import './styles.css';

const router = createBrowserRouter([{
  path: '/',
  element: <Layout />,
  errorElement: <NotFound />,
  children: [
    { index: true, element: <Home /> },
    { path: 'events', element: <Events /> },
    { path: 'events/:id', element: <EventDetails /> },
    { path: 'bookings', element: <Bookings /> },
    { path: 'admin', element: <Admin /> },
    { path: 'login', element: <Login /> }
  ]
}]);

ReactDOM.createRoot(document.getElementById('root')).render(<React.StrictMode><RouterProvider router={router} /></React.StrictMode>);
