import { pool } from '../db.js';

/**
 * Accept a request (Create record in REQUEST_ACCEPTERS)
 * Tables: REQUEST_ACCEPTERS + REQUEST_ITEM_ACCEPT/REQUEST_RESCUE_ACCEPT + REQUESTS
 * Uses Transaction to ensure:
 * 1. Get request details and check type
 * 2. Create REQUEST_ACCEPTERS record
 * 3. Create type-specific accept record (REQUEST_ITEM_ACCEPT or REQUEST_RESCUE_ACCEPT)
 * 4. Update REQUESTS.current_qty
 * 5. Check if request is completed and update status
 * 
 * @param {Object} data
 * @param {number} data.request_id - Request ID
 * @param {number} data.accepter_id - User ID who accepts
 * @param {number} data.incident_id - Incident ID
 * @param {Array} data.items - For Material/Tool requests: [{item_id, qty}]
 * @param {number} data.qty - For Humanpower requests: quantity of people
 */
export const createRequestAccepter = async (data) => {
  const { request_id, accepter_id, incident_id, items, qty } = data;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Get request details
    const getRequestSql = `
      SELECT type, required_qty, current_qty, status
      FROM "REQUESTS"
      WHERE request_id = $1
      FOR UPDATE;
    `;
    const requestResult = await client.query(getRequestSql, [request_id]);
    
    if (requestResult.rows.length === 0) {
      throw new Error('需求不存在');
    }

    const request = requestResult.rows[0];
    const requestType = request.type;

    // 2. Create REQUEST_ACCEPTERS record
    const insertAccepterSql = `
      INSERT INTO "REQUEST_ACCEPTERS" (request_id, accepter_id, created_at)
      VALUES ($1, $2, NOW())
      RETURNING *;
    `;
    const accepterResult = await client.query(insertAccepterSql, [request_id, accepter_id]);

    let totalQtyAccepted = 0;

    // 3. Create type-specific accept record
    if (requestType === 'Material' || requestType === 'Tool') {
      // Material or Tool request
      if (!items || items.length === 0) {
        throw new Error('物資/工具需求必須提供 items 陣列');
      }

      const insertItemAcceptSql = `
        INSERT INTO "REQUEST_ITEM_ACCEPT" (request_id, accepter_id, item_id, qty)
        VALUES ($1, $2, $3, $4);
      `;
      
      for (const item of items) {
        await client.query(insertItemAcceptSql, [
          request_id, 
          accepter_id, 
          item.item_id, 
          item.qty
        ]);
        totalQtyAccepted += item.qty;
      }

    } else if (requestType === 'Humanpower') {
      // Humanpower request
      if (!qty || qty <= 0) {
        throw new Error('人力需求必須提供 qty（人數）');
      }

      const insertRescueAcceptSql = `
        INSERT INTO "REQUEST_RESCUE_ACCEPT" (request_id, accepter_id, qty)
        VALUES ($1, $2, $3);
      `;
      await client.query(insertRescueAcceptSql, [request_id, accepter_id, qty]);
      totalQtyAccepted = qty;

    } else {
      throw new Error(`未知的需求類型: ${requestType}`);
    }

    // 4. Update REQUESTS.current_qty
    const newCurrentQty = request.current_qty + totalQtyAccepted;
    
    let updateRequestSql;
    if (newCurrentQty >= request.required_qty) {
      // 5. Mark as completed if requirement is met
      updateRequestSql = `
        UPDATE "REQUESTS"
        SET current_qty = $1, status = 'Completed'
        WHERE request_id = $2
        RETURNING *;
      `;
    } else {
      updateRequestSql = `
        UPDATE "REQUESTS"
        SET current_qty = $1
        WHERE request_id = $2
        RETURNING *;
      `;
    }

    const updatedRequest = await client.query(updateRequestSql, [newCurrentQty, request_id]);

    await client.query('COMMIT');
    
    return {
      accepter: accepterResult.rows[0],
      request: updatedRequest.rows[0],
      qtyAccepted: totalQtyAccepted
    };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error accepting request with transaction:', error);
    throw error;
  } finally {
    client.release();
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