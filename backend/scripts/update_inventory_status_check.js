
import { pool } from '../db.js';

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Beginning migration...');
    await client.query('BEGIN');

    // 1. Drop existing constraints (handle both likely names)
    // Note: If data exists that violates the new constraint (e.g. 'Active'), we might need to update it first.
    // 'Active' is NOT in ['Public', 'Private', 'Inactive'].
    // We should migrate 'Active' -> 'Public' (or Private?) before applying new constraint.
    // Let's assume 'Active' -> 'Public' for backwards compatibility/visibility.

    console.log('Migrating existing data (Active -> Public)...');
    await client.query(`UPDATE "INVENTORIES" SET status = 'Public' WHERE status = 'Active'`);

    console.log('Dropping old constraints...');
    await client.query(`ALTER TABLE "INVENTORIES" DROP CONSTRAINT IF EXISTS "status_check"`);
    await client.query(`ALTER TABLE "INVENTORIES" DROP CONSTRAINT IF EXISTS "INVENTORIES_status_check"`);

    console.log('Adding new constraint...');
    await client.query(`
      ALTER TABLE "INVENTORIES" 
      ADD CONSTRAINT "INVENTORIES_status_check" 
      CHECK (status::text = ANY (ARRAY['Public'::text, 'Private'::text, 'Inactive'::text]))
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
