import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'jakehu',
  host: 'localhost',
  database: 'disaster_platform', 
  password: 'password', 
  port: 5432,
});

async function migrate() {
  try {
    console.log('Starting migration...');

    // 1. Update existing data
    console.log('Updating "Available" items to "Owned"...');
    await pool.query(`UPDATE "INVENTORY_ITEMS" SET status = 'Owned' WHERE status = 'Available'`);

    // 2. Drop old constraint
    console.log('Dropping old constraint...');
    await pool.query(`ALTER TABLE "INVENTORY_ITEMS" DROP CONSTRAINT IF EXISTS "INVENTORY_ITEMS_status_check"`);

    // 3. Add new constraint
    console.log('Adding new constraint...');
    await pool.query(`
      ALTER TABLE "INVENTORY_ITEMS" 
      ADD CONSTRAINT "INVENTORY_ITEMS_status_check" 
      CHECK (status IN ('Owned', 'Lent', 'Unavailable', 'Borrowed'))
    `);

    console.log('Migration successful!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
