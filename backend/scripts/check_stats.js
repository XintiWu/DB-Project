
import { pool } from '../db.js';

const checkStats = async () => {
  try {
    console.log('--- Database Stats Check ---');

    // 1. Total Count
    const countRes = await pool.query('SELECT COUNT(*) FROM "FINANCIALS"');
    console.log(`Total Records: ${countRes.rows[0].count}`);

    // 2. Aggregate Stats
    const statsRes = await pool.query(`
      SELECT 
        COUNT(*) as count,
        SUM(amount::numeric) as total_sum,
        AVG(amount::numeric) as average,
        MIN(amount::numeric) as min_val,
        MAX(amount::numeric) as max_val
      FROM "FINANCIALS"
    `);
    console.log('Overall Stats:', statsRes.rows[0]);

    // 3. Last Year Stats (Actual Logic used in App)
    const yearStatsRes = await pool.query(`
      SELECT 
        COUNT(*) as count,
        SUM(amount::numeric) as total_sum
      FROM "FINANCIALS"
      WHERE created_at >= NOW() - INTERVAL '1 year'
    `);
    console.log('Last Year Stats:', yearStatsRes.rows[0]);
    
    // 4. Check for anomalies (Huge values)
    const hugeRes = await pool.query(`
        SELECT count(*) FROM "FINANCIALS" WHERE amount::numeric > 1000000
    `);
    console.log('Records > 1,000,000:', hugeRes.rows[0].count);

  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
};

checkStats();
