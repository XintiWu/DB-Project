// MongoDB 連接配置
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.MONGODB_DB_NAME || 'disaster_platform_analytics';

let client = null;
let db = null;

export async function connectMongoDB() {
  try {
    if (!client) {
      client = new MongoClient(MONGODB_URI);
      await client.connect();
      db = client.db(DB_NAME);
      console.log('✅ MongoDB 連接成功');
    }
    return db;
  } catch (error) {
    console.error('❌ MongoDB 連接失敗:', error);
    throw error;
  }
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

