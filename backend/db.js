// backend/db.js
import pkg from 'pg';
import dotenv from 'dotenv';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend folder (default)
dotenv.config();
// Load .env from root folder
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Pool } = pkg;

export const pool = new Pool({
  user: process.env.DB_USER,  // 從環境變數讀取，預設為 postgres
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,  // 從環境變數讀取，預設為空
  port: parseInt(process.env.DB_PORT),
});

