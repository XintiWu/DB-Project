import { pool } from '../db.js';

/**
 * Create Incident
 */
export const createIncident = async (data) => {
  const { 
    title, type, severity, area_id, reporter_id, 
    status, msg, latitude, longitude 
  } = data;

  // Convert status to valid values: 'Occurring' or 'Solved'
  // Map common status values to valid ones
  const statusMap = {
    'Active': 'Occurring',
    'Occurring': 'Occurring',
    'Solved': 'Solved',
    'Resolved': 'Solved'
  };
  const validStatus = statusMap[status] || 'Occurring';

  // Convert severity string to integer (1-5)
  const severityMap = {
    'Low': 1,
    'Medium': 2,
    'High': 3,
    'Critical': 4,
    'Extreme': 5
  };
  
  let severityInt;
  if (typeof severity === 'string') {
    severityInt = severityMap[severity] || 2; // Default to 2 (Medium) if unknown
  } else if (typeof severity === 'number') {
    severityInt = severity;
  } else {
    severityInt = parseInt(severity) || 2;
  }
  
  // 確保 severityInt 是數字
  if (isNaN(severityInt) || severityInt < 1 || severityInt > 5) {
    console.warn(`[createIncident] Invalid severity value: ${severity}, defaulting to 2`);
    severityInt = 2;
  }
  
  console.log(`[createIncident] Converting severity: "${severity}" (${typeof severity}) -> ${severityInt} (${typeof severityInt})`);
  console.log(`[createIncident] Converting status: "${status}" -> "${validStatus}"`);

  // Prepare values before try block so it's accessible in catch
  const values = [
    title, type, severityInt, area_id, reporter_id, 
    validStatus, msg, latitude, longitude
  ];

  try {
    //latitude, longitude can be null
    const sql = `
      INSERT INTO "INCIDENTS" 
      (title, type, severity, area_id, reporter_id, status, msg, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING *, reported_at as created_at;
    `;
    
    console.log(`[createIncident] SQL values:`, values.map((v, i) => `$${i+1}=${v} (${typeof v})`).join(', '));

    const { rows } = await pool.query(sql, values);
    console.log(`[createIncident] Successfully created incident ID:`, rows[0]?.incident_id);
    return rows[0]; 

  } catch (error) {
    console.error('[createIncident] Error creating incident:', error);
    console.error('[createIncident] Received data:', JSON.stringify({ 
      title, type, severity, severityInt, area_id, reporter_id 
    }, null, 2));
    console.error('[createIncident] SQL values:', values);
    throw error;
  }
};

/**
 * Update Incident
 */
export const updateIncident = async (data) => {
//data should include id and the fields to update
  const { 
    id, title, type, severity, area_id, 
    status, msg, latitude, longitude 
  } = data;

  // Convert severity string to integer (1-5)
  const severityMap = {
    'Low': 1,
    'Medium': 2,
    'High': 3,
    'Critical': 4,
    'Extreme': 5
  };
  const severityInt = typeof severity === 'string' 
    ? (severityMap[severity] || 2)  // Default to 2 (Medium) if unknown
    : parseInt(severity) || 2;

  try {
    const sql = `
      UPDATE "INCIDENTS"
      SET title = $1, type = $2, severity = $3, area_id = $4, 
          status = $5, msg = $6, latitude = $7, longitude = $8
      WHERE incident_id = $9
      RETURNING *, reported_at as created_at;
    `;
    
    const values = [
      title, type, severityInt, area_id, 
      status, msg, latitude, longitude, 
      id
    ];

    const { rows } = await pool.query(sql, values);
    return rows[0];

  } catch (error) {
    console.error('Error updating incident:', error);
    throw error;
  }
};

/**
 * Delete Incident
 */
