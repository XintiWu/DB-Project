import { pool } from '../db.js';

/**
 * Create a new lending record (Borrow item)
 * Table: LENDS
 */
export const createLend = async (data) => {
  const { user_id, item_id, qty, from_inventory_id } = data;

  try {
    const sql = `
      INSERT INTO "LENDS" (user_id, item_id, qty, from_inventory_id, lend_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;
    
    const { rows } = await pool.query(sql, [user_id, item_id, qty, from_inventory_id]);
    return rows[0];

  } catch (error) {
    console.error('Error creating lend record:', error);
    throw error;
  }
};

/**
 * Mark a lent item as returned
 * Updates 'returned_at' timestamp
 */
export const returnLend = async (data) => {
  const { lend_id } = data;

  try {
    const sql = `
      UPDATE "LENDS"
      SET returned_at = NOW()
      WHERE lend_id = $1
      RETURNING *;
    `;
    
    const { rows } = await pool.query(sql, [lend_id]);
    return rows[0];

  } catch (error) {
    console.error('Error returning lend:', error);
    throw error;
  }
};

/**
 * Get lending history by User ID
 */
export const getLendsByUserId = async (data) => {
  const { user_id } = data;

  try {
    const sql = `
      SELECT l.*, i.item_name 
      FROM "LENDS" l
      JOIN "ITEMS" i ON l.item_id = i.item_id
      WHERE l.user_id = $1
      ORDER BY l.lend_at DESC
    `;
    const { rows } = await pool.query(sql, [user_id]);
    
    return rows;

  } catch (error) {
    console.error('Error getting user lends:', error);
    throw error;
  }
};

/**
 * Get currently outstanding lends (items not yet returned)
 * Useful for checking inventory availability or overdue items
 */
export const getOutstandingLends = async () => {
  try {
    const sql = `
      SELECT l.*, u.name as user_name, i.item_name
      FROM "LENDS" l
      JOIN "USERS" u ON l.user_id = u.user_id
      JOIN "ITEMS" i ON l.item_id = i.item_id
      WHERE l.returned_at IS NULL
    `;
    const { rows } = await pool.query(sql);
    
    return rows;

  } catch (error) {
    console.error('Error getting outstanding lends:', error);
    throw error;
  }
};