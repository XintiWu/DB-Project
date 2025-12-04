import { pool } from '../db.js';

/**
 * Get required skills for a request
 */
export const getRescueSkills = async (data) => {
  const { request_id } = data;

  try {
    const sql = 'SELECT * FROM "RESCUE_SKILLS" WHERE request_id = $1';
    const { rows } = await pool.query(sql, [request_id]);
    return rows;
  } catch (error) {
    console.error('Error getting rescue skills:', error);
    throw error;
  }
};

/**
 * Add a required skill tag
 */
export const addRescueSkill = async (data) => {
  const { request_id, skill_tag } = data;

  try {
    const sql = `
      INSERT INTO "RESCUE_SKILLS" (request_id, skill_tag)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const { rows } = await pool.query(sql, [request_id, skill_tag]);
    return rows[0];
  } catch (error) {
    console.error('Error adding rescue skill:', error);
    throw error;
  }
};

/**
 * Remove a required skill tag
 */
export const removeRescueSkill = async (data) => {
  const { request_id, skill_tag } = data;

  try {
    const sql = `
      DELETE FROM "RESCUE_SKILLS" 
      WHERE request_id = $1 AND skill_tag = $2
      RETURNING *;
    `;
    const { rows } = await pool.query(sql, [request_id, skill_tag]);
    return rows[0];
  } catch (error) {
    console.error('Error removing rescue skill:', error);
    throw error;
  }
};