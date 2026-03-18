import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from 'http';
import { app } from '../dist/index.js';

export default async (req: VercelRequest, res: VercelResponse) => {
  const server = createServer(app);
  return new Promise((resolve) => {
    server.emit('request', req, res);
    res.on('finish', resolve);
  });
};
