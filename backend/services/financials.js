import { pool } from '../db.js';

/**
 * Create Financial Transaction
 */
export const createTransaction = async (data) => {
  const { 
    source, 
    amount, 
    currency, 
    purpose, 
    admin_id 
  } = data;

  try {
    const sql = `
      INSERT INTO "FINANCIALS" 
      (source, amount, currency, purpose, admin_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *, amount::numeric;
    `;
    
    const values = [source, amount, currency, purpose, admin_id];
    const { rows } = await pool.query(sql, values);

    return rows[0];

  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
};

/**
 * Update Transaction
 */
export const updateTransaction = async (data) => {
  const { 
    txn_id,
    source, 
    amount, 
    currency, 
    purpose 
  } = data;

  try {
    const sql = `
      UPDATE "FINANCIALS"
      SET source = $1, amount = $2, currency = $3, purpose = $4
      WHERE txn_id = $5
      RETURNING *, amount::numeric;
    `;

    const values = [source, amount, currency, purpose, txn_id];
    const { rows } = await pool.query(sql, values);
    
    return rows[0];

  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

/**
 * Delete Transaction
 */
export const deleteTransaction = async (data) => {
  const { txn_id } = data;

  try {
    const sql = 'DELETE FROM "FINANCIALS" WHERE txn_id = $1 RETURNING txn_id';
    const { rows } = await pool.query(sql, [txn_id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

/**
 * Get Transaction by ID
 */
export const getTransactionById = async (data) => {
  const { txn_id } = data;

  try {
    const sql = 'SELECT *, amount::numeric FROM "FINANCIALS" WHERE txn_id = $1';
    const { rows } = await pool.query(sql, [txn_id]);
    
    return rows[0];

  } catch (error) {
    console.error('Error getting transaction by id:', error);
    throw error;
  }
};

/**
 * Get Transactions by Admin ID
 */
export const getTransactionsByAdminId = async (data) => {
  const { admin_id } = data;

  try {
    const sql = 'SELECT *, amount::numeric FROM "FINANCIALS" WHERE admin_id = $1 ORDER BY created_at DESC';
    const { rows } = await pool.query(sql, [admin_id]);
    
    return rows;

  } catch (error) {
    console.error('Error getting transactions by admin:', error);
    throw error;
  }
};

/**
 * Get All Transactions, decending by date (newest first)
 */
export const getAllTransactions = async () => {
  try {
    const sql = 'SELECT *, amount::numeric FROM "FINANCIALS" ORDER BY created_at DESC';
    const { rows } = await pool.query(sql);
    
    return rows;

  } catch (error) {
    console.error('Error getting all transactions:', error);
    throw error;
  }
};