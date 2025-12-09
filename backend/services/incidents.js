import { pool } from '../db.js';

/**
 * Create Incident
 */
export const createIncident = async (data) => {
  const { 
    title, type, severity, area_id, reporter_id, 
    address, status, msg, latitude, longitude 
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
    address, validStatus, msg, latitude, longitude
  ];

  try {
    //latitude, longitude can be null
    const sql = `
      INSERT INTO "INCIDENTS" 
      (title, type, severity, area_id, reporter_id, address, status, msg, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
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
    address, status, msg, latitude, longitude 
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
          address = $5, status = $6, msg = $7, latitude = $8, longitude = $9
      WHERE incident_id = $10
      RETURNING *, reported_at as created_at;
    `;
    
    const values = [
      title, type, severityInt, area_id, 
      address, status, msg, latitude, longitude, 
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
 * Search Incidents by Area ID
 */
export const searchIncidentsByAreaId = async (data) => {
  const { area_id } = data;

  try {
    const sql = 'SELECT *, reported_at as created_at FROM "INCIDENTS" WHERE area_id = $1';
    const { rows } = await pool.query(sql, [area_id]);
    
    return rows; //Incident list

  } catch (error) {
    console.error('Error searching incidents by area:', error);
    throw error;
  }
};

/**
 * Search incidents by Reporter ID
 */
export const searchIncidentsByReporterId = async (data) => {
  const { reporter_id } = data;

  try {
    const sql = 'SELECT *, reported_at as created_at FROM "INCIDENTS" WHERE reporter_id = $1';
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
export const getAllIncidents = async () => {
  try {
    const sql = 'SELECT *, reported_at as created_at FROM "INCIDENTS" ORDER BY reported_at DESC';
    const { rows } = await pool.query(sql);
    return rows;
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
    const sql = 'SELECT *, reported_at as created_at FROM "INCIDENTS" WHERE incident_id = $1';
    const { rows } = await pool.query(sql, [id]);
    return rows[0];
  } catch (error) {
    console.error('Error getting incident by id:', error);
    throw error;
  }
};