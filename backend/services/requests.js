import { pool } from '../db.js';

const BASE_QUERY = `
  SELECT 
    r.*,
    (
      SELECT json_agg(json_build_object(
        'item_id', rm.item_id,
        'item_name', i.item_name,
        'qty', rm.qty,
        'unit', i.unit,
        'category', ic.category_name
      ))
      FROM "REQUEST_MATERIALS" rm
      JOIN "ITEMS" i ON rm.item_id = i.item_id
      LEFT JOIN "ITEM_CATEGORIES" ic ON i.category_id = ic.category_id
      WHERE rm.request_id = r.request_id
    ) AS material_items,
    (
      SELECT json_agg(json_build_object(
        'skill_tag_id', rh.skill_tag_id,
        'skill_name', st.skill_tag_name,
        'qty', rh.qty
      ))
      FROM "REQUEST_HUMANPOWER" rh
      JOIN "SKILL_TAGS" st ON rh.skill_tag_id = st.skill_tag_id
      WHERE rh.request_id = r.request_id
    ) AS required_skills,
    (
      SELECT json_agg(json_build_object(
        'equipment_id', re.required_equipment,
        'equipment_name', i.item_name,
        'qty', re.qty
      ))
      FROM "REQUEST_EQUIPMENTS" re
      JOIN "ITEMS" i ON re.required_equipment = i.item_id
      WHERE re.request_id = r.request_id
    ) AS required_equipments,
    u.username as requester_name
  FROM "REQUESTS" r
  LEFT JOIN "USERS" u ON r.requester_id = u.user_id
`;

/**
 * Create a new request with type-specific details
 */
export const createRequest = async (data) => {
  const { 
    requester_id, incident_id, status, urgency, type, 
    address, latitude, longitude, title,
    // Type-specific data fields:
    items,       // Array of { item_id, qty } for 'item' type
    headcount,   // Integer for 'rescue' type
    skills,      // Array of skill_tags (IDs) for 'rescue' type
    equipments   // Array of { required_equipment, qty } for 'rescue' type
  } = data;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Calculate required_qty based on inputs
    let requiredQty = 0;
    if (items && items.length > 0) {
      requiredQty = items.reduce((acc, item) => acc + (item.qty || 0), 0);
    } else if (headcount) {
      requiredQty = headcount;
    } else if (skills && skills.length > 0) {
      // If skills is array of IDs, we assume qty 1 per skill? Or skills object has qty?
      // Frontend sends array of IDs usually. Let's assume 1 per skill if simple array.
      // But parseNeed expects { quantity }.
      // Let's assume input 'skills' is array of { skill_tag_id, qty } or just IDs.
      // For now, use headcount if available, else 0.
      requiredQty = headcount || 0;
    }

    // 1. Insert into base REQUESTS table
    const insertRequestSql = `
      INSERT INTO "REQUESTS" 
      (requester_id, incident_id, status, urgency, type, address, latitude, longitude, required_qty, current_qty, title)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, $10)
      RETURNING request_id, created_at;
    `;
    
    const requestValues = [
      requester_id, incident_id, status, urgency, type, 
      address, latitude, longitude, requiredQty, title
    ];
    
    const requestResult = await client.query(insertRequestSql, requestValues);
    const newRequest = requestResult.rows[0];
    const newRequestId = newRequest.request_id;

    // 2. Handle 'item' type logic (Material)
    if ((type === 'Material' || type === 'item' || type === 'material') && items && items.length > 0) {
      const insertItemSql = `
        INSERT INTO "REQUEST_MATERIALS" (request_id, item_id, qty)
        VALUES ($1, $2, $3)
      `;
      for (const item of items) {
        await client.query(insertItemSql, [newRequestId, item.item_id, item.qty]);
      }
    }

    // 3. Handle 'rescue' type logic (Humanpower / Tool)
    else if (type === 'Humanpower' || type === 'rescue' || type === 'manpower' || type === 'Tool' || type === 'tool') {
      
      // 3a. Insert into REQUEST_HUMANPOWER
      if (skills && skills.length > 0) {
        const insertSkillSql = `
          INSERT INTO "REQUEST_HUMANPOWER" (request_id, skill_tag_id, qty)
          VALUES ($1, $2, $3)
        `;
        // Check if skills are objects or IDs
        for (const skill of skills) {
          const skillId = typeof skill === 'object' ? skill.skill_tag_id : skill;
          const qty = typeof skill === 'object' ? (skill.qty || 1) : 1;
          await client.query(insertSkillSql, [newRequestId, skillId, qty]);
        }
      }

      // 3b. Insert into REQUEST_EQUIPMENTS
      if (equipments && equipments.length > 0) {
        const insertEquipSql = `
          INSERT INTO "REQUEST_EQUIPMENTS" (request_id, required_equipment, qty)
          VALUES ($1, $2, $3)
        `;
        for (const equip of equipments) {
          await client.query(insertEquipSql, [
            newRequestId, 
            equip.required_equipment, 
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
 * Update general request info
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
 * Process/Review a request
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
    const sql = `${BASE_QUERY} WHERE r.request_id = $1`;
    const { rows } = await pool.query(sql, [request_id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error getting request by id:', error);
    throw error;
  }
};

/**
 * Get requests by Requester ID
 */
export const getRequestsByRequesterId = async (data) => {
  const { requester_id } = data;

  try {
    const sql = `${BASE_QUERY} WHERE r.requester_id = $1 ORDER BY r.created_at DESC`;
    const { rows } = await pool.query(sql, [requester_id]);
    
    return rows;

  } catch (error) {
    console.error('Error getting requests by requester:', error);
    throw error;
  }
};

/**
 * Get requests by Incident ID
 */
export const getRequestsByIncidentId = async (data) => {
  const { incident_id } = data;

  try {
    const sql = `${BASE_QUERY} WHERE r.incident_id = $1 ORDER BY r.created_at DESC`;
    const { rows } = await pool.query(sql, [incident_id]);
    
    return rows;

  } catch (error) {
    console.error('Error getting requests by incident:', error);
    throw error;
  }
};

/**
 * Get all pending requests
 */
export const getAllUnverifiedRequests = async () => {
  try {
    const sql = `${BASE_QUERY} WHERE r.review_status IS NULL OR r.review_status = 'Unverified' ORDER BY r.created_at ASC`;
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
      const sql = `${BASE_QUERY} ORDER BY r.created_at DESC`;
      const { rows } = await pool.query(sql);
      return rows;
    } catch (error) {
      console.error('Error getting all requests:', error);
      throw error;
    }
  };