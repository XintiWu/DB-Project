import { pool } from '../db.js';

/**
 * Create tool details for an existing item
 * Table: ITEM_TOOLS
 * Note: Usually called within createItem transaction, but useful for standalone logic.
 */
export const createItemTool = async (data) => {
  const { item_id, conditions, manufacturer, model } = data;

  try {
    const sql = `
      INSERT INTO "ITEM_TOOLS" (item_id, conditions, manufacturer, model)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    
    const { rows } = await pool.query(sql, [item_id, conditions, manufacturer, model]);
    return rows[0];

  } catch (error) {
    console.error('Error creating item tool:', error);
    throw error;
  }
};

/**
 * Update tool specific details
 */
export const updateItemTool = async (data) => {
  const { item_id, conditions, manufacturer, model } = data;

  try {
    const sql = `
      UPDATE "ITEM_TOOLS"
      SET conditions = $1, manufacturer = $2, model = $3
      WHERE item_id = $4
      RETURNING *;
    `;
    
    const { rows } = await pool.query(sql, [conditions, manufacturer, model, item_id]);
    return rows[0];

  } catch (error) {
    console.error('Error updating item tool:', error);
    throw error;
  }
};

/**
 * Get tool details by Item ID
 */
export const getItemToolByItemId = async (data) => {
  const { item_id } = data;

  try {
    const sql = 'SELECT * FROM "ITEM_TOOLS" WHERE item_id = $1';
    const { rows } = await pool.query(sql, [item_id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error getting item tool by id:', error);
    throw error;
  }
};

/**
 * Delete tool details
 * Note: Deleting the parent Item usually deletes this automatically via Cascade.
 */
export const deleteItemTool = async (data) => {
  const { item_id } = data;

  try {
    const sql = 'DELETE FROM "ITEM_TOOLS" WHERE item_id = $1 RETURNING item_id';
    const { rows } = await pool.query(sql, [item_id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error deleting item tool:', error);
    throw error;
  }
};

/**
 * Get All Item Tools
 */
export const getAllItemTools = async () => {
  try {
    const sql = 'SELECT * FROM "ITEM_TOOLS"';
    const { rows } = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error('Error getting all item tools:', error);
    throw error;
  }
};