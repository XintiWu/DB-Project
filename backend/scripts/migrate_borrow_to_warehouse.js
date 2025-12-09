
import { pool } from '../db.js';

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Beginning Borrow-to-Warehouse migration...');
    await client.query('BEGIN');

    // 1. Add to_inventory_id to LENDS
    console.log('Adding to_inventory_id to LENDS...');
    await client.query(`ALTER TABLE "LENDS" ADD COLUMN IF NOT EXISTS to_inventory_id bigint`);

    // 2. Update INVENTORY_ITEMS status constraint
    console.log('Updating INVENTORY_ITEMS stats constraints...');
    await client.query(`ALTER TABLE "INVENTORY_ITEMS" DROP CONSTRAINT IF EXISTS "INVENTORY_ITEMS_status_check"`);
    await client.query(`
      ALTER TABLE "INVENTORY_ITEMS" 
      ADD CONSTRAINT "INVENTORY_ITEMS_status_check" 
      CHECK (status::text = ANY (ARRAY['Available'::text, 'Lent'::text, 'Unavailable'::text, 'Borrowed'::text]))
    `);

    // 3. Update INVENTORY_ITEMS Unique Constraint / PK
    // We need to allow same item_id in same inventory_id IF status is different (e.g. Available vs Borrowed)
    // First, check current PK/Unique
    // Usually it is (inventory_id, item_id). We need to change it to (inventory_id, item_id, status).
    
    console.log('Updating INVENTORY_ITEMS Primary Key...');
    // Drop existing PK if it exists (assuming standard naming or inferred)
    // Note: If there was no explicit PK name, we might need to query it, but let's try dropping by columns if possible or standard name.
    // PostgreSQL doesn't support DROP PRIMARY KEY without name comfortably in one line if name unknown. 
    // Let's assume standard "INVENTORY_ITEMS_pkey" or try to drop constraint by name if we can guess it.
    
    // Attempt to drop PK "INVENTORY_ITEMS_pkey"
    try {
        await client.query(`ALTER TABLE "INVENTORY_ITEMS" DROP CONSTRAINT IF EXISTS "INVENTORY_ITEMS_pkey"`);
    } catch (e) {
        console.log('Could not drop PK by name, ignoring...');
    }
    
    // Also drop any simple unique constraint on (inventory_id, item_id) if it exists separate from PK
    // ...

    // Now adding new PK (inventory_id, item_id, status)
    // Note: 'status' is nullable in schema? If so, it cannot be part of PK.
    // Let's check schema.sql... "status character varying(20)". It is NOT MDARKED NOT NULL in the dump I saw earlier? 
    // Wait, in Step 1133 schema dump: "status character varying(20)" - NO "NOT NULL".
    // PK columns MUST be NOT NULL.
    // So we must first set it to NOT NULL. Since we migrated 'Active' -> 'Available', all rows should have data.
    
    console.log('Setting INVENTORY_ITEMS.status to NOT NULL...');
    await client.query(`UPDATE "INVENTORY_ITEMS" SET status = 'Available' WHERE status IS NULL`);
    await client.query(`ALTER TABLE "INVENTORY_ITEMS" ALTER COLUMN status SET NOT NULL`);

    console.log('Creating new Primary Key...');
    await client.query(`
        ALTER TABLE "INVENTORY_ITEMS"
        ADD CONSTRAINT "INVENTORY_ITEMS_pkey" PRIMARY KEY (inventory_id, item_id, status)
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
