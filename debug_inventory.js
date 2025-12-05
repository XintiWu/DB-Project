import { pool } from './backend/db.js';

const debugInventory = async () => {
  try {
    console.log('--- Checking INVENTORY_ITEMS ---');
    const invItems = await pool.query('SELECT * FROM "INVENTORY_ITEMS" LIMIT 5');
    console.log('INVENTORY_ITEMS sample:', invItems.rows);

    if (invItems.rows.length > 0) {
      const sampleInvId = invItems.rows[0].inventory_id;
      console.log(`\n--- Checking items for Inventory ID: ${sampleInvId} ---`);
      
      const sql = `
        SELECT 
          inv_i.inventory_id,
          inv_i.item_id,
          i.item_name,
          i.category_id,
          ic.category_name
        FROM "INVENTORY_ITEMS" inv_i
        LEFT JOIN "ITEMS" i ON inv_i.item_id = i.item_id
        LEFT JOIN "ITEM_CATEGORIES" ic ON i.category_id = ic.category_id
        WHERE inv_i.inventory_id = $1
      `;
      const res = await pool.query(sql, [sampleInvId]);
      console.log('Joined Query Result:', res.rows);
    } else {
      console.log('No data in INVENTORY_ITEMS table.');
    }

    console.log('\n--- Checking ITEMS sample ---');
    const items = await pool.query('SELECT * FROM "ITEMS" LIMIT 5');
    console.log(items.rows);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    process.exit();
  }
};

debugInventory();
