import { CosmosClient } from '@azure/cosmos';
import crypto from 'crypto';

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE || 'campusbooking';
const containerId = 'events';
let container;

const memory = new Map([
  ['sample-1', {
    id: 'sample-1', partitionKey: 'event', type: 'event',
    title: 'Cloud Computing Workshop', category: 'Technology',
    description: 'A practical student workshop covering cloud services, containers and deployment.',
    location: 'Innovation Lab', eventDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    capacity: 40, imageName: '', createdAt: new Date().toISOString()
  }],
  ['sample-2', {
    id: 'sample-2', partitionKey: 'event', type: 'event',
    title: 'Campus Music Night', category: 'Social',
    description: 'An evening of student performances, music and networking on campus.',
    location: 'Student Union Hall', eventDate: new Date(Date.now() + 12 * 86400000).toISOString(),
    capacity: 120, imageName: '', createdAt: new Date().toISOString()
  }]
]);

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

export async function listEvents() {
  const db = await getContainer();
  if (!db) return [...memory.values()].sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
  const query = 'SELECT * FROM c WHERE c.type = "event" ORDER BY c.eventDate ASC';
  const { resources } = await db.items.query(query).fetchAll();
  return resources;
}

export async function getEvent(id) {
  const db = await getContainer();
  if (!db) return memory.get(id) || null;
  try {
    const { resource } = await db.item(id, 'event').read();
    return resource || null;
  } catch (error) {
    if (error.code === 404) return null;
    throw error;
  }
}

export async function createEvent(data) {
  const event = {
    id: crypto.randomUUID(),
    partitionKey: 'event',
    type: 'event',
    title: data.title,
    category: data.category || 'General',
    description: data.description,
    location: data.location,
    eventDate: data.eventDate,
    capacity: Number(data.capacity || 1),
    imageName: data.imageName || '',
    createdAt: new Date().toISOString()
  };
  const db = await getContainer();
  if (!db) {
    memory.set(event.id, event);
    return event;
  }
  const { resource } = await db.items.create(event);
  return resource;
}
