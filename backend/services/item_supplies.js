import { pool } from '../db.js';

/**
 * Create supply details for an item
 * Table: ITEM_SUPPLIES
 */
export const createItemSupply = async (data) => {
  const { item_id, expires_in } = data;

  try {
    const sql = `
      INSERT INTO "ITEM_SUPPLIES" (item_id, expires_in)
      VALUES ($1, $2)
      RETURNING *;
    `;
    
    const { rows } = await pool.query(sql, [item_id, expires_in]);
    return rows[0];

  } catch (error) {
    console.error('Error creating item supply:', error);
    throw error;
  }
};

/**
 * Update supply details (expiration)
 */
export const updateItemSupply = async (data) => {
  const { item_id, expires_in } = data;

  try {
    const sql = `
      UPDATE "ITEM_SUPPLIES"
      SET expires_in = $1
      WHERE item_id = $2
      RETURNING *;
    `;
    
    const { rows } = await pool.query(sql, [expires_in, item_id]);
    return rows[0];

  } catch (error) {
    console.error('Error updating item supply:', error);
    throw error;
  }
};

/**
 * Get supply details by Item ID
 */
export const getItemSupplyByItemId = async (data) => {
  const { item_id } = data;

  try {
    const sql = 'SELECT * FROM "ITEM_SUPPLIES" WHERE item_id = $1';
    const { rows } = await pool.query(sql, [item_id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error getting item supply by id:', error);
    throw error;
  }
};

/**
 * Delete supply details
 */
export const deleteItemSupply = async (data) => {
  const { item_id } = data;

  try {
    const sql = 'DELETE FROM "ITEM_SUPPLIES" WHERE item_id = $1 RETURNING item_id';
    const { rows } = await pool.query(sql, [item_id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error deleting item supply:', error);
    throw error;
  }
};

/**
 * Get All Item Supplies
 */
export const getAllItemSupplies = async () => {
  try {
    const sql = 'SELECT * FROM "ITEM_SUPPLIES"';
    const { rows } = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error('Error getting all item supplies:', error);
    throw error;
  }
};