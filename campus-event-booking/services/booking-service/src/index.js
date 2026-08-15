import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { createBooking, listBookingsForUser, updateConfirmation } from './store.js';

const app = express();
const port = Number(process.env.PORT || 4003);
const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';
const eventServiceUrl = process.env.EVENT_SERVICE_URL || 'http://localhost:4002';
const confirmationFunctionUrl = process.env.CONFIRMATION_FUNCTION_URL || '';

app.use(cors());
app.use(express.json());

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Authentication required.' });
  try {
    req.user = jwt.verify(token, jwtSecret);
    req.token = token;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

async function createConfirmation(booking) {
  if (!confirmationFunctionUrl) {
    return `LOCAL-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  }
  const response = await fetch(confirmationFunctionUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      bookingId: booking.id,
      eventTitle: booking.eventTitle,
      userEmail: booking.userEmail
    })
  });
  if (!response.ok) throw new Error(`Confirmation function returned ${response.status}`);
  const data = await response.json();
  return data.confirmationCode;
}

app.get('/health', (_req, res) => res.json({ service: 'booking-service', status: 'ok' }));

app.get('/api/bookings/my', requireAuth, async (req, res) => {
  try {
    res.json(await listBookingsForUser(req.user.id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not load bookings.' });
  }
});

app.post('/api/bookings', requireAuth, async (req, res) => {
  try {
    const eventId = String(req.body.eventId || '');
    if (!eventId) return res.status(400).json({ message: 'eventId is required.' });

    const eventResponse = await fetch(`${eventServiceUrl}/api/events/${encodeURIComponent(eventId)}`);
    if (eventResponse.status === 404) return res.status(404).json({ message: 'Event not found.' });
    if (!eventResponse.ok) throw new Error('Event service unavailable.');
    const event = await eventResponse.json();

    let booking = await createBooking({ user: req.user, event });
    try {
      const confirmationCode = await createConfirmation(booking);
      booking = await updateConfirmation(booking, confirmationCode);
    } catch (error) {
      console.error('Serverless confirmation failed:', error.message);
      booking = await updateConfirmation(booking, 'PENDING');
    }

    res.status(201).json(booking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not create booking.' });
  }
});

app.listen(port, () => console.log(`Booking service listening on ${port}`));
