import { pool } from './db.js';

const createTable = async () => {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS "SEARCH_LOGS" (
        log_id SERIAL PRIMARY KEY,
        search_data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await pool.query(sql);
    console.log('✅ SEARCH_LOGS table created successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error creating table:', err);
    process.exit(1);
  }
};

createTable();
