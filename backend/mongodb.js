// MongoDB 連接配置
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder (default)
dotenv.config();
// Load .env from root folder
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'disaster_platform_analytics';

let client = null;
let db = null;
let connectionPromise = null;

export async function connectMongoDB() {
  if (db) return db;
  
  if (connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = (async () => {
    try {
      console.log('Connecting to MongoDB...');
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      db = client.db(DB_NAME);
      console.log('✅ MongoDB 連接成功');
      return db;
    } catch (error) {
      console.error('❌ MongoDB 連接失敗:', error);
      client = null;
      db = null;
      connectionPromise = null; // Reset promise on failure so we can retry
      throw error;
    }
  })();

  return connectionPromise;
}

export async function getMongoDB() {
  if (!db) {
    await connectMongoDB();
  }
  return db;
}

export async function closeMongoDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB 連接已關閉');
  }
}

