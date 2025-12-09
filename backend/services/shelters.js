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
export const getAllShelters = async (params = {}) => {
  const { page = 1, limit = 10, keyword } = params;
  const offset = (page - 1) * limit;

  try {
    let whereClause = '';
    let values = [];
    if (keyword) {
      whereClause = 'WHERE (name ILIKE $1 OR address ILIKE $1)';
      values.push(`%${keyword}%`);
    }

    // 1. Get Count
    const countSql = `SELECT COUNT(*) FROM "SHELTERS" ${whereClause}`;
    const countResult = await pool.query(countSql, values);
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    // 2. Get Data
    // Adjust indices for LIMIT/OFFSET
    const limitIdx = values.length + 1;
    const offsetIdx = values.length + 2;
    const sql = `SELECT * FROM "SHELTERS" ${whereClause} ORDER BY shelter_id ASC LIMIT $${limitIdx} OFFSET $${offsetIdx}`;
    
    const { rows } = await pool.query(sql, [...values, limit, offset]);
    
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
    console.error('Error getting all shelters:', error);
    throw error;
  }
};

/**
 * Search Nearby Shelters by Location (Haversine Formula)
 * 查詢附近避難所（依地理位置）
 */
export const searchNearbyShelters = async (data) => {
  const { latitude, longitude, limit = 10 } = data;

  if (!latitude || !longitude) {
    throw new Error('經緯度座標為必填');
  }

  try {
    const sql = `
      SELECT
        shelter_id,
        name,
        address,
        phone,
        capacity,
        type,
        latitude,
        longitude,
        ROUND(
          6371 * acos(
            cos(radians($1)) *
            cos(radians(latitude)) *
            cos(radians(longitude) - radians($2)) +
            sin(radians($1)) *
            sin(radians(latitude))
          )::numeric, 2
        ) AS distance_km
      FROM "SHELTERS"
      WHERE latitude IS NOT NULL
      AND longitude IS NOT NULL
      ORDER BY distance_km ASC
      LIMIT $3;
    `;
    
    const { rows } = await pool.query(sql, [latitude, longitude, limit]);
    
    return rows;

  } catch (error) {
    console.error('Error searching nearby shelters:', error);
    throw error;
  }
};