import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let databaseUrl = process.env.DATABASE_URL;

// On Vercel Serverless environment, SQLite database must be copied to writable /tmp
if (process.env.VERCEL) {
  if (!databaseUrl || databaseUrl.startsWith('file:')) {
    const tmpDb = '/tmp/dev.db';
    const possibleSources = [
      path.join(process.cwd(), 'server', 'prisma', 'dev.db'),
      path.join(__dirname, '..', '..', 'prisma', 'dev.db'),
      path.join(process.cwd(), 'prisma', 'dev.db'),
      path.join(process.cwd(), 'dev.db'),
    ];

    if (!fs.existsSync(tmpDb)) {
      for (const src of possibleSources) {
        if (fs.existsSync(src)) {
          try {
            fs.copyFileSync(src, tmpDb);
            console.log(`[VERCEL] Successfully prepared writable SQLite DB at ${tmpDb} from ${src}`);
            break;
          } catch (e) {
            console.warn('[VERCEL] Failed to copy db file:', e.message);
          }
        }
      }
    }

    if (fs.existsSync(tmpDb)) {
      databaseUrl = `file:${tmpDb}`;
      process.env.DATABASE_URL = databaseUrl;
    }
  }
}

const prisma = new PrismaClient({
  datasources: databaseUrl
    ? {
        db: {
          url: databaseUrl,
        },
      }
    : undefined,
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;
