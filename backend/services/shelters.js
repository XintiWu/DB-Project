import { pool } from '../db.js';

/**
 * Create Shelter
 */
export const createShelter = async (data) => {
  const { 
    name, address, phone, capacity, type, 
    latitude, longitude, area_id 
  } = data;

  try {
    const sql = `
      INSERT INTO "SHELTERS" 
      (name, address, phone, capacity, type, latitude, longitude, area_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    
    const values = [name, address, phone, capacity, type, latitude, longitude, area_id];
    const { rows } = await pool.query(sql, values);

    return rows[0];

  } catch (error) {
    console.error('Error creating shelter:', error);
    throw error;
  }
};

/**
 * Update Shelter
 */
export const updateShelter = async (data) => {
  const { 
    shelter_id, // Primary Key
    name, address, phone, capacity, type, 
    latitude, longitude, area_id 
  } = data;

  try {
    const sql = `
      UPDATE "SHELTERS"
      SET name = $1, address = $2, phone = $3, capacity = $4, type = $5, 
          latitude = $6, longitude = $7, area_id = $8
      WHERE shelter_id = $9
      RETURNING *;
    `;

    const values = [
      name, address, phone, capacity, type, 
      latitude, longitude, area_id, 
      shelter_id
    ];

    const { rows } = await pool.query(sql, values);
    
    return rows[0];

  } catch (error) {
    console.error('Error updating shelter:', error);
    throw error;
  }
};

/**
 * Delete Shelter
 */
export const deleteShelter = async (data) => {
  const { shelter_id } = data;

  try {
    const sql = 'DELETE FROM "SHELTERS" WHERE shelter_id = $1 RETURNING shelter_id';
    const { rows } = await pool.query(sql, [shelter_id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error deleting shelter:', error);
    throw error;
  }
};

/**
 * Search Shelter by ID
 */
export const searchShelterById = async (data) => {
  const { shelter_id } = data;

  try {
    const sql = 'SELECT * FROM "SHELTERS" WHERE shelter_id = $1';
    const { rows } = await pool.query(sql, [shelter_id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error searching shelter by id:', error);
    throw error;
  }
};

/**
 * Search Shelters by Area ID
 */
export const searchSheltersByAreaId = async (data) => {
  const { area_id } = data;

  try {
    const sql = 'SELECT * FROM "SHELTERS" WHERE area_id = $1';
    const { rows } = await pool.query(sql, [area_id]);
    
    return rows;

  } catch (error) {
    console.error('Error searching shelters by area:', error);
    throw error;
  }
};

/**
 * Get All Shelters
 */
export const getAllShelters = async () => {
  try {
    const sql = 'SELECT * FROM "SHELTERS"';
    const { rows } = await pool.query(sql);
    
    return rows;

  } catch (error) {
    console.error('Error getting all shelters:', error);
    throw error;
  }
};