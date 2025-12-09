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

    // 2. Check if request is already completed
    if (request.status === 'Completed') {
      throw new Error('此需求已經完成，無法再認領');
    }

    // 3. Check if already accepted (within transaction)
    const checkExistingSql = `
      SELECT * FROM "REQUEST_ACCEPTERS" 
      WHERE request_id = $1 AND accepter_id = $2
      FOR UPDATE;
    `;
    const existingResult = await client.query(checkExistingSql, [request_id, accepter_id]);
    
    if (existingResult.rows.length > 0) {
      throw new Error('您已經認領過此需求');
    }

    // 4. Calculate total quantity to accept
    let totalQtyAccepted = 0;
    
    if (requestType === 'Material' || requestType === 'Tool') {
      if (!items || items.length === 0) {
        throw new Error('物資/工具需求必須提供 items 陣列');
      }
      totalQtyAccepted = items.reduce((sum, item) => sum + (item.qty || 0), 0);
    } else if (requestType === 'Humanpower') {
      if (!qty || qty <= 0) {
        throw new Error('人力需求必須提供 qty（人數）');
      }
      totalQtyAccepted = qty;
    }

    // 5. Check if claiming quantity exceeds remaining need
    const remaining = request.required_qty - request.current_qty;
    if (totalQtyAccepted > remaining) {
      throw new Error(`認領數量超過剩餘需求（剩餘：${remaining}，嘗試認領：${totalQtyAccepted}）`);
    }

    // 6. Create REQUEST_ACCEPTERS record
    const insertAccepterSql = `
      INSERT INTO "REQUEST_ACCEPTERS" (request_id, accepter_id, created_at)
      VALUES ($1, $2, NOW())
      RETURNING *;
    `;
    const accepterResult = await client.query(insertAccepterSql, [request_id, accepter_id]);

    // 7. Create type-specific accept record
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

    // 8. Update REQUESTS.current_qty
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

/**
 * Bulk accept multiple requests (for claim functionality)
 * This function handles the frontend claim format and converts it to backend format
 * 
 * @param {Object} data
 * @param {string} data.claimerName - Name of the person claiming
 * @param {string} data.claimerPhone - Phone number
 * @param {string} data.claimerEmail - Email (optional)
 * @param {string} data.notes - Additional notes
 * @param {Array} data.items - Array of ClaimItem from frontend
 * @param {number} data.accepter_id - User ID who is accepting (optional, will try to find by phone/email)
 */
