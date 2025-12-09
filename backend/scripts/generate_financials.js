
import { pool } from '../db.js';

const TOTAL_RECORDS = 1000000;
const BATCH_SIZE = 5000;

const SOURCES = ['Donation', 'Government Grant', 'Corporate Sponsorship', 'Fundraiser', 'Refund', 'Salary', 'Equipment Sale'];
const CURRENCIES = ['TWD', 'TWD', 'TWD', 'TWD', 'TWD', 'TWD', 'TWD', 'TWD', 'TWD', 'USD']; // 90% TWD
const PURPOSES = ['Medical', 'Food', 'Logistics', 'Equipment', 'Transport', 'Shelter', 'Other'];

const getRandomDate = (start, end) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const generateBatch = (adminId) => {
    const values = [];
    const params = [];
    let paramIndex = 1;

    for (let i = 0; i < BATCH_SIZE; i++) {
        // txn_id is NOT auto-increment in some contexts, but let's assume valid sequence or rely on default.
        // Wait, earlier schema showed "txn_id bigint NOT NULL" but NO default. 
        // If there is no default, I MUST generate it. 
        // Let's assume there is a sequence or I need to generate it.
        // To be safe, I'll check if txn_id sequence exists in separate logic? 
        // Or I can just try INSERT without txn_id first (as in services/financials.js).
        // services/financials.js DOES NOT include txn_id in INSERT columns. So existing schema MUST have a default/sequence.
        
        const source = getRandom(SOURCES);
        const amount = (Math.random() * 100000).toFixed(2);
        const currency = getRandom(CURRENCIES);
        const purpose = getRandom(PURPOSES);
        const createdAt = getRandomDate(new Date(2023, 0, 1), new Date()); // Last ~2-3 years

        // (source, amount, currency, purpose, admin_id, created_at)
        // I will add created_at to the insert columns to simulate history
        params.push(source, amount, currency, purpose, adminId, createdAt);
        values.push(`($${paramIndex}, $${paramIndex+1}, $${paramIndex+2}, $${paramIndex+3}, $${paramIndex+4}, $${paramIndex+5})`);
        paramIndex += 6;
    }
    return { values: values.join(','), params };
};

const main = async () => {
    try {
        console.log('🚀 Starting Financial Data Generation...');

        // 1. Get Admin ID
        let adminId;
        const userRes = await pool.query('SELECT user_id FROM "USERS" LIMIT 1');
        if (userRes.rows.length > 0) {
            adminId = userRes.rows[0].user_id;
        } else {
            console.log('Creating dummy admin user...');
            const newUser = await pool.query(`
                INSERT INTO "USERS" (name, role, phone, status) 
                VALUES ('System Admin', 'Admin', '0900000000', 'Active') 
                RETURNING user_id
            `);
            adminId = newUser.rows[0].user_id;
        }
        console.log(`Using Admin ID: ${adminId}`);

        // 1.5 Truncate Table to avoid ID conflicts
        console.log('🧹 Clearing existing Financial data...');
        await pool.query('TRUNCATE TABLE "FINANCIALS" RESTART IDENTITY');
        console.log('✅ Table cleared.');

        // 2. Generate Data
        const startTime = Date.now();
        let insertedCount = 0;

        for (let i = 0; i < TOTAL_RECORDS; i += BATCH_SIZE) {
            const { values, params } = generateBatch(adminId);
            const sql = `
                INSERT INTO "FINANCIALS" (source, amount, currency, purpose, admin_id, created_at)
                VALUES ${values}
            `;
            await pool.query(sql, params);
            
            insertedCount += BATCH_SIZE;
            if (insertedCount % 50000 === 0) {
                const progress = ((insertedCount / TOTAL_RECORDS) * 100).toFixed(1);
                const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
                console.log(`[${progress}%] Inserted ${insertedCount} records... (${elapsedSeconds}s)`);
            }
        }

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log(`✅ Successfully generated ${TOTAL_RECORDS} records in ${totalTime}s!`);

    } catch (error) {
        console.error('❌ Error generating data:', error);
    } finally {
        await pool.end();
    }
};

main();
