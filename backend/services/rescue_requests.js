import { pool } from '../db.js';

/**
 * Get rescue details (headcount) by request ID
 */
export const getRescueDetails = async (data) => {
  const { request_id } = data;

  try {
    const sql = 'SELECT * FROM "RESCUE_REQUEST" WHERE request_id = $1';
    const { rows } = await pool.query(sql, [request_id]);
    return rows[0];
  } catch (error) {
    console.error('Error getting rescue details:', error);
    throw error;
  }
};

/**
 * Update headcount for a rescue request
 */
export const updateRescueHeadcount = async (data) => {
  const { request_id, headcount } = data;

  try {
    const sql = `
      UPDATE "RESCUE_REQUEST"
      SET headcount = $1
      WHERE request_id = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(sql, [headcount, request_id]);
    return rows[0];
  } catch (error) {
    console.error('Error updating rescue headcount:', error);
    throw error;
  }
};