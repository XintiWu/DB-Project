import { pool } from '../db.js';
import { logError } from '../utils/logger.js';

/**
 * Create Inventory
 * 
 * Include: Create Inventory, and create owner relation
 */
export const createInventory = async (data) => {
  const { 
    address, // Inventory address
    owner_id // Inventory owner ID
  } = data;

  // 由於涉及兩個步驟 (新增庫存 -> 新增擁有者)，建議使用 Transaction
  
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. CREATE INVENTORY
    const insertInventorySql = `
      INSERT INTO "INVENTORIES" (address, name, status)
      VALUES ($1, $2, 'Active')
      RETURNING inventory_id;
    `;
    const inventoryResult = await client.query(insertInventorySql, [address, data.name || 'New Warehouse']); //DB assigns new inventory id
    const newInventory = inventoryResult.rows[0];
    const newInventoryId = newInventory.inventory_id;

    // 2. CREATE OWNER RELATION
    if (owner_id) {
      const insertOwnerSql = `
        INSERT INTO "INVENTORY_OWNERS" (inventory_id, user_id)
        VALUES ($1, $2);
      `;
      await client.query(insertOwnerSql, [newInventoryId, owner_id]);
    }

    await client.query('COMMIT');
    return newInventory;

  } catch (error) {
    await client.query('ROLLBACK');
    logError('[Service] createInventory', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
Update Inventory Info
 */
export const updateInventoryInfo = async (data) => {
  const { inventory_id, address, status, name } = data;

  try {
    const sql = `
      UPDATE "INVENTORIES"
      SET address = $2, status = $3, name = $4
      WHERE inventory_id = $1
      RETURNING *;
    `;
    
    const values = [inventory_id, address, status, name];
    const { rows } = await pool.query(sql, values);
    
    return rows[0]; // 回傳更新後的資料

  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};

/**
 * Delete Inventory
 */
export const deleteInventory = async (inventory_id) => {

  try {
    const sql = 'DELETE FROM "INVENTORIES" WHERE inventory_id = $1 RETURNING inventory_id';
    const { rows } = await pool.query(sql, [inventory_id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error deleting inventory:', error);
    throw error;
  }
};

/**
 * Search Inventory by inventory_ID
 * 
 * include: List inventory and owner information
 */
export const searchInventoryByInventoryId = async (data) => {
  const { inventory_id } = data;

  try {
    const sql = `
      SELECT i.*, io.user_id 
      FROM "INVENTORIES" i
        LEFT JOIN "INVENTORY_OWNERS" io ON i.inventory_id = io.inventory_id
      WHERE i.inventory_id = $1;
    `;
    
    const { rows } = await pool.query(sql, [inventory_id]);
    return rows; //Inventory list with owner information

  } catch (error) {
    console.error('Error searching inventory:', error);
    throw error;
  }
};

/**
 * Get All Inventories
 */
export const getAllInventories = async () => {
  try {
    const sql = 'SELECT * FROM "INVENTORIES" ORDER BY inventory_id ASC';
    const { rows } = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error('Error getting all inventories:', error);
    throw error;
  }
};