import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { createEvent, getEvent, listEvents } from './store.js';
import { readImage, saveImage } from './imageStore.js';

const app = express();
const port = Number(process.env.PORT || 4002);
const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

app.use(cors());
app.use(express.json());

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Authentication required.' });
  try {
    const user = jwt.verify(token, jwtSecret);
    if (user.role !== 'admin') return res.status(403).json({ message: 'Admin access required.' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

function toPublic(event) {
  return {
    ...event,
    imageUrl: event.imageName ? `/api/events/images/${encodeURIComponent(event.imageName)}` : ''
  };
}

app.get('/health', (_req, res) => res.json({ service: 'event-service', status: 'ok' }));

app.get('/api/events', async (_req, res) => {
  try {
    res.json((await listEvents()).map(toPublic));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not load events.' });
  }
});

app.get('/api/events/images/:name', async (req, res) => {
  try {
    const image = await readImage(req.params.name);
    if (!image) return res.status(404).end();
    res.type(image.contentType).send(image.buffer);
  } catch (error) {
    console.error(error);
    res.status(500).end();
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const event = await getEvent(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json(toPublic(event));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not load event.' });
  }
});

app.post('/api/events', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { title, category, description, location, eventDate, capacity } = req.body;
    if (!title || !description || !location || !eventDate) {
      return res.status(400).json({ message: 'Title, description, location and event date are required.' });
    }
    const imageName = await saveImage(req.file);
    const event = await createEvent({ title, category, description, location, eventDate, capacity, imageName });
    res.status(201).json(toPublic(event));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not create event.' });
  }
});

app.listen(port, () => console.log(`Event service listening on ${port}`));
