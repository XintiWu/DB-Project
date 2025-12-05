import { pool } from '../db.js';

const verify = async () => {
    try {
        console.log('--- ITEMS Table ---');
        const res = await pool.query('SELECT * FROM "ITEMS" LIMIT 5');
        console.table(res.rows);
        console.log('Total Items:', (await pool.query('SELECT COUNT(*) FROM "ITEMS"')).rows[0].count);
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
};

verify();
