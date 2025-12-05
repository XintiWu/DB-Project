import { pool } from '../db.js';

/**
 * Create a warning for a user
 * @param {Object} data
 */
export const createWarning = async (data) => {
  const { user_id, admin_id, reason, request_id, incident_id } = data;

  try {
    const sql = `
      INSERT INTO "USER_WARNINGS" 
      (user_id, admin_id, reason, request_id, incident_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    
    // Note: The user's schema has NOT NULL constraints on request_id and incident_id.
    // We must ensure these are provided. If not applicable, we might need to handle this,
    // but for the "Review System" context, request_id should be available.
    // If incident_id is missing, we might need to fetch it from the request or pass a dummy if the DB allows (unlikely with FK).
    // Let's assume the frontend/caller provides them.
    
    const values = [user_id, admin_id, reason, request_id, incident_id];
    const { rows } = await pool.query(sql, values);
    return rows[0];

  } catch (error) {
    console.error('Error creating warning:', error);
    throw error;
  }
};

/**
 * Get warnings for a specific user
 */
export const getWarningsByUserId = async (userId) => {
  try {
    const sql = `
      SELECT w.*, u.name as admin_name 
      FROM "USER_WARNINGS" w
      JOIN "USERS" u ON w.admin_id = u.user_id
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC
    `;
    const { rows } = await pool.query(sql, [userId]);
    return rows;
  } catch (error) {
    console.error('Error getting user warnings:', error);
    throw error;
  }
};
