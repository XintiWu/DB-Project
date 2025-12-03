const db = require('../db'); 

/**
 * Create Incident
 */
const createIncident = async (data) => {
  const { 
    title, type, severity, area_id, reporter_id, 
    address, status, msg, latitude, longitude 
  } = data;

  try {
    //latitude, longitude can be null
    const sql = `
      INSERT INTO "INCIDENTS" 
      (title, type, severity, area_id, reporter_id, address, status, msg, latitude, longitude)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *;
    `;

    const values = [
      title, type, severity, area_id, reporter_id, 
      address, status, msg, latitude, longitude
    ];

    const { rows } = await db.query(sql, values);
    return rows[0]; 

  } catch (error) {
    console.error('Error creating incident:', error);
    throw error;
  }
};

/**
 * Update Incident
 */
const updateIncident = async (data) => {
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
      WHERE id = $10
      RETURNING *;
    `;
    
    const values = [
      title, type, severity, area_id, 
      address, status, msg, latitude, longitude, 
      id
    ];

    const { rows } = await db.query(sql, values);
    return rows[0];

  } catch (error) {
    console.error('Error updating incident:', error);
    throw error;
  }
};

/**
 * Delete Incident
 */
const deleteIncident = async (id) => {

  try {
    const sql = 'DELETE FROM "INCIDENTS" WHERE id = $1 RETURNING id';
    const { rows } = await db.query(sql, [id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error deleting incident:', error);
    throw error;
  }
};

/**
 * Search Incidents by Area ID
 */
const searchIncidentsByAreaId = async (data) => {
  const { area_id } = data;

  try {
    const sql = 'SELECT * FROM "INCIDENTS" WHERE area_id = $1';
    const { rows } = await db.query(sql, [area_id]);
    
    return rows; //Incident list

  } catch (error) {
    console.error('Error searching incidents by area:', error);
    throw error;
  }
};

/**
 * Search incidents by Reporter ID
 */
const searchIncidentsByReporterId = async (data) => {
  const { reporter_id } = data;

  try {
    const sql = 'SELECT * FROM "INCIDENTS" WHERE reporter_id = $1';
    const { rows } = await db.query(sql, [reporter_id]);
    
    return rows; //Incident list

  } 
  catch (error) {
    console.error('Error searching incidents by reporter:', error);
    throw error;
  }
};