import { pool } from "./db.js";

async function checkSchema() {
  try {
    const res = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'INCIDENTS';
    `);
    console.log("Columns in INCIDENTS table:");
    res.rows.forEach((row) => {
      console.log(`- ${row.column_name} (${row.data_type})`);
    });
  } catch (err) {
    console.error("Error checking schema:", err);
  } finally {
    pool.end();
  }
}

checkSchema();
