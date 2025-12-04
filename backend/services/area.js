import { pool } from '../db.js';

/**
 * Get All Areas
 */
export const getAllAreas = async () => {
  try {
    const sql = 'SELECT * FROM "AREA" ORDER BY area_id ASC';
    const { rows } = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error('Error getting all areas:', error);
    throw error;
  }
};

/**
 * Get Area by ID
 */
export const getAreaById = async (data) => {
  const { area_id } = data;
  try {
    const sql = 'SELECT * FROM "AREA" WHERE area_id = $1';
    const { rows } = await pool.query(sql, [area_id]);
    return rows[0];
  } catch (error) {
    console.error('Error getting area by id:', error);
    throw error;
  }
};

/**
 * Create Area
 */
export const createArea = async (data) => {
  const { name, description } = data; // Assuming columns
  try {
    const sql = `
      INSERT INTO "AREA" (name, description)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const { rows } = await pool.query(sql, [name, description]);
    return rows[0];
  } catch (error) {
    console.error('Error creating area:', error);
    throw error;
  }
};

/**
 * Update Area
 */
export const updateArea = async (data) => {
  const { area_id, name, description } = data;
  try {
    const sql = `
      UPDATE "AREA"
      SET name = $1, description = $2
      WHERE area_id = $3
      RETURNING *;
    `;
    const { rows } = await pool.query(sql, [name, description, area_id]);
    return rows[0];
  } catch (error) {
    console.error('Error updating area:', error);
    throw error;
  }
};

/**
 * Delete Area
 */
export const deleteArea = async (data) => {
  const { area_id } = data;
  try {
    const sql = 'DELETE FROM "AREA" WHERE area_id = $1 RETURNING area_id';
    const { rows } = await pool.query(sql, [area_id]);
    return rows[0];
  } catch (error) {
    console.error('Error deleting area:', error);
    throw error;
  }
};
