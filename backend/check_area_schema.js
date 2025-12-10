
import { pool } from './db.js';

async function checkAreaSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'AREA';
    `);
    console.log('Columns in AREA table:');
    res.rows.forEach(row => {
      console.log(`- ${row.column_name} (${row.data_type})`);
    });
    
    // Also check if there's any data
    const dataRes = await pool.query('SELECT * FROM "AREA" LIMIT 5');
    console.log('Sample AREA data:', dataRes.rows);
    
  } catch (err) {
    console.error('Error checking AREA schema:', err);
  } finally {
    pool.end();
  }
}

checkAreaSchema();
