import { BlobServiceClient } from '@azure/storage-blob';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER || 'event-images';
const uploadsDir = path.resolve('uploads');
let containerClient;

async function getContainerClient() {
  if (!connectionString) return null;
  if (containerClient) return containerClient;
  const service = BlobServiceClient.fromConnectionString(connectionString);
  containerClient = service.getContainerClient(containerName);
  await containerClient.createIfNotExists();
  return containerClient;
}

export async function saveImage(file) {
  if (!file) return '';
  const ext = path.extname(file.originalname || '').toLowerCase().replace(/[^.a-z0-9]/g, '') || '.jpg';
  const name = `${crypto.randomUUID()}${ext}`;
  const cloud = await getContainerClient();
  if (cloud) {
    const blob = cloud.getBlockBlobClient(name);
    await blob.uploadData(file.buffer, {
      blobHTTPHeaders: { blobContentType: file.mimetype || 'application/octet-stream' }
    });
    return name;
  }

  await fs.mkdir(uploadsDir, { recursive: true });
  await fs.writeFile(path.join(uploadsDir, name), file.buffer);
  return name;
}

export async function readImage(name) {
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) return null;
  const cloud = await getContainerClient();
  if (cloud) {
    const blob = cloud.getBlobClient(name);
    try {
      const download = await blob.download();
      const chunks = [];
      for await (const chunk of download.readableStreamBody) chunks.push(chunk);
      return { buffer: Buffer.concat(chunks), contentType: download.contentType || 'application/octet-stream' };
    } catch (error) {
      if (error.statusCode === 404) return null;
      throw error;
    }
  }

  try {
    const filePath = path.join(uploadsDir, name);
    const buffer = await fs.readFile(filePath);
    const ext = path.extname(name).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
    return { buffer, contentType };
  } catch {
    return null;
  }
}
