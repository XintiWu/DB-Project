import { pool } from '../db.js';

/**
 * Create a new provision record
 * Table: PROVIDES + INVENTORY_ITEMS
 * Uses Transaction to ensure:
 * 1. Create provision record
 * 2. Add quantity to inventory (or create new inventory item if not exists)
 */
export const createProvide = async (data) => {
  const { user_id, item_id, qty, inventory_id } = data;

  if (!inventory_id) {
    throw new Error('必須指定庫存 ID (inventory_id)');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Create provision record
    const insertProvideSql = `
      INSERT INTO "PROVIDES" (user_id, item_id, qty, provide_date)
      VALUES ($1, $2, $3, NOW())
      RETURNING *;
    `;
    const provideResult = await client.query(insertProvideSql, [user_id, item_id, qty]);

    // 2. Check if item exists in inventory
    const checkInventorySql = `
      SELECT qty 
      FROM "INVENTORY_ITEMS"
      WHERE inventory_id = $1 AND item_id = $2;
    `;
    const checkResult = await client.query(checkInventorySql, [inventory_id, item_id]);

    if (checkResult.rows.length > 0) {
      // Item exists, update quantity
      const updateInventorySql = `
        UPDATE "INVENTORY_ITEMS"
        SET qty = qty + $1, updated_at = NOW()
        WHERE inventory_id = $2 AND item_id = $3
        RETURNING qty;
      `;
      await client.query(updateInventorySql, [qty, inventory_id, item_id]);
    } else {
      // Item doesn't exist, insert new record
      const insertInventorySql = `
        INSERT INTO "INVENTORY_ITEMS" (inventory_id, item_id, qty, updated_at)
        VALUES ($1, $2, $3, NOW())
        RETURNING *;
      `;
      await client.query(insertInventorySql, [inventory_id, item_id, qty]);
    }

    await client.query('COMMIT');
    return provideResult.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating provide record with transaction:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get all items provided by a specific user
 */
export const getProvidesByUserId = async (data) => {
  const { user_id } = data;

  try {
    const sql = `
      SELECT p.*, i.item_name, i.unit 
      FROM "PROVIDES" p
      JOIN "ITEMS" i ON p.item_id = i.item_id
      WHERE p.user_id = $1
      ORDER BY p.provide_date DESC
    `;
    const { rows } = await pool.query(sql, [user_id]);
    
    return rows;

  } catch (error) {
    console.error('Error getting user provides:', error);
    throw error;
  }
};

/**
 * Delete a provision record
 */
export const deleteProvide = async (data) => {
  const { provide_id } = data;

  try {
    const sql = 'DELETE FROM "PROVIDES" WHERE provide_id = $1 RETURNING provide_id';
    const { rows } = await pool.query(sql, [provide_id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error deleting provide record:', error);
    throw error;
  }
};

/**
 * Get All Provides
 */
export const getAllProvides = async () => {
  try {
    const sql = 'SELECT * FROM "PROVIDES" ORDER BY provide_date DESC';
    const { rows } = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error('Error getting all provides:', error);
    throw error;
  }
};