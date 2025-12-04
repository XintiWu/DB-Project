import { pool } from '../db.js';

/**
 * Get items for a specific request
 * Useful for displaying request details
 */
export const getRequestItemsByRequestId = async (data) => {
  const { request_id } = data;

  try {
    // Joins with ITEMS to get names if needed, but here we stick to the table structure
    const sql = `
      SELECT ri.*, i.item_name, i.unit
      FROM "REQUEST_ITEMS" ri
      JOIN "ITEMS" i ON ri.item_id = i.item_id
      WHERE ri.request_id = $1
    `;
    const { rows } = await pool.query(sql, [request_id]);
    return rows;
  } catch (error) {
    console.error('Error getting request items:', error);
    throw error;
  }
};

/**
 * Add an item to an existing request
 */
export const addRequestItem = async (data) => {
  const { request_id, item_id, qty } = data;

  try {
    const sql = `
      INSERT INTO "REQUEST_ITEMS" (request_id, item_id, qty)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await pool.query(sql, [request_id, item_id, qty]);
    return rows[0];
  } catch (error) {
    console.error('Error adding request item:', error);
    throw error;
  }
};

/**
 * Update quantity of a requested item
 */
export const updateRequestItemQty = async (data) => {
  const { request_id, item_id, qty } = data;

  try {
    const sql = `
      UPDATE "REQUEST_ITEMS"
      SET qty = $1
      WHERE request_id = $2 AND item_id = $3
      RETURNING *;
    `;
    const { rows } = await pool.query(sql, [qty, request_id, item_id]);
    return rows[0];
  } catch (error) {
    console.error('Error updating request item qty:', error);
    throw error;
  }
};

/**
 * Remove an item from a request
 */
export const removeRequestItem = async (data) => {
  const { request_id, item_id } = data;

  try {
    const sql = `
      DELETE FROM "REQUEST_ITEMS" 
      WHERE request_id = $1 AND item_id = $2 
      RETURNING *;
    `;
    const { rows } = await pool.query(sql, [request_id, item_id]);
    return rows[0];
  } catch (error) {
    console.error('Error removing request item:', error);
    throw error;
  }
};