import { pool } from '../db.js';

/**
 * Create a new lending record (Borrow item)
 * Table: LENDS + INVENTORY_ITEMS
 * Uses Transaction to ensure:
 * 1. Check inventory availability
 * 2. Deduct inventory quantity (with row lock)
 * 3. Create lending record
 */
/**
 * Create a new lending record (Borrow or Lend)
 * Table: LENDS + INVENTORY_ITEMS
 * Type: 'BORROW' (Warehouse -> User) or 'LEND' (User -> Warehouse)
 * Status: 'Active' (Immediate) or 'Pending' (Request)
 */
export const createLend = async (data) => {
  const { user_id, item_id, qty, from_inventory_id, type = 'BORROW', status = 'Borrowing' } = data;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // If Pending, just create record, don't touch inventory yet
    if (status === 'Pending') {
        const insertLendSql = `
          INSERT INTO "LENDS" (user_id, item_id, qty, from_inventory_id, lend_at, type, status, to_inventory_id)
          VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7)
          RETURNING *;
        `;
        const lendResult = await client.query(insertLendSql, [user_id, item_id, qty, from_inventory_id, type, status, data.to_inventory_id]);
        await client.query('COMMIT');
        return lendResult.rows[0];
    }

    if (type === 'BORROW') {
        // --- BORROW: User borrows from Warehouse (Inventory Decreases) ---
        // 1. Check and lock inventory item
        const checkSql = `
        SELECT qty 
        FROM "INVENTORY_ITEMS"
        WHERE inventory_id = $1 AND item_id = $2 AND status IN ('Available', 'Lent', 'Unavailable')
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
        WHERE inventory_id = $2 AND item_id = $3 AND status IN ('Available', 'Lent', 'Unavailable')
        RETURNING qty;
        `;
        await client.query(updateInventorySql, [qty, from_inventory_id, item_id]);

    } else if (type === 'LEND') {
        // --- LEND: User lends TO Warehouse (Inventory Increases) ---
        // 1. Check if item exists (UPSERT logic)
        const checkSql = `
        SELECT qty FROM "INVENTORY_ITEMS" 
        WHERE inventory_id = $1 AND item_id = $2 AND status IN ('Available', 'Lent', 'Unavailable');
        `;
        const checkResult = await client.query(checkSql, [from_inventory_id, item_id]);

        if (checkResult.rows.length > 0) {
            // Update existing
            const updateInventorySql = `
            UPDATE "INVENTORY_ITEMS"
            SET qty = qty + $1, updated_at = NOW()
            WHERE inventory_id = $2 AND item_id = $3 AND status IN ('Available', 'Lent', 'Unavailable');
            `;
            await client.query(updateInventorySql, [qty, from_inventory_id, item_id]);
        } else {
            // Insert new
            const insertInventorySql = `
            INSERT INTO "INVENTORY_ITEMS" (inventory_id, item_id, qty, updated_at, status)
            VALUES ($1, $2, $3, NOW(), 'Available'); 
            `;
            // NOTE: INVENTORY_ITEMS status is different from LENDS status. Assuming "Active" is correct for INVENTORY_ITEMS.
            await client.query(insertInventorySql, [from_inventory_id, item_id, qty]);
        }
    } else {
        throw new Error('Invalid lend type');
    }

    // 3. Create lending record
    const insertLendSql = `
      INSERT INTO "LENDS" (user_id, item_id, qty, from_inventory_id, lend_at, type, status, to_inventory_id)
      VALUES ($1, $2, $3, $4, NOW(), $5, 'Borrowing', $6)
      RETURNING *;
    `;
    const lendResult = await client.query(insertLendSql, [user_id, item_id, qty, from_inventory_id, type, data.to_inventory_id]);

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
 * Approve a Pending Lend Request
 */
export const approveLend = async (data) => {
    const { lend_id } = data;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. Get Lend Record
        const lendSql = 'SELECT * FROM "LENDS" WHERE lend_id = $1 FOR UPDATE';
        const lendRes = await client.query(lendSql, [lend_id]);
        
        if (lendRes.rows.length === 0) throw new Error('借用申請不存在');
        const lend = lendRes.rows[0];

        if (lend.status !== 'Pending') throw new Error(`無法核准: 狀態為 ${lend.status}`);
        if (lend.type !== 'BORROW') throw new Error('目前僅支援核准借用 (BORROW) 請求');

        // 2. Check and Deduct Inventory
        const checkSql = `
            SELECT qty 
            FROM "INVENTORY_ITEMS"
            WHERE inventory_id = $1 AND item_id = $2 AND status IN ('Available', 'Lent', 'Unavailable')
            FOR UPDATE;
        `;
        const invRes = await client.query(checkSql, [lend.from_inventory_id, lend.item_id]);
        
        if (invRes.rows.length === 0 || invRes.rows[0].qty < lend.qty) {
             throw new Error(`庫存不足，無法核准 (需求: ${lend.qty}, 目前: ${invRes.rows.length > 0 ? invRes.rows[0].qty : 0})`);
        }

        const updateInvSql = `
            UPDATE "INVENTORY_ITEMS"
            SET qty = qty - $1, updated_at = NOW()
            WHERE inventory_id = $2 AND item_id = $3 AND status IN ('Available', 'Lent', 'Unavailable');
        `;
        await client.query(updateInvSql, [lend.qty, lend.from_inventory_id, lend.item_id]);

        // 2.5 Add to Target Inventory (if specified) as 'Borrowed'
        if (lend.to_inventory_id) {
            const checkTargetSql = `
                SELECT qty FROM "INVENTORY_ITEMS"
                WHERE inventory_id = $1 AND item_id = $2 AND status = 'Borrowed';
            `;
            const targetRes = await client.query(checkTargetSql, [lend.to_inventory_id, lend.item_id]);

            if (targetRes.rows.length > 0) {
                const updateTargetSql = `
                    UPDATE "INVENTORY_ITEMS"
                    SET qty = qty + $1, updated_at = NOW()
                    WHERE inventory_id = $2 AND item_id = $3 AND status = 'Borrowed';
                `;
                await client.query(updateTargetSql, [lend.qty, lend.to_inventory_id, lend.item_id]);
            } else {
                const insertTargetSql = `
                    INSERT INTO "INVENTORY_ITEMS" (inventory_id, item_id, qty, updated_at, status)
                    VALUES ($1, $2, $3, NOW(), 'Borrowed');
                `;
                await client.query(insertTargetSql, [lend.to_inventory_id, lend.item_id, lend.qty]);
            }
        }

        // 3. Update Lend Status
        const updateLendSql = `
            UPDATE "LENDS"
            SET status = 'Borrowing', lend_at = NOW()
            WHERE lend_id = $1
            RETURNING *;
        `;
        const result = await client.query(updateLendSql, [lend_id]);

        await client.query('COMMIT');
        return result.rows[0];

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error approving lend:', error);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Reject a Pending Lend Request
 */
export const rejectLend = async (data) => {
    const { lend_id } = data;
    try {
        const sql = `
            UPDATE "LENDS"
            SET status = 'Rejected'
            WHERE lend_id = $1 AND status = 'Pending'
            RETURNING *;
        `;
        const { rows } = await pool.query(sql, [lend_id]);
        if (rows.length === 0) {
             throw new Error('找不到可拒絕的申請 (可能已處理或不存在)');
        }
        return rows[0];
    } catch (error) {
        console.error('Error rejecting lend:', error);
        throw error;
    }
};

/**
 * Get Lends (Requests) by Inventory ID
 * Used by Warehouse Owner to manage requests
 */
export const getLendsByInventoryId = async (inventory_id) => {
    try {
        const sql = `
            SELECT l.*, u.name as user_name, i.item_name
            FROM "LENDS" l
            JOIN "USERS" u ON l.user_id = u.user_id
            JOIN "ITEMS" i ON l.item_id = i.item_id
            WHERE l.from_inventory_id = $1
            ORDER BY 
                CASE WHEN l.status = 'Pending' THEN 0 ELSE 1 END,
                l.lend_at DESC;
        `;
        const { rows } = await pool.query(sql, [inventory_id]);
        return rows;
    } catch (error) {
        console.error('Error getting inventory lends:', error);
        throw error;
    }
};

/**
 * Mark a lent item as returned
 * Logic depends on 'type' in LENDS record
 */
export const returnLend = async (data) => {
  const { lend_id } = data;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Get lending record (must not be already returned)
    const getLendSql = `
      SELECT item_id, qty, from_inventory_id, returned_at, type, to_inventory_id
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
      SET returned_at = NOW(), status = 'Returned'
      WHERE lend_id = $1
      RETURNING *;
    `;
    const updateResult = await client.query(updateLendSql, [lend_id]);

    // 2.5 Remove from Target Inventory (if it was put there)
    if (lendRecord.to_inventory_id) {
         const updateTargetSql = `
            UPDATE "INVENTORY_ITEMS"
            SET qty = qty - $1, updated_at = NOW()
            WHERE inventory_id = $2 AND item_id = $3 AND status = 'Borrowed';
        `;
        // Note: We don't delete the row if qty=0 here to keep it simple, or we could. 
        // For 'Borrowed' items, maybe we want to keep history or maybe delete?
        // Let's just decrement for now. Reference implementation doesn't strictly require delete.
        await client.query(updateTargetSql, [lendRecord.qty, lendRecord.to_inventory_id, lendRecord.item_id]);
    }

    // 3. Adjust inventory based on Type
    if (lendRecord.type === 'BORROW' || !lendRecord.type) { // Default BORROW
        // User borrowed, now returning -> Inventory Increases
        // (Use UPSERT in case it was deleted? Unlikely but safer)
        const checkSql = `SELECT qty FROM "INVENTORY_ITEMS" WHERE inventory_id = $1 AND item_id = $2 AND status IN ('Available', 'Lent', 'Unavailable')`;
        const checkRes = await client.query(checkSql, [lendRecord.from_inventory_id, lendRecord.item_id]);
        
        if (checkRes.rows.length > 0) {
             const updateInventorySql = `
                UPDATE "INVENTORY_ITEMS"
                SET qty = qty + $1, updated_at = NOW()
                WHERE inventory_id = $2 AND item_id = $3 AND status IN ('Available', 'Lent', 'Unavailable');
            `;
            await client.query(updateInventorySql, [lendRecord.qty, lendRecord.from_inventory_id, lendRecord.item_id]);
        } else {
             const insertInventorySql = `
                INSERT INTO "INVENTORY_ITEMS" (inventory_id, item_id, qty, updated_at, status)
                VALUES ($1, $2, $3, NOW(), 'Available');
            `;
            await client.query(insertInventorySql, [lendRecord.from_inventory_id, lendRecord.item_id, lendRecord.qty]);
        }

    } else if (lendRecord.type === 'LEND') {
        // User lent to warehouse, now "returning" (taking back) -> Inventory Decreases
        // Check if sufficient
        const checkInventorySql = `
            SELECT qty FROM "INVENTORY_ITEMS"
            WHERE inventory_id = $1 AND item_id = $2 AND status IN ('Available', 'Lent', 'Unavailable')
            FOR UPDATE;
        `;
        const invRes = await client.query(checkInventorySql, [lendRecord.from_inventory_id, lendRecord.item_id]);
        const currentQty = invRes.rows.length > 0 ? invRes.rows[0].qty : 0;

        if (currentQty < lendRecord.qty) {
            throw new Error(`無法歸還(取回)：倉庫目前庫存不足 (${currentQty} < ${lendRecord.qty})`);
        }

        const updateInventorySql = `
            UPDATE "INVENTORY_ITEMS"
            SET qty = qty - $1, updated_at = NOW()
            WHERE inventory_id = $2 AND item_id = $3 AND status IN ('Available', 'Lent', 'Unavailable');
        `;
        await client.query(updateInventorySql, [lendRecord.qty, lendRecord.from_inventory_id, lendRecord.item_id]);
    }

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