
import { pool } from '../db.js';

const main = async () => {
    try {
        console.log('🧹 Running VACUUM ANALYZE on FINANCIALS...');
        await pool.query('VACUUM ANALYZE "FINANCIALS"');
        console.log('✅ Optimization complete.');
    } catch (error) {
        console.error('❌ Error optimizing table:', error);
    } finally {
        await pool.end();
    }
};

main();
