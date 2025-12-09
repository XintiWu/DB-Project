import { pool } from '../db.js';

/**
 * Create Incident
 */
export const createIncident = async (data) => {
  const { 
    title, type, severity, area_id, reporter_id, 
    address, status, msg, latitude, longitude 
  } = data;

  try {
    //latitude, longitude can be null
    const sql = `
      INSERT INTO "INCIDENTS" 
      (title, type, severity, area_id, reporter_id, address, status, msg, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *, reported_at as created_at;
    `;

    const values = [
      title, type, severity, area_id, reporter_id, 
      address, status, msg, latitude, longitude
    ];

    const { rows } = await pool.query(sql, values);
    return rows[0]; 

  } catch (error) {
    console.error('Error creating incident:', error);
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

  try {
    const sql = `
      UPDATE "INCIDENTS"
      SET title = $1, type = $2, severity = $3, area_id = $4, 
          address = $5, status = $6, msg = $7, latitude = $8, longitude = $9
      WHERE incident_id = $10
      RETURNING *, reported_at as created_at;
    `;
    
    const values = [
      title, type, severity, area_id, 
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
    const sql = 'SELECT *, reported_at as created_at FROM "INCIDENTS" ORDER BY reported_at DESC LIMIT $1 OFFSET $2';
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
    const sql = 'SELECT *, reported_at as created_at FROM "INCIDENTS" WHERE incident_id = $1';
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
    const sql = `
      SELECT *, reported_at as created_at 
      FROM "INCIDENTS" 
      WHERE review_status IS NULL OR review_status = 'Unverified'
      ORDER BY reported_at ASC 
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