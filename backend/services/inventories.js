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
      VALUES ($1, $2, $3)
      RETURNING inventory_id;
    `;
    const finalStatus = data.status || 'Private';
    const inventoryResult = await client.query(insertInventorySql, [address, data.name || 'New Warehouse', finalStatus]); //DB assigns new inventory id
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
 * Transfer inventory item from one warehouse to another (Donation/Transfer)
 */
export const transferInventory = async (data) => {
  const { from_inventory_id, to_inventory_id, item_id, qty } = data;

  if (from_inventory_id == to_inventory_id) {
    throw new Error('來源與目的倉庫不能相同');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const checkSourceSql = `
      SELECT qty FROM "INVENTORY_ITEMS"
      WHERE inventory_id = $1 AND item_id = $2
      FOR UPDATE;
    `;
    const sourceRes = await client.query(checkSourceSql, [from_inventory_id, item_id]);

    if (sourceRes.rows.length === 0 || sourceRes.rows[0].qty < qty) {
      throw new Error(`來源倉庫庫存不足 (目前: ${sourceRes.rows.length > 0 ? sourceRes.rows[0].qty : 0})`);
    }

    // 1.5 Check Target Inventory Exists
    const checkTargetInvSql = 'SELECT inventory_id FROM "INVENTORIES" WHERE inventory_id = $1';
    const targetInvRes = await client.query(checkTargetInvSql, [to_inventory_id]);
    if (targetInvRes.rows.length === 0) {
        throw new Error(`目標倉庫 ID (${to_inventory_id}) 不存在`);
    }

    // 2. Deduct from Source
    const deductSql = `
      UPDATE "INVENTORY_ITEMS"
      SET qty = qty - $1, updated_at = NOW()
      WHERE inventory_id = $2 AND item_id = $3;
    `;
    await client.query(deductSql, [qty, from_inventory_id, item_id]);

    // 3. Add to Target (UPSERT)
    // Check if item exists in target
    const checkTargetSql = `
      SELECT qty FROM "INVENTORY_ITEMS"
      WHERE inventory_id = $1 AND item_id = $2;
    `;
    const targetRes = await client.query(checkTargetSql, [to_inventory_id, item_id]);

    if (targetRes.rows.length > 0) {
      const updateTargetSql = `
        UPDATE "INVENTORY_ITEMS"
        SET qty = qty + $1, updated_at = NOW()
        WHERE inventory_id = $2 AND item_id = $3;
      `;
      await client.query(updateTargetSql, [qty, to_inventory_id, item_id]);
    } else {
      const insertTargetSql = `
        INSERT INTO "INVENTORY_ITEMS" (inventory_id, item_id, qty, updated_at, status)
        VALUES ($1, $2, $3, NOW(), 'Owned');
      `;
      await client.query(insertTargetSql, [to_inventory_id, item_id, qty]);
    }

    await client.query('COMMIT');
    return { success: true, message: `Successfully transferred ${qty} of item ${item_id} from ${from_inventory_id} to ${to_inventory_id}` };

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error transferring inventory:', error);
    logError('[Service] transferInventory', error); // Ensure it goes to file
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get All Inventories
 */
export const getAllInventories = async (pagination = {}) => {
  const { page = 1, limit = 10 } = pagination;
  const offset = (page - 1) * limit;

  try {
    // 1. Get total count
    const countSql = 'SELECT COUNT(*) FROM "INVENTORIES" WHERE status = \'Public\'';
    const countResult = await pool.query(countSql);
    const totalItems = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalItems / limit);

    // 2. Get paginated data
    // debug log
    console.log(`Fetching inventories page ${page}, limit ${limit}`);
    
    const sql = `
      SELECT i.*, CAST(COALESCE(SUM(ii.qty), 0) AS INTEGER) as total_qty
      FROM "INVENTORIES" i
      LEFT JOIN "INVENTORY_ITEMS" ii ON i.inventory_id = ii.inventory_id AND ii.status = 'Owned'
      WHERE i.status = 'Public'
      GROUP BY i.inventory_id
      ORDER BY total_qty DESC, i.inventory_id ASC
      LIMIT $1 OFFSET $2
    `;
    const { rows } = await pool.query(sql, [limit, offset]);
    if (rows.length > 0) {
        console.log('First inventory total_qty:', rows[0].total_qty);
        console.log('Last inventory total_qty:', rows[rows.length-1].total_qty);
    }
    
    return {
      data: rows,
      meta: {
        totalItems,
        totalPages,
        currentPage: parseInt(page, 10),
        itemsPerPage: parseInt(limit, 10)
      }
    };
  } catch (error) {
    console.error('Error getting all inventories:', error);
    throw error;
  }
};