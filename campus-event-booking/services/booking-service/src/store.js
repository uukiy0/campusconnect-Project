import { CosmosClient } from '@azure/cosmos';
import crypto from 'crypto';

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE || 'campusbooking';
const containerId = 'bookings';
let container;
const memory = new Map();

async function getContainer() {
  if (!endpoint || !key) return null;
  if (container) return container;
  const client = new CosmosClient({ endpoint, key });
  const { database } = await client.databases.createIfNotExists({ id: databaseId });
  const result = await database.containers.createIfNotExists({
    id: containerId,
    partitionKey: { paths: ['/partitionKey'] }
  });
  container = result.container;
  return container;
}

export async function createBooking({ user, event }) {
  const booking = {
    id: crypto.randomUUID(),
    partitionKey: user.id,
    type: 'booking',
    userId: user.id,
    userEmail: user.email,
    eventId: event.id,
    eventTitle: event.title,
    eventDate: event.eventDate,
    location: event.location,
    status: 'confirmed',
    confirmationCode: '',
    createdAt: new Date().toISOString()
  };
  const db = await getContainer();
  if (!db) {
    memory.set(booking.id, booking);
    return booking;
  }
  const { resource } = await db.items.create(booking);
  return resource;
}

export async function updateConfirmation(booking, confirmationCode) {
  booking.confirmationCode = confirmationCode;
  const db = await getContainer();
  if (!db) {
    memory.set(booking.id, booking);
    return booking;
  }
  const { resource } = await db.item(booking.id, booking.partitionKey).replace(booking);
  return resource;
}

export async function listBookingsForUser(userId) {
  const db = await getContainer();
  if (!db) {
    return [...memory.values()]
      .filter((b) => b.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
  const query = {
    query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC',
    parameters: [{ name: '@userId', value: userId }]
  };
  const { resources } = await db.items.query(query).fetchAll();
  return resources;
}
