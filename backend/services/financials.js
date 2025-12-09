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
 * Get All Transactions with Pagination and Sorting
 */
export const getAllTransactions = async (options = {}) => {
  const { page = 1, limit = 50, sortBy = 'created_at', sortOrder = 'DESC' } = options;
  const offset = (page - 1) * limit;

  const validSortColumns = ['created_at', 'amount'];
  const validSortOrders = ['ASC', 'DESC'];

  let sortClause = 'created_at DESC';
  if (validSortColumns.includes(sortBy)) {
      if (sortBy === 'amount') {
          sortClause = `amount::numeric ${validSortOrders.includes(sortOrder) ? sortOrder : 'DESC'}`;
      } else {
          sortClause = `${sortBy} ${validSortOrders.includes(sortOrder) ? sortOrder : 'DESC'}`;
      }
  }

  try {
    const sql = `
        SELECT *, amount::numeric 
        FROM "FINANCIALS" 
        ORDER BY ${sortClause}
        LIMIT $1 OFFSET $2
    `;
    const countSql = 'SELECT COUNT(*) FROM "FINANCIALS"';
    
    const [rowsRes, countRes] = await Promise.all([
      pool.query(sql, [limit, offset]),
      pool.query(countSql)
    ]);
    
    return {
      data: rowsRes.rows,
      meta: {
        totalItems: parseInt(countRes.rows[0].count),
        totalPages: Math.ceil(parseInt(countRes.rows[0].count) / limit),
        currentPage: page,
        itemsPerPage: limit
      }
    };

  } catch (error) {
    console.error('Error getting all transactions:', error);
    throw error;
  }
};

/**
 * Get Financial Statistics
 */
export const getFinancialStats = async () => {
  try {
    const totalSql = `
      SELECT COALESCE(SUM(amount::numeric), 0) as total_amount, COUNT(*) as total_count 
      FROM "FINANCIALS"
    `;
    const purposeSql = `
      SELECT purpose, COALESCE(SUM(amount::numeric), 0) as total_amount 
      FROM "FINANCIALS" 
      GROUP BY purpose
    `;
    const monthSql = `
      SELECT TO_CHAR(created_at, 'YYYY-MM') as month, COALESCE(SUM(amount::numeric), 0) as total_amount 
      FROM "FINANCIALS" 
      GROUP BY TO_CHAR(created_at, 'YYYY-MM') 
      ORDER BY month DESC 
    `;
    const sourceSql = `
      SELECT source, COALESCE(SUM(amount::numeric), 0) as total_amount 
      FROM "FINANCIALS" 
      GROUP BY source 
      ORDER BY total_amount DESC 
      LIMIT 5
    `;

    const [totalRes, purposeRes, monthRes, sourceRes] = await Promise.all([
      pool.query(totalSql),
      pool.query(purposeSql),
      pool.query(monthSql),
      pool.query(sourceSql)
    ]);

    return {
      summary: totalRes.rows[0],
      byPurpose: purposeRes.rows,
      byMonth: monthRes.rows,
      topSources: sourceRes.rows
    };
  } catch (error) {
    console.error('Error getting financial stats:', error);
    throw error;
  }
};