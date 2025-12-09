
import { pool } from '../db.js';

async function checkArea() {
  try {
    const res = await pool.query('SELECT * FROM "AREA" LIMIT 10');
    console.log(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkArea();
