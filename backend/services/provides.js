import { pool } from '../db.js';

/**
 * Create a new provision record
 * Table: PROVIDES
 */
export const createProvide = async (data) => {
  const { user_id, item_id, qty } = data;

  try {
    const sql = `
      INSERT INTO "PROVIDES" (user_id, item_id, qty, provide_date)
      VALUES ($1, $2, $3, NOW())
      RETURNING *;
    `;
    
    const { rows } = await pool.query(sql, [user_id, item_id, qty]);
    return rows[0];

  } catch (error) {
    console.error('Error creating provide record:', error);
    throw error;
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