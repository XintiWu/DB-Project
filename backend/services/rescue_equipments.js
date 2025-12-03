import { pool } from '../db.js';

/**
 * Get required equipment for a request
 */
export const getRescueEquipments = async (data) => {
  const { request_id } = data;

  try {
    const sql = 'SELECT * FROM "RESCUE_EQUIPMENTS" WHERE request_id = $1';
    const { rows } = await pool.query(sql, [request_id]);
    return rows;
  } catch (error) {
    console.error('Error getting rescue equipments:', error);
    throw error;
  }
};

/**
 * Add required equipment
 */
export const addRescueEquipment = async (data) => {
  const { request_id, required_equipment, qty } = data;

  try {
    const sql = `
      INSERT INTO "RESCUE_EQUIPMENTS" (request_id, required_equipment, qty)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await pool.query(sql, [request_id, required_equipment, qty]);
    return rows[0];
  } catch (error) {
    console.error('Error adding rescue equipment:', error);
    throw error;
  }
};

/**
 * Update equipment quantity
 */
export const updateRescueEquipmentQty = async (data) => {
  const { request_id, required_equipment, qty } = data;

  try {
    const sql = `
      UPDATE "RESCUE_EQUIPMENTS"
      SET qty = $1
      WHERE request_id = $2 AND required_equipment = $3
      RETURNING *;
    `;
    const { rows } = await pool.query(sql, [qty, request_id, required_equipment]);
    return rows[0];
  } catch (error) {
    console.error('Error updating rescue equipment qty:', error);
    throw error;
  }
};

/**
 * Remove required equipment
 */
export const removeRescueEquipment = async (data) => {
  const { request_id, required_equipment } = data;

  try {
    const sql = `
      DELETE FROM "RESCUE_EQUIPMENTS" 
      WHERE request_id = $1 AND required_equipment = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(sql, [request_id, required_equipment]);
    return rows[0];
  } catch (error) {
    console.error('Error removing rescue equipment:', error);
    throw error;
  }
};