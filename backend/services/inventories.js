const db = require('../db');

/**
 * Create Inventory
 * 
 * Include: Create Inventory, and create owner relation
 */
const createInventory = async (data) => {
  const { 
    address, // Inventory address
    owner_id // Inventory owner ID
  } = data;

  // 由於涉及兩個步驟 (新增庫存 -> 新增擁有者)，建議使用 Transaction
  // 如果您的 db.js 只有 export query 方法，我們這裡分兩步執行
  // (若需嚴格的 ACID 交易，需要在 db.js 暴露 pool.connect() 來取得 client)
  
  try {
    // 1. CREATE INVENTORY
    const insertInventorySql = `
      INSERT INTO "INVENTORIES" (address)
      VALUES ($1)
      RETURNING inventory_id;
    `;
    const inventoryResult = await db.query(insertInventorySql, [address]); //DB assigns new inventory id
    const newInventory = inventoryResult.rows[0];
    const newInventoryId = newInventory.inventory_id;

    // 2. CREATE OWNER RELATION
    if (owner_id) {
      const insertOwnerSql = `
        INSERT INTO "INVENTORY_OWNERS" (inventory_id, owner_id)
        VALUES ($1, $2);
      `;
      await db.query(insertOwnerSql, [newInventoryId, owner_id]);
    }

    return newInventory;

  } catch (error) {
    console.error('Error creating inventory:', error);
    throw error;
  }
};

/**
Update Inventory Info
 */
const updateInventoryInfo = async (data) => {
  const { inventory_id, address, status } = data;

  try {
    const sql = `
      UPDATE "INVENTORIES"
      SET address = $2, status = $3
      WHERE inventory_id = $1
      RETURNING *;
    `;
    
    const values = [newInventoryId, address, status];
    const { rows } = await db.query(sql, values);
    
    return rows[0]; // 回傳更新後的資料

  } catch (error) {
    console.error('Error updating inventory:', error);
    throw error;
  }
};

/**
 * Delete Inventory
 */
const deleteInventory = async (inventory_id) => {

  try {
    const sql = 'DELETE FROM "INVENTORIES" WHERE inventory_id = $1 RETURNING inventory_id';
    const { rows } = await db.query(sql, [inventory_id]);
    
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
const searchInventoryByInventoryId = async (data) => {
  const { inventory_id } = data;

  try {
    const sql = `
      SELECT i.*, io.owner_id 
      FROM "INVENTORIES" i
        LEFT JOIN "INVENTORY_OWNERS" io ON i.inventory_id = io.inventory_id
      WHERE i.inventory_id = $1;
    `;
    
    const { rows } = await db.query(sql, [inventory_id]);
    return rows; //Inventory list with owner information

  } catch (error) {
    console.error('Error searching inventory:', error);
    throw error;
  }
};

module.exports = {
  createInventory,
  updateInventoryInfo,
  deleteInventory,
  searchInventoryById
};