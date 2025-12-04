import { pool } from '../db.js';

/**
 * Create a new item category
 */
export const createItemCategory = async (data) => {
  const { category_name, is_tool } = data;

  try {
    const sql = `
      INSERT INTO "ITEM_CATEGORIES" (category_name, is_tool)
      VALUES ($1, $2)
      RETURNING *;
    `;
    
    const { rows } = await pool.query(sql, [category_name, is_tool]);
    return rows[0];

  } catch (error) {
    console.error('Error creating item category:', error);
    throw error;
  }
};

/**
 * Update an item category
 */
export const updateItemCategory = async (data) => {
  const { category_id, category_name, is_tool } = data;

  try {
    const sql = `
      UPDATE "ITEM_CATEGORIES"
      SET category_name = $1, is_tool = $2
      WHERE category_id = $3
      RETURNING *;
    `;
    
    const { rows } = await pool.query(sql, [category_name, is_tool, category_id]);
    return rows[0];

  } catch (error) {
    console.error('Error updating item category:', error);
    throw error;
  }
};

/**
 * Delete an item category
 */
export const deleteItemCategory = async (data) => {
  const { category_id } = data;

  try {
    const sql = 'DELETE FROM "ITEM_CATEGORIES" WHERE category_id = $1 RETURNING category_id';
    const { rows } = await pool.query(sql, [category_id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error deleting item category:', error);
    throw error;
  }
};

/**
 * Get all item categories
 * Useful for filling dropdown menus in the frontend
 */
export const getAllItemCategories = async () => {
  try {
    const sql = 'SELECT * FROM "ITEM_CATEGORIES" ORDER BY category_id ASC';
    const { rows } = await pool.query(sql);
    
    return rows;

  } catch (error) {
    console.error('Error getting all item categories:', error);
    throw error;
  }
};

/**
 * Get specific category by ID
 */
export const getItemCategoryById = async (data) => {
  const { category_id } = data;

  try {
    const sql = 'SELECT * FROM "ITEM_CATEGORIES" WHERE category_id = $1';
    const { rows } = await pool.query(sql, [category_id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error getting item category by id:', error);
    throw error;
  }
};