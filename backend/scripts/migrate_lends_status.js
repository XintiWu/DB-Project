import { pool } from '../db.js';

const migrate = async () => {
    const client = await pool.connect();
    try {
        console.log('Migrating LENDS table: Adding status column...');
        
        // Add status column if not exists
        await client.query(`
            ALTER TABLE "LENDS" 
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Active' NOT NULL;
        `);

        // Add check constraint
        await client.query(`
            ALTER TABLE "LENDS" 
            DROP CONSTRAINT IF EXISTS "LENDS_status_check";
        `);
        
        await client.query(`
            ALTER TABLE "LENDS" 
            ADD CONSTRAINT "LENDS_status_check" 
            CHECK (status IN ('Active', 'Pending', 'Rejected', 'Returned'));
        `);

        console.log('Migration successful!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
};

migrate();
