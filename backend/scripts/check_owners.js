import { pool } from '../db.js';

async function check() {
    try {
        console.log('Checking ownership for User 102...');
        const res = await pool.query('SELECT * FROM "INVENTORY_OWNERS" WHERE user_id = 102');
        console.log('Owned Inventories:', res.rows);

        console.log('Checking Inventory 51...');
        const res51 = await pool.query('SELECT * FROM "INVENTORIES" WHERE inventory_id = 51');
        console.log('Inventory 51:', res51.rows);

        console.log('Checking Inventory 56...');
        const res56 = await pool.query('SELECT * FROM "INVENTORIES" WHERE inventory_id = 56');
        console.log('Inventory 56:', res56.rows);
        
        console.log('Checking Owners for 51...');
        const owner51 = await pool.query('SELECT * FROM "INVENTORY_OWNERS" WHERE inventory_id = 51');
        console.log('Owners 51:', owner51.rows);

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}

check();
