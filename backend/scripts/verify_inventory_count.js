import { pool } from '../db.js';

const verify = async () => {
    try {
        const userId = 102;
        console.log('Testing with User ID:', userId);

        const sql = `
            SELECT io.*, i.address, i.name, i.updated_at,
            (SELECT COUNT(*) FROM "INVENTORY_ITEMS" ii WHERE ii.inventory_id = i.inventory_id)::int as item_count
            FROM "INVENTORY_OWNERS" io
            JOIN "INVENTORIES" i ON io.inventory_id = i.inventory_id
            WHERE io.user_id = $1
        `;
        const resQuery = await pool.query(sql, [userId]);
        console.log('Query Result:', resQuery.rows);

    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
};

verify();
