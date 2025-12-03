import { pool } from '../db.js';

/**
 * Create a new request with type-specific details
 * Supports 'item' and 'rescue' types
 */
export const createRequest = async (data) => {
  const { 
    requester_id, incident_id, status, urgency, type, 
    address, latitude, longitude,
    // Type-specific data fields:
    items,       // Array of { item_id, qty } for 'item' type
    headcount,   // Integer for 'rescue' type
    skills,      // "Array" of skill_tags (IDs) for 'rescue' type
    equipments   // "Array" of { required_equipment, qty } for 'rescue' type
  } = data;

  // We must use a client for transactions
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Insert into base REQUESTS table
    const insertRequestSql = `
      INSERT INTO "REQUESTS" 
      (requester_id, incident_id, status, urgency, type, address, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING request_id, created_at;
    `;
    
    const requestValues = [
      requester_id, incident_id, status, urgency, type, 
      address, latitude, longitude
    ];
    
    const requestResult = await client.query(insertRequestSql, requestValues);
    const newRequest = requestResult.rows[0];
    const newRequestId = newRequest.request_id;

    // 2. Handle 'item' type logic
    if (type === 'item' && items && items.length > 0) {
      const insertItemSql = `
        INSERT INTO "REQUEST_ITEMS" (request_id, item_id, qty)
        VALUES ($1, $2, $3)
      `;
      
      // Loop through items and insert each
      for (const item of items) {
        await client.query(insertItemSql, [newRequestId, item.item_id, item.qty]);
      }
    }

    // 3. Handle 'rescue' type logic
    else if (type === 'rescue') {
      // 3a. Insert into RESCUE_REQUEST (Headcount)
      if (headcount !== undefined) {
        const insertRescueSql = `
          INSERT INTO "RESCUE_REQUEST" (request_id, headcount)
          VALUES ($1, $2)
        `;
        await client.query(insertRescueSql, [newRequestId, headcount]);
      }

      // 3b. Insert into RESCUE_SKILLS
      if (skills && skills.length > 0) {
        const insertSkillSql = `
          INSERT INTO "RESCUE_SKILLS" (request_id, skill_tag_id)
          VALUES ($1, $2)
        `;
        for (const skillTag of skills) {
          await client.query(insertSkillSql, [newRequestId, skillTag]);
        }
      }

      // 3c. Insert into RESCUE_EQUIPMENTS
      if (equipments && equipments.length > 0) {
        const insertEquipSql = `
          INSERT INTO "RESCUE_EQUIPMENTS" (request_id, required_equipment, qty)
          VALUES ($1, $2, $3)
        `;
        for (const equip of equipments) {
          await client.query(insertEquipSql, [
            newRequestId, 
            equip.required_equipment, // assuming this is the ID/Name
            equip.qty
          ]);
        }
      }
    }

    await client.query('COMMIT');
    return newRequest;

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating request with transaction:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Update general request info (e.g., user updates their request)
 */
export const updateRequestInfo = async (data) => {
  const { 
    request_id, status, urgency, type, address, latitude, longitude 
  } = data;

  try {
    const sql = `
      UPDATE "REQUESTS"
      SET status = $1, urgency = $2, type = $3, address = $4, latitude = $5, longitude = $6
      WHERE request_id = $7
      RETURNING *;
    `;
    
    const values = [status, urgency, type, address, latitude, longitude, request_id];
    const { rows } = await pool.query(sql, values);
    
    return rows[0];

  } catch (error) {
    console.error('Error updating request info:', error);
    throw error;
  }
};

/**
 * Process/Review a request (Admin action)
 * Updates review fields: reviewed_at, reviewer_id, review_status, review_note
 */
export const reviewRequest = async (data) => {
  const { request_id, reviewer_id, review_status, review_note } = data;

  try {
    const sql = `
      UPDATE "REQUESTS"
      SET reviewer_id = $1, review_status = $2, review_note = $3, reviewed_at = NOW()
      WHERE request_id = $4
      RETURNING *;
    `;
    
    const { rows } = await pool.query(sql, [reviewer_id, review_status, review_note, request_id]);
    return rows[0];

  } catch (error) {
    console.error('Error reviewing request:', error);
    throw error;
  }
};

/**
 * Delete a request
 */
export const deleteRequest = async (data) => {
  const { request_id } = data;

  try {
    const sql = 'DELETE FROM "REQUESTS" WHERE request_id = $1 RETURNING request_id';
    const { rows } = await pool.query(sql, [request_id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error deleting request:', error);
    throw error;
  }
};

/**
 * Get request by ID
 */
export const getRequestById = async (data) => {
  const { request_id } = data;

  try {
    const sql = 'SELECT * FROM "REQUESTS" WHERE request_id = $1';
    const { rows } = await pool.query(sql, [request_id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error getting request by id:', error);
    throw error;
  }
};

/**
 * Get requests by Requester ID (My Requests)
 */
export const getRequestsByRequesterId = async (data) => {
  const { requester_id } = data;

  try {
    const sql = 'SELECT * FROM "REQUESTS" WHERE requester_id = $1 ORDER BY request_date DESC';
    const { rows } = await pool.query(sql, [requester_id]);
    
    return rows;

  } catch (error) {
    console.error('Error getting requests by requester:', error);
    throw error;
  }
};

/**
 * Get requests associated with a specific incident
 */
export const getRequestsByIncidentId = async (data) => {
  const { incident_id } = data;

  try {
    const sql = 'SELECT * FROM "REQUESTS" WHERE incident_id = $1';
    const { rows } = await pool.query(sql, [incident_id]);
    
    return rows;

  } catch (error) {
    console.error('Error getting requests by incident:', error);
    throw error;
  }
};

/**
 * Get all pending requests (for Admin Dashboard)
 */
export const getAllUnverifiedRequests = async () => {
  try {
    const sql = 'SELECT * FROM "REQUESTS" WHERE review_status IS NULL OR review_status = \'Unverified\' ORDER BY request_date ASC';
    const { rows } = await pool.query(sql);
    
    return rows;

  } catch (error) {
    console.error('Error getting unverified requests:', error);
    throw error;
  }
};

/**
 * Get ALL requests
 */
export const getAllRequests = async () => {
    try {
      const sql = 'SELECT * FROM "REQUESTS" ORDER BY request_date DESC';
      const { rows } = await pool.query(sql);
      return rows;
    } catch (error) {
      console.error('Error getting all requests:', error);
      throw error;
    }
  };