import { pool } from '../db.js';

/**
 * Accept a request (Create record in REQUEST_ACCEPTERS)
 * Table: REQUEST_ACCEPTERS
 */
export const createRequestAccepter = async (data) => {
  const { request_id, accepter_id, incident_id } = data;

  try {
    const sql = `
      INSERT INTO "REQUEST_ACCEPTERS" (request_id, accepter_id, incident_id)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    
    const { rows } = await pool.query(sql, [request_id, accepter_id, incident_id]);
    return rows[0];

  } catch (error) {
    console.error('Error accepting request:', error);
    throw error;
  }
};

/**
 * Get all accepters for a specific request
 */
export const getAcceptersByRequestId = async (data) => {
  const { request_id } = data;

  try {
    const sql = 'SELECT * FROM "REQUEST_ACCEPTERS" WHERE request_id = $1 ORDER BY created_at DESC';
    const { rows } = await pool.query(sql, [request_id]);
    
    return rows;

  } catch (error) {
    console.error('Error getting accepters for request:', error);
    throw error;
  }
};

/**
 * Get all requests accepted by a specific user
 */
export const getAcceptedRequestsByUserId = async (data) => {
  const { accepter_id } = data;

  try {
    const sql = 'SELECT * FROM "REQUEST_ACCEPTERS" WHERE accepter_id = $1 ORDER BY created_at DESC';
    const { rows } = await pool.query(sql, [accepter_id]);
    
    return rows;

  } catch (error) {
    console.error('Error getting accepted requests by user:', error);
    throw error;
  }
};

/**
 * Cancel acceptance (Delete record)
 * Requires both request_id and accepter_id to identify the specific link
 */
export const deleteRequestAccepter = async (data) => {
  const { request_id, accepter_id } = data;

  try {
    const sql = `
      DELETE FROM "REQUEST_ACCEPTERS" 
      WHERE request_id = $1 AND accepter_id = $2 
      RETURNING *;
    `;
    const { rows } = await pool.query(sql, [request_id, accepter_id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error deleting request accepter:', error);
    throw error;
  }
};

/**
 * Get All Request Accepters
 */
export const getAllRequestAccepters = async () => {
  try {
    const sql = 'SELECT * FROM "REQUEST_ACCEPTERS" ORDER BY created_at DESC';
    const { rows } = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error('Error getting all request accepters:', error);
    throw error;
  }
};