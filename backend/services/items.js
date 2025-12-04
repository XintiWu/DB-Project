import { pool } from '../db.js';

/**
 * Create items
 */
export const createItem = async (data) => {
  const { 
    item_name, category_id, unit, // ITEMS 
    is_tool, conditions, manufacturer, model, // ITEM_TOOLS 
    expires_in // ITEM_SUPPLIES
  } = data;

  // 1. FETCH CLIENT FROM POOL
  const client = await pool.connect();

  try {
    // 2. BEGIN TRANSACTION
    await client.query('BEGIN');

    // 3. ITEMS
    const insertItemSql = `
      INSERT INTO "ITEMS" (item_name, category_id, unit)
      VALUES ($1, $2, $3)
      RETURNING item_id;
    `;
    const itemResult = await client.query(insertItemSql, [item_name, category_id, unit]);
    const newItemId = itemResult.rows[0].item_id;

    // 4. ITEM_TOOLS
    if (is_tool) {
      const insertToolSql = `
        INSERT INTO "ITEM_TOOLS" (item_id, conditions, manufacturer, model)
        VALUES ($1, $2, $3, $4);
      `;
      await client.query(insertToolSql, [newItemId, conditions, manufacturer, model]);
    }
    else{
        const insertToolSql = `
        INSERT INTO "ITEM_SUPPLIES" (item_id, expires_in)
        VALUES ($1, $2);
      `;
      await client.query(insertToolSql, [newItemId, expires_in]);
    }

    // 5. COMMIT
    await client.query('COMMIT');

    return { item_id: newItemId, message: 'Item created successfully' };

  } catch (error) {
    // 6.1 ERROR, ROLLBACK!
    await client.query('ROLLBACK');
    console.error('Error creating item (Transaction Rollback):', error);
    throw error;

  } finally {
    // 6.2 SUCCESS, RELEASE CLIENT
    client.release();
  }
};

/**
 * Update Item
 */
export const updateItem = async (data) => {
  const { 
    item_id, item_name, category_id, unit,
    is_tool, conditions, manufacturer, model
  } = data;
  
  try {
    const updateItemSql = `
      UPDATE "ITEMS"
      SET item_name = $1, category_id = $2, unit = $3
      WHERE item_id = $4
      RETURNING *;
    `;
    const itemResult = await pool.query(updateItemSql, [item_name, category_id, unit, item_id]);

    if (is_tool) {
      const updateToolSql = `
        UPDATE "ITEM_TOOLS"
        SET conditions = $1, manufacturer = $2, model = $3
        WHERE item_id = $4;
      `;
      await pool.query(updateToolSql, [conditions, manufacturer, model, item_id]);
    }

    return itemResult.rows[0];

  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
};

/**
 * Delete Item
 */
export const deleteItem = async (data) => {
  const { item_id } = data;

  try {
    const sql = 'DELETE FROM "ITEMS" WHERE item_id = $1 RETURNING item_id';
    const { rows } = await pool.query(sql, [item_id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

/** Search Item by item.ID
 */
export const searchItemByItemId = async (data) => {
  const { item_id } = data;

  try {
    const sql = `
      SELECT 
        i.item_id, i.item_name, i.unit,
        c.category_name, c.is_tool as category_is_tool,
        t.conditions, t.manufacturer, t.model
      FROM "ITEMS" i
      LEFT JOIN "ITEM_CATEGORIES" c ON i.category_id = c.category_id
      LEFT JOIN "ITEM_TOOLS" t ON i.item_id = t.item_id
      WHERE i.item_id = $1;
    `;
    
    const { rows } = await pool.query(sql, [item_id]);
    return rows[0];

  } catch (error) {
    console.error('Error searching item by id:', error);
    throw error;
  }
};

/**
 * Get All Items
 */
export const getAllItems = async () => {
    try {
      const sql = `
        SELECT 
          i.item_id, i.item_name, i.unit,
          c.category_name, c.is_tool
        FROM "ITEMS" i
        LEFT JOIN "ITEM_CATEGORIES" c ON i.category_id = c.category_id
        ORDER BY i.item_id ASC
      `;
      const { rows } = await pool.query(sql);
      return rows;
    } catch (error) {
      console.error('Error getting all items:', error);
      throw error;
    }
  };