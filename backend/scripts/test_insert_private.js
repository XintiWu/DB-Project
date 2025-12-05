
import { pool } from '../db.js';

async function testInsert() {
  const client = await pool.connect();
  try {
    console.log('Testing direct insert of Private inventory...');
    const sql = `
      INSERT INTO "INVENTORIES" (address, name, status)
      VALUES ($1, $2, 'Private')
      RETURNING *;
    `;
    const res = await client.query(sql, ['Test Address', 'Test Private DB Insert']);
    console.log('Insert successful:', res.rows[0]);
    
    // Clean up
    await client.query('DELETE FROM "INVENTORIES" WHERE inventory_id = $1', [res.rows[0].inventory_id]);

  } catch (err) {
    console.error('Insert failed:', err);
  } finally {
    client.release();
    pool.end();
  }
}

testInsert();
