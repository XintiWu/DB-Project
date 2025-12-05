import { pool } from '../db.js';

/**
 * Create a new lending record (Borrow item)
 * Table: LENDS + INVENTORY_ITEMS
 * Uses Transaction to ensure:
 * 1. Check inventory availability
 * 2. Deduct inventory quantity (with row lock)
 * 3. Create lending record
 */
export const createLend = async (data) => {
  const { user_id, item_id, qty, from_inventory_id } = data;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Check and lock inventory item (FOR UPDATE locks the row)
    const checkSql = `
      SELECT qty 
      FROM "INVENTORY_ITEMS"
      WHERE inventory_id = $1 AND item_id = $2
      FOR UPDATE;
    `;
    const checkResult = await client.query(checkSql, [from_inventory_id, item_id]);
    
    if (checkResult.rows.length === 0) {
      throw new Error('此庫存中沒有該物品');
    }

    const currentQty = checkResult.rows[0].qty;
    
    if (currentQty < qty) {
      throw new Error(`庫存不足：目前庫存 ${currentQty}，需要 ${qty}`);
    }

    // 2. Deduct inventory quantity
    const updateInventorySql = `
      UPDATE "INVENTORY_ITEMS"
      SET qty = qty - $1, updated_at = NOW()
      WHERE inventory_id = $2 AND item_id = $3
      RETURNING qty;
    `;
    await client.query(updateInventorySql, [qty, from_inventory_id, item_id]);

    // 3. Create lending record
    const insertLendSql = `
      INSERT INTO "LENDS" (user_id, item_id, qty, from_inventory_id, lend_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *;
    `;
    const lendResult = await client.query(insertLendSql, [user_id, item_id, qty, from_inventory_id]);

    await client.query('COMMIT');
    return lendResult.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating lend record with transaction:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Mark a lent item as returned
 * Table: LENDS + INVENTORY_ITEMS
 * Uses Transaction to ensure:
 * 1. Get lending record details
 * 2. Update returned_at timestamp
 * 3. Return quantity to inventory
 */
export const returnLend = async (data) => {
  const { lend_id } = data;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Get lending record (must not be already returned)
    const getLendSql = `
      SELECT item_id, qty, from_inventory_id, returned_at
      FROM "LENDS"
      WHERE lend_id = $1
      FOR UPDATE;
    `;
    const lendResult = await client.query(getLendSql, [lend_id]);
    
    if (lendResult.rows.length === 0) {
      throw new Error('借出記錄不存在');
    }

    const lendRecord = lendResult.rows[0];
    
    if (lendRecord.returned_at !== null) {
      throw new Error('此物品已經歸還過了');
    }

    // 2. Update returned_at
    const updateLendSql = `
      UPDATE "LENDS"
      SET returned_at = NOW()
      WHERE lend_id = $1
      RETURNING *;
    `;
    const updateResult = await client.query(updateLendSql, [lend_id]);

    // 3. Return quantity to inventory
    const updateInventorySql = `
      UPDATE "INVENTORY_ITEMS"
      SET qty = qty + $1, updated_at = NOW()
      WHERE inventory_id = $2 AND item_id = $3
      RETURNING qty;
    `;
    await client.query(updateInventorySql, [
      lendRecord.qty, 
      lendRecord.from_inventory_id, 
      lendRecord.item_id
    ]);

    await client.query('COMMIT');
    return updateResult.rows[0];

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error returning lend with transaction:', error);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get lending history by User ID
 */
export const getLendsByUserId = async (data) => {
  const { user_id } = data;

  try {
    const sql = `
      SELECT l.*, i.item_name 
      FROM "LENDS" l
      JOIN "ITEMS" i ON l.item_id = i.item_id
      WHERE l.user_id = $1
      ORDER BY l.lend_at DESC
    `;
    const { rows } = await pool.query(sql, [user_id]);
    
    return rows;

  } catch (error) {
    console.error('Error getting user lends:', error);
    throw error;
  }
};

/**
 * Get currently outstanding lends (items not yet returned)
 * Useful for checking inventory availability or overdue items
 */
export const getOutstandingLends = async () => {
  try {
    const sql = `
      SELECT l.*, u.name as user_name, i.item_name
      FROM "LENDS" l
      JOIN "USERS" u ON l.user_id = u.user_id
      JOIN "ITEMS" i ON l.item_id = i.item_id
      WHERE l.returned_at IS NULL
    `;
    const { rows } = await pool.query(sql);
    
    return rows;

  } catch (error) {
    console.error('Error getting outstanding lends:', error);
    throw error;
  }
};

/**
 * Get All Lends
 */
export const getAllLends = async () => {
  try {
    const sql = 'SELECT * FROM "LENDS" ORDER BY lend_at DESC';
    const { rows } = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error('Error getting all lends:', error);
    throw error;
  }
};