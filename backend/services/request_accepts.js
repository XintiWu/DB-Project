import { pool } from '../db.js';
import { logError } from '../utils/logger.js';

/**
 * Accept a request (Create record in REQUEST_ACCEPTS)
 * Table: REQUEST_ACCEPTS
 */
export const createRequestAccept = async (data) => {
  console.log("createRequestAccept")
  const { request_id, accepter_id, eta, description, source } = data;

  try {
    const sql = `
      INSERT INTO "REQUEST_ACCEPTS" (request_id, accepter_id, created_at, eta, description, source)
      VALUES ($1, $2, NOW(), $3, $4, $5)
      RETURNING *;
    `;
    
    const { rows } = await pool.query(sql, [request_id, accepter_id, eta, description, source]);
    return rows[0];

  } catch (error) {
    console.log("createRequestAccept error")
    logError('[Service] createRequestAccept', error);
    throw error;
  }
};

/**
 * Get all Accepts for a specific request
 */
export const getAcceptsByRequestId = async (data) => {
  const { request_id } = data;

  try {
    const sql = 'SELECT * FROM "REQUEST_ACCEPTS" WHERE request_id = $1 ORDER BY created_at DESC';
    const { rows } = await pool.query(sql, [request_id]);
    
    return rows;

  } catch (error) {
    console.error('Error getting Accepts for request:', error);
    throw error;
  }
};

/**
 * Get all requests accepted by a specific user
 */
export const getAcceptedRequestsByAccepterId = async (data) => {
  const { accepter_id } = data;

  try {
    const sql = 'SELECT * FROM "REQUEST_ACCEPTS" WHERE accepter_id = $1 ORDER BY created_at DESC';
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
export const deleteRequestAccept = async (data) => {
  const { request_id, accepter_id } = data;

  try {
    const sql = `
      DELETE FROM "REQUEST_ACCEPTS" 
      WHERE request_id = $1 AND accepter_id = $2 
      RETURNING *;
    `;
    const { rows } = await pool.query(sql, [request_id, accepter_id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error deleting request accept:', error);
    throw error;
  }
};

/**
 * Get All Request Accepts
 */
export const getAllRequestAccepts = async () => {
  try {
    const sql = 'SELECT * FROM "REQUEST_ACCEPTS" ORDER BY created_at DESC';
    const { rows } = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error('Error getting all request Accepts:', error);
    throw error;
  }
};

/**
 * Create multiple request Accepts (Bulk)
 */
export const createBulkRequestAccepts = async (data) => {
  const { accepter_id, items } = data;
  console.log('[BulkAccept] Received payload:', JSON.stringify(data, null, 2));

  const results = [];

  try {
    for (const item of items) {
       // Frontend sends request_id directly now
       const request_id = item.request_id || item.needId; 
       
       if (!request_id) {
          console.warn('[BulkAccept] Skipping item with no request_id:', item);
          continue;
       }
       
       // Prepare data for user's function
       const acceptData = {
         request_id,
         accepter_id,
         eta: item.eta,
         description: item.description,
         source: item.source
       };

       console.log(`[BulkAccept] Calling createRequestAccept for request_id=${request_id}`);
       
       // Call the user's function directly
       const result = await createRequestAccept(acceptData);
       results.push(result);
    }

    console.log('[BulkAccept] Success. Results:', results.length);
    return results;

  } catch (error) {
    logError('[Service] createBulkRequestAccepts', error);
    throw error;
  }
};