import { pool } from '../db.js';

/**
 * Get All Skill Tags
 */
export const getAllSkillTags = async () => {
  try {
    const sql = 'SELECT * FROM "SKILL_TAGS" ORDER BY skill_tag_id ASC';
    const { rows } = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error('Error getting all skill tags:', error);
    throw error;
  }
};