export const bulkAcceptRequests = async (data) => {
  const { claimerName, claimerPhone, claimerEmail, notes, items, accepter_id } = data;

  console.log('bulkAcceptRequests called with:', { 
    claimerName, 
    claimerPhone, 
    itemsCount: items?.length,
    accepter_id 
  });

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('認領項目不能為空');
  }

  // Try to get or create user ID
  let userId = accepter_id;
  
  if (!userId) {
    if (!claimerPhone) {
      throw new Error('必須提供 accepter_id 或 claimerPhone');
    }
    
    try {
      // Try to find user by phone
      const userResult = await pool.query(
        'SELECT user_id FROM "USERS" WHERE phone = $1 LIMIT 1',
        [claimerPhone]
      );
      
      if (userResult.rows.length > 0) {
        userId = userResult.rows[0].user_id;
        console.log('Found existing user:', userId);
      } else {
        // Create a new user if not found (temporary user for claiming)
        if (!claimerName) {
          throw new Error('必須提供 claimerName 以建立新使用者');
        }
        const createUserResult = await pool.query(
          'INSERT INTO "USERS" (name, phone, role, status) VALUES ($1, $2, $3, $4) RETURNING user_id',
          [claimerName, claimerPhone, 'Member', 'Active']
        );
        userId = createUserResult.rows[0].user_id;
        console.log('Created new user:', userId);
      }
    } catch (userError) {
      console.error('Error handling user:', userError);
      throw new Error(`無法處理用戶資訊: ${userError.message}`);
    }
  }

  const results = [];
  const errors = [];

  // Process each claim item
  for (const item of items) {
    try {
      console.log('Processing claim item:', item);
      
      // Support both formats: item.needId (old) and item.request_id (new)
      const request_id = parseInt(item.request_id || item.needId);
      
      if (!request_id || isNaN(request_id)) {
        errors.push({ item, error: `無效的需求 ID: ${item.request_id || item.needId}` });
        continue;
      }

      // Get request details to determine type
      const requestResult = await pool.query(
        'SELECT type, incident_id, required_qty, current_qty, status FROM "REQUESTS" WHERE request_id = $1',
        [request_id]
      );

      if (requestResult.rows.length === 0) {
        errors.push({ item, error: `需求不存在: ${request_id}` });
        continue;
      }

      const request = requestResult.rows[0];
      const requestType = request.type;
      const incident_id = request.incident_id;

      // Check if request is already completed
      if (request.status === 'Completed') {
        errors.push({ item, error: '此需求已經完成，無法再認領' });
        continue;
      }

      console.log('Request details:', { request_id, type: requestType, incident_id });

      // Check if already accepted (prevent duplicate)
      const existingAccept = await pool.query(
        'SELECT * FROM "REQUEST_ACCEPTERS" WHERE request_id = $1 AND accepter_id = $2',
        [request_id, userId]
      );

      if (existingAccept.rows.length > 0) {
        console.log('Already accepted, skipping:', { request_id, userId });
        errors.push({ item, error: '您已經認領過此需求' });
        continue;
      }

      // Prepare data for createRequestAccepter
      let acceptData = {
        request_id,
        accepter_id: userId,
        incident_id
      };

      if (requestType === 'Material' || requestType === 'Tool') {
        // For Material/Tool, need to get items from REQUEST_MATERIALS
        const materialsResult = await pool.query(
          'SELECT item_id, qty FROM "REQUEST_MATERIALS" WHERE request_id = $1',
          [request_id]
        );

        if (materialsResult.rows.length === 0) {
          errors.push({ item, error: '需求沒有關聯的物品' });
          continue;
        }

        // Use the first item with the claimed quantity
        const firstItem = materialsResult.rows[0];
        const claimQty = item.quantity || item.qty || 1;
        
        // Check if quantity is valid
        const remaining = request.required_qty - request.current_qty;
        if (claimQty > remaining) {
          errors.push({ item, error: `認領數量超過剩餘需求（剩餘：${remaining}）` });
          continue;
        }

        acceptData.items = [{
          item_id: firstItem.item_id,
          qty: claimQty
        }];

        console.log('Material/Tool accept data:', acceptData);

      } else if (requestType === 'Humanpower') {
        // For Humanpower, use the quantity from claim item
        const claimQty = item.quantity || item.qty || 1;
        
        // Check if quantity is valid
        const remaining = request.required_qty - request.current_qty;
        if (claimQty > remaining) {
          errors.push({ item, error: `認領數量超過剩餘需求（剩餘：${remaining}）` });
          continue;
        }

        acceptData.qty = claimQty;
        console.log('Humanpower accept data:', acceptData);

      } else {
        errors.push({ item, error: `未知的需求類型: ${requestType}` });
        continue;
      }

      // Call createRequestAccepter
      console.log('Calling createRequestAccepter with:', acceptData);
      const result = await createRequestAccepter(acceptData);
      results.push({
        request_id,
        success: true,
        result
      });
      console.log('Successfully accepted request:', request_id);

    } catch (error) {
      console.error('Error processing claim item:', error);
      errors.push({
        item,
        error: error.message || '處理失敗',
        details: error.stack
      });
    }
  }

  const response = {
    success: errors.length === 0,
    totalItems: items.length,
    successful: results.length,
    failed: errors.length,
    results,
    errors,
    claimerInfo: {
      name: claimerName,
      phone: claimerPhone,
      email: claimerEmail,
      userId
    }
  };

  console.log('bulkAcceptRequests result:', JSON.stringify(response, null, 2));
  
  // 如果全部失敗，拋出錯誤
  if (results.length === 0 && errors.length > 0) {
    const errorMessages = errors.map(e => e.error).join('; ');
    throw new Error(`所有認領項目都失敗：${errorMessages}`);
  }
  
  // 如果有錯誤（部分失敗），仍然返回響應，但 success 為 false
  // 前端需要檢查 success 和 errors 來決定如何處理
  return response;
};