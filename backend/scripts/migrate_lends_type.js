
import { pool } from '../db.js';

async function migrate() {
  try {
    console.log('Migrating LENDS table...');
    
    // Add type column if not exists
    const sql = `
      DO $$
      BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='LENDS' AND column_name='type') THEN
              ALTER TABLE "LENDS" ADD COLUMN "type" VARCHAR(20) DEFAULT 'BORROW' NOT NULL;
              ALTER TABLE "LENDS" ADD CONSTRAINT "LENDS_type_check" CHECK (type IN ('BORROW', 'LEND'));
          END IF;
      END
      $$;
    `;
    
    await pool.query(sql);
    console.log('LENDS table migrated successfully.');
    
  } catch (err) {
    console.error('Error migrating LENDS table:', err);
  } finally {
    await pool.end();
  }
}

migrate();
