
import { pool } from '../db.js';

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Beginning INVENTORY_ITEMS migration...');
    await client.query('BEGIN');

    // 1. UPDATE EXISTING DATA: 'Active' -> 'Available'
    console.log('Migrating existing items (Active -> Available)...');
    await client.query(`UPDATE "INVENTORY_ITEMS" SET status = 'Available' WHERE status = 'Active'`);

    // 2. DROP OLD CONSTRAINT (if exists, though usually it's unnamed or auto-named, we might need to find it or just let the new one be added if there wasn't one)
    // Checking schema.sql, there doesn't seem to be a specific named constraint for INVENTORY_ITEMS status in the previous dump, 
    // but if there is one, we should drop it. 
    // Based on user request history, there might not be a CHECK constraint yet, or it might be implicit.
    // We will drop a potential constraint if we can guess the name, otherwise we just add the new one.
    // Let's try to drop common names just in case.
    await client.query(`ALTER TABLE "INVENTORY_ITEMS" DROP CONSTRAINT IF EXISTS "inventory_items_status_check"`); // Postgres usually lowercases
    await client.query(`ALTER TABLE "INVENTORY_ITEMS" DROP CONSTRAINT IF EXISTS "INVENTORY_ITEMS_status_check"`);

    // 3. ADD NEW CONSTRAINT
    console.log('Adding new status constraint...');
    await client.query(`
      ALTER TABLE "INVENTORY_ITEMS" 
      ADD CONSTRAINT "INVENTORY_ITEMS_status_check" 
      CHECK (status::text = ANY (ARRAY['Available'::text, 'Lent'::text, 'Unavailable'::text]))
    `);

    await client.query('COMMIT');
    console.log('Migration successful!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

migrate();
