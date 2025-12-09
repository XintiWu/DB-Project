import { pool } from './db.js';

const updateWarehouseStatus = async () => {
  try {
    // 1. Reset all to Private (optional, but safer to start clean or just mix)
    // Or just pick random ones to set Public. User asked to "randomly update ... to Public"
    // Let's assume some are Private/Unknown and we want to make some Public.
    
    console.log('Fetching all warehouses...');
    const res = await pool.query('SELECT inventory_id FROM "INVENTORIES"');
    const ids = res.rows.map(r => r.inventory_id);
    
    if (ids.length === 0) {
      console.log('No warehouses found.');
      process.exit(0);
    }

    console.log(`Found ${ids.length} warehouses.`);

    // 2. Shuffle array
    const shuffled = ids.sort(() => 0.5 - Math.random());

    // 3. Select 80% to be Public
    const countToUpdate = Math.floor(ids.length * 0.8); 
    const selectedIds = shuffled.slice(0, countToUpdate);

    if (selectedIds.length > 0) {
      console.log(`Updating ${selectedIds.length} warehouses to 'Public' status...`);
      const updateSql = `
        UPDATE "INVENTORIES"
        SET status = 'Public'
        WHERE inventory_id = ANY($1)
      `;
      await pool.query(updateSql, [selectedIds]);
      console.log('Update complete.');
    }
    
    // Set others to Private just to be sure? User only asked to set to Public.
    // I'll stick to just setting random ones to Public.

  } catch (error) {
    console.error('Error updating warehouse status:', error);
  } finally {
    pool.end();
  }
};

updateWarehouseStatus();
