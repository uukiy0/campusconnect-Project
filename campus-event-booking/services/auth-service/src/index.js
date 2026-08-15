import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, findUserById } from './store.js';

const app = express();
const port = Number(process.env.PORT || 4001);
const jwtSecret = process.env.JWT_SECRET || 'dev-secret-change-me';
const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();

app.use(cors());
app.use(express.json());

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function sign(user) {
  return jwt.sign(publicUser(user), jwtSecret, { expiresIn: '8h' });
}

function requireAuth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ message: 'Authentication required.' });
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

app.get('/health', (_req, res) => res.json({ service: 'auth-service', status: 'ok' }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');

    if (!name || !email || password.length < 6) {
      return res.status(400).json({ message: 'Name, valid email and a password of at least 6 characters are required.' });
    }
    if (await findUserByEmail(email)) {
      return res.status(409).json({ message: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const role = email === adminEmail ? 'admin' : 'user';
    const user = await createUser({ name, email, passwordHash, role });
    res.status(201).json({ token: sign(user), user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not register user.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Incorrect email or password.' });
    }
    res.json({ token: sign(user), user: publicUser(user) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not sign in.' });
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  res.json(publicUser(user));
});

app.listen(port, () => console.log(`Auth service listening on ${port}`));
