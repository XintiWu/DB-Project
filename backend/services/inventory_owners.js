import { pool } from '../db.js';

/**
 * Add Owner to Inventory
 */
export const addInventoryOwner = async (data) => {
  const { inventory_id, user_id } = data;

  try {
    const sql = `
      INSERT INTO "INVENTORY_OWNERS" (inventory_id, owner_id)
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
      WHERE inventory_id = $1 AND owner_id = $2
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
      JOIN "USERS" u ON io.owner_id = u.user_id
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
      SELECT io.*, i.location, i.updated_at
      FROM "INVENTORY_OWNERS" io
      JOIN "INVENTORIES" i ON io.inventory_id = i.inventory_id
      WHERE io.owner_id = $1
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
