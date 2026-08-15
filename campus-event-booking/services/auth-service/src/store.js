import { CosmosClient } from '@azure/cosmos';
import crypto from 'crypto';

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const databaseId = process.env.COSMOS_DATABASE || 'campusbooking';
const containerId = 'users';

const memory = new Map();
let container;

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

export async function findUserByEmail(email) {
  const db = await getContainer();
  if (!db) {
    return [...memory.values()].find((u) => u.email === email) || null;
  }
  const query = {
    query: 'SELECT TOP 1 * FROM c WHERE c.email = @email',
    parameters: [{ name: '@email', value: email }]
  };
  const { resources } = await db.items.query(query).fetchAll();
  return resources[0] || null;
}

export async function findUserById(id) {
  const db = await getContainer();
  if (!db) return memory.get(id) || null;
  try {
    const { resource } = await db.item(id, 'user').read();
    return resource || null;
  } catch (error) {
    if (error.code === 404) return null;
    throw error;
  }
}

export async function createUser({ name, email, passwordHash, role }) {
  const user = {
    id: crypto.randomUUID(),
    partitionKey: 'user',
    type: 'user',
    name,
    email,
    passwordHash,
    role,
    createdAt: new Date().toISOString()
  };
  const db = await getContainer();
  if (!db) {
    memory.set(user.id, user);
    return user;
  }
  const { resource } = await db.items.create(user);
  return resource;
}
