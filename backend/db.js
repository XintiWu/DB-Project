// backend/db.js
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // 載入 .env 檔案

const { Pool } = pkg;

export const pool = new Pool({
  user: process.env.DB_USER || 'postgres',  // 從環境變數讀取，預設為 postgres
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'Final',
  password: process.env.DB_PASSWORD || 'postgresql',  // 從環境變數讀取，預設為空
  port: parseInt(process.env.DB_PORT || '5433'),
});

