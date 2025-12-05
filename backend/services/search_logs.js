import { pool } from '../db.js';

/**
 * Log a search event
 * @param {Object} data - { keyword, filters, results_count, user_id }
 */
export const logSearch = async (data) => {
  try {
    const sql = 'INSERT INTO "SEARCH_LOGS" (search_data) VALUES ($1)';
    await pool.query(sql, [data]);
  } catch (error) {
    // Non-blocking error logging
    console.error('Error logging search:', error);
  }
};

/**
 * Get Trending Keywords (Top 5 in last 24 hours)
 */
export const getTrendingKeywords = async () => {
  try {
    const sql = `
      SELECT 
        search_data->>'keyword' as keyword, 
        COUNT(*) as count,
        AVG((search_data->>'results_count')::int) as avg_results
      FROM "SEARCH_LOGS"
      WHERE created_at > NOW() - INTERVAL '24 hours'
      AND search_data->>'keyword' IS NOT NULL
      AND search_data->>'keyword' != ''
      GROUP BY search_data->>'keyword'
      ORDER BY count DESC
      LIMIT 5;
    `;
    const { rows } = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error('Error getting trending keywords:', error);
    throw error;
  }
};

/**
 * Get Unmet Demands (Keywords with 0 results)
 */
export const getUnmetDemands = async () => {
  try {
    const sql = `
      SELECT 
        search_data->>'keyword' as keyword, 
        COUNT(*) as count
      FROM "SEARCH_LOGS"
      WHERE (search_data->>'results_count')::int = 0
      AND search_data->>'keyword' IS NOT NULL
      AND search_data->>'keyword' != ''
      GROUP BY search_data->>'keyword'
      ORDER BY count DESC
      LIMIT 5;
    `;
    const { rows } = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error('Error getting unmet demands:', error);
    throw error;
  }
};
