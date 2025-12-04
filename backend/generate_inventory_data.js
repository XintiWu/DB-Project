import { pool } from './db.js';

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function generateInventoryData() {
  const client = await pool.connect();
  try {
    console.log('Starting inventory data generation...');
    await client.query('BEGIN');

    // 1. Fetch Inventories and Items
    const inventoriesRes = await client.query('SELECT inventory_id FROM "INVENTORIES"');
    const itemsRes = await client.query('SELECT item_id FROM "ITEMS"');

    const inventories = inventoriesRes.rows;
    const items = itemsRes.rows;

    if (inventories.length === 0) {
      console.log('No inventories found. Please ensure inventories exist.');
      return;
    }
    if (items.length === 0) {
      console.log('No items found. Please ensure items exist.');
      return;
    }

    console.log(`Found ${inventories.length} inventories and ${items.length} items. Generating inventory items...`);

    // 2. Clear existing inventory items (optional, but good for clean state)
    await client.query('DELETE FROM "INVENTORY_ITEMS"');

    // 3. Populate Inventory Items
    for (const inventory of inventories) {
      // Each inventory has 5-15 random items
      const numItems = getRandomInt(5, 15);
      const shuffledItems = items.sort(() => 0.5 - Math.random()).slice(0, numItems);

      for (const item of shuffledItems) {
        const qty = getRandomInt(10, 500);
        const status = Math.random() > 0.1 ? 'Available' : 'Unavailable'; // 90% Available

        await client.query(`
          INSERT INTO "INVENTORY_ITEMS" (inventory_id, item_id, qty, status, updated_at)
          VALUES ($1, $2, $3, $4, NOW())
        `, [inventory.inventory_id, item.item_id, qty, status]);
      }
    }

    await client.query('COMMIT');
    console.log('Inventory data generation completed.');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error generating inventory data:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

generateInventoryData();
