import { pool } from '../db.js';

/**
 * Add Inventory Item
 */
export const addInventoryItem = async (data) => {
    const { inventory_id, item_id, qty, status = 'Owned' } = data;
  
    try {
      const sql = `
        INSERT INTO "INVENTORY_ITEMS" (inventory_id, item_id, qty, status)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT ON CONSTRAINT "INVENTORY_ITEMS_pkey"
        DO UPDATE SET 
            qty = "INVENTORY_ITEMS".qty + EXCLUDED.qty,
            updated_at = NOW()
        RETURNING *;
      `;
      
      const values = [inventory_id, item_id, qty, status];
  
      const { rows } = await pool.query(sql, values);
      
      return rows[0]; // Returning inserted/updated Inventory item 
  
    } catch (error) {
      console.error('Error adding inventory item:', error);
      throw error;
    }
  };

/**
 * Update Inventory Item
 */
export const updateInventoryItem = async (data) => {
  const { inventory_id, item_id, qty, updated_at, status } = data;
  
  try {
    const sql = `
      UPDATE "INVENTORY_ITEMS"
      SET qty = $3, updated_at = $4, status = $5
      WHERE inventory_id = $1 AND item_id = $2 AND status = $5
      RETURNING *;
    `;
    
    // 參數順序必須對應上面的 $1, $2, $3...
    const values = [inventory_id, item_id, qty, updated_at, status];

    const { rows } = await pool.query(sql, values);
    
    return rows[0]; // 回傳更新後的那筆資料

  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
};

/**
 * Delete Inventory Item
 */
export const deleteInventoryItem = async (inventory_id, item_id, status = 'Owned') => { 
  
  try {
    const sql = 'DELETE FROM "INVENTORY_ITEMS" WHERE inventory_id = $1 AND item_id = $2 AND status = $3 RETURNING inventory_id';
    
    const { rows } = await pool.query(sql, [inventory_id, item_id, status]);
    
    return rows[0];

  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
};

/**
 * Search Inventory Items by Category
 *  ============================================
 *  This approach might a little bit slow :( 
 *  Maybe denormalize the table in the future?
 *  ============================================
 */
 export const searchInventoryItemsByCategory = async (data) => {
  const { inventory_id, category_id } = data;

  try {
    // 假設 ITEMS 表格裡有 category_id 欄位
    const sql = `
      SELECT 
        i.*,                
        ic.category_name,   
        inv_i.qty,          
        inv_i.updated_at    
      FROM "INVENTORY_ITEMS" inv_i
      JOIN "ITEMS" i ON inv_i.item_id = i.item_id
      JOIN "ITEM_CATEGORIES" ic ON i.category_id = ic.category_id
      WHERE inv_i.inventory_id = $1 
        AND ic.category_id = $2
    `;
    
    const { rows } = await pool.query(sql, [inventory_id, category_id]);
    
    return rows;

  } catch (error) {
    console.error('Error searching inventory items by category:', error);
    throw error;
  }
};

/**
 * Get Inventory Items by Inventory ID
 */
export const getInventoryItemsByInventoryId = async (inventory_id, status = null) => {
  try {
    let sql = `
      SELECT 
        inv_i.inventory_id,
        inv_i.item_id,
        inv_i.qty,
        inv_i.updated_at,
        inv_i.status,
        i.item_name,
        i.unit,
        ic.category_name
      FROM "INVENTORY_ITEMS" inv_i
      JOIN "ITEMS" i ON inv_i.item_id = i.item_id
      LEFT JOIN "ITEM_CATEGORIES" ic ON i.category_id = ic.category_id
      WHERE inv_i.inventory_id = $1
    `;
    
    const params = [inventory_id];
    if (status) {
        sql += ` AND inv_i.status = $2`;
        params.push(status);
    }
    
    console.log('[DEBUG] getInventoryItemsByInventoryId', { inventory_id, status, params, sql });
    
    const { rows } = await pool.query(sql, params);
    
    console.log('[DEBUG] getInventoryItemsByInventoryId result:', rows.length, 'rows');
    return rows;
  } catch (error) {
    console.error('Error getting inventory items by inventory id:', error);
    throw error;
  }
};