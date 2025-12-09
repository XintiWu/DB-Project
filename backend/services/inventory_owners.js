import { pool } from '../db.js';

/**
 * Add Owner to Inventory
 */
export const addInventoryOwner = async (data) => {
  const { inventory_id, user_id } = data;

  try {
    const sql = `
      INSERT INTO "INVENTORY_OWNERS" (inventory_id, user_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    
    // Note: Column name in inventories.js was owner_id, assuming same here.
    // Schema assumption was owner_id.
    const { rows } = await pool.query(sql, [inventory_id, user_id]);
    return rows[0];

  } catch (error) {
    console.error('Error adding inventory owner:', error);
    throw error;
  }
};

/**
 * Remove Owner from Inventory
 */
export const removeInventoryOwner = async (data) => {
  const { inventory_id, user_id } = data;

  try {
    const sql = `
      DELETE FROM "INVENTORY_OWNERS" 
      WHERE inventory_id = $1 AND user_id = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(sql, [inventory_id, user_id]);
    return rows[0];

  } catch (error) {
    console.error('Error removing inventory owner:', error);
    throw error;
  }
};

/**
 * Get Owners by Inventory ID
 */
export const getOwnersByInventoryId = async (data) => {
  const { inventory_id } = data;

  try {
    const sql = `
      SELECT io.*, u.name, u.email, u.phone
      FROM "INVENTORY_OWNERS" io
      JOIN "USERS" u ON io.user_id = u.user_id
        WHERE io.inventory_id = $1
    `;
    const { rows } = await pool.query(sql, [inventory_id]);
    return rows;

  } catch (error) {
    console.error('Error getting owners by inventory:', error);
    throw error;
  }
};

/**
 * Get Inventories by User ID
 */
export const getInventoriesByUserId = async (data) => {
  const { user_id } = data;

  try {
    const sql = `
      SELECT io.inventory_id, io.user_id, i.address, i.status,
      CAST(COALESCE(SUM(ii.qty), 0) AS INTEGER) as total_qty,
      COUNT(DISTINCT ii.item_id) as item_count
      FROM "INVENTORY_OWNERS" io
      JOIN "INVENTORIES" i ON io.inventory_id = i.inventory_id
      LEFT JOIN "INVENTORY_ITEMS" ii ON i.inventory_id = ii.inventory_id 
        AND ii.status IN ('Available', 'Lent', 'Unavailable')
      WHERE io.user_id = $1
      GROUP BY io.inventory_id, io.user_id, i.inventory_id, i.address, i.status
      ORDER BY i.inventory_id ASC
    `;
    const { rows } = await pool.query(sql, [user_id]);
    return rows;

  } catch (error) {
    console.error('Error getting inventories by user:', error);
    throw error;
  }
};

/**
 * Get All Inventory Owners (Admin)
 */
export const getAllInventoryOwners = async () => {
  try {
    const sql = 'SELECT * FROM "INVENTORY_OWNERS"';
    const { rows } = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error('Error getting all inventory owners:', error);
    throw error;
  }
};