export const deleteIncident = async (id) => {

  try {
    const sql = 'DELETE FROM "INCIDENTS" WHERE incident_id = $1 RETURNING incident_id';
    const { rows } = await pool.query(sql, [id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error deleting incident:', error);
    throw error;
  }
};

/**
 * Search Incidents by Area ID and Status (Report Function A-1)
 */
export const searchIncidentsByAreaId = async (data) => {
  const { area_id, status } = data;

  try {
    let sql = `
      SELECT i.*, i.reported_at as created_at, a.area_name 
      FROM "INCIDENTS" i
      LEFT JOIN "AREA" a ON i.area_id = a.area_id
      WHERE i.area_id = $1
    `;
    const params = [area_id];
    
    if (status) {
      sql += ' AND i.status = $2';
      params.push(status);
    }

    sql += ' ORDER BY i.reported_at DESC';

    const { rows } = await pool.query(sql, params);
    
    return rows; //Incident list

  } 
  catch (error) {
    console.error('Error searching incidents by area:', error);
    throw error;
  }
};

/**
 * Filter Incidents (General Purpose Filter)
 */
export const filterIncidents = async (filters) => {
    const { area_id, status } = filters;
    try {
        let sql = `
          SELECT i.*, i.reported_at as created_at, a.area_name 
          FROM "INCIDENTS" i
          LEFT JOIN "AREA" a ON i.area_id = a.area_id
          WHERE 1=1
        `;
        const params = [];
        let pIdx = 1;

        if (area_id) {
            sql += ` AND i.area_id = $${pIdx++}`;
            params.push(area_id);
        }
        if (status) {
            sql += ` AND i.status = $${pIdx++}`;
            params.push(status);
        }

        sql += ' ORDER BY i.reported_at DESC';
        
        const { rows } = await pool.query(sql, params);
        return rows;
    } catch (error) {
        console.error('Error filtering incidents:', error);
        throw error;
    }
};

/**
 * Search incidents by Reporter ID
 */
export const searchIncidentsByReporterId = async (data) => {
  const { reporter_id } = data;

  try {
    const sql = `
      SELECT i.*, i.reported_at as created_at, a.area_name 
      FROM "INCIDENTS" i
      LEFT JOIN "AREA" a ON i.area_id = a.area_id
      WHERE i.reporter_id = $1
    `;
    const { rows } = await pool.query(sql, [reporter_id]);
    
    return rows; //Incident list

  } 
  catch (error) {
    console.error('Error searching incidents by reporter:', error);
    throw error;
  }
};

/**
 * Get All Incidents
 */
export const getAllIncidents = async (pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const offset = (page - 1) * limit;

  try {
    // 1. Get total count
    const countSql = 'SELECT COUNT(*) FROM "INCIDENTS"';
    const countResult = await pool.query(countSql);
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    // 2. Get paginated data
    // 2. Get paginated data
    const sql = `
      SELECT i.*, i.reported_at as created_at, a.area_name 
      FROM "INCIDENTS" i
      LEFT JOIN "AREA" a ON i.area_id = a.area_id
      ORDER BY i.reported_at DESC 
      LIMIT $1 OFFSET $2
    `;
    const { rows } = await pool.query(sql, [limit, offset]);
    
    return {
      data: rows,
      meta: {
        totalItems,
        totalPages,
        currentPage: parseInt(page, 10),
        itemsPerPage: parseInt(limit, 10)
      }
    };
  } catch (error) {
    console.error('Error getting all incidents:', error);
    throw error;
  }
};

/**
 * Get Incident by ID
 */
export const getIncidentById = async (id) => {
  try {
    const sql = `
      SELECT i.*, i.reported_at as created_at, a.area_name 
      FROM "INCIDENTS" i
      LEFT JOIN "AREA" a ON i.area_id = a.area_id
      WHERE i.incident_id = $1
    `;
    const { rows } = await pool.query(sql, [id]);
    return rows[0];
  } catch (error) {
    console.error('Error getting incident by id:', error);
    throw error;
  }
};

/**
 * Review Incident
 */
export const reviewIncident = async (data) => {
  const { incident_id, reviewer_id, review_status, review_note } = data;

  try {
    const sql = `
      UPDATE "INCIDENTS"
      SET reviewer_id = $1, review_status = $2, review_note = $3, reviewed_at = NOW()
      WHERE incident_id = $4
      RETURNING *;
    `;
    
    const { rows } = await pool.query(sql, [reviewer_id, review_status, review_note, incident_id]);
    return rows[0];

  } catch (error) {
    console.error('Error reviewing incident:', error);
    throw error;
  }
};

/**
 * Get all unverified incidents
 */
export const getAllUnverifiedIncidents = async (pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const offset = (page - 1) * limit;

  try {
    // 1. Get total count
    const countSql = `SELECT COUNT(*) FROM "INCIDENTS" WHERE review_status IS NULL OR review_status = 'Unverified'`;
    const countResult = await pool.query(countSql);
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    // 2. Get paginated data
    // 2. Get paginated data
    const sql = `
      SELECT i.*, i.reported_at as created_at, a.area_name 
      FROM "INCIDENTS" i
      LEFT JOIN "AREA" a ON i.area_id = a.area_id
      WHERE i.review_status IS NULL OR i.review_status = 'Unverified'
      ORDER BY i.reported_at ASC 
      LIMIT $1 OFFSET $2
    `;
    const { rows } = await pool.query(sql, [limit, offset]);
    
    return {
      data: rows,
      meta: {
        totalItems,
        totalPages,
        currentPage: parseInt(page, 10),
        itemsPerPage: parseInt(limit, 10)
      }
    };
  } catch (error) {
    console.error('Error getting unverified incidents:', error);
    throw error;
  }
};