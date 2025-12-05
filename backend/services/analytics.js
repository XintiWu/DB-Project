import { pool } from '../db.js';
import * as searchLogsService from './search_logs.js';

// ... existing code ...

export const getSearchAnalytics = async () => {
  try {
    const [trending, unmet] = await Promise.all([
      searchLogsService.getTrendingKeywords(),
      searchLogsService.getUnmetDemands()
    ]);
    
    return { trending, unmet };
  } catch (error) {
    console.error('Error getting search analytics:', error);
    throw error;
  }
};

export const logSearch = async (data) => {
  return searchLogsService.logSearch(data);
};

/**
 * Get Overall System Statistics
 */
export const getSystemStats = async () => {
  try {
    const queries = {
      totalRequests: 'SELECT COUNT(*) FROM "REQUESTS"',
      totalIncidents: 'SELECT COUNT(*) FROM "INCIDENTS"',
      totalUsers: 'SELECT COUNT(*) FROM "USERS"',
      completedRequests: 'SELECT COUNT(*) FROM "REQUESTS" WHERE status = \'Completed\'',
      pendingRequests: 'SELECT COUNT(*) FROM "REQUESTS" WHERE status = \'Pending\'',
    };

    const stats = {};
    for (const [key, sql] of Object.entries(queries)) {
      const { rows } = await pool.query(sql);
      stats[key] = parseInt(rows[0].count);
    }
    return stats;
  } catch (error) {
    console.error('Error getting system stats:', error);
    throw error;
  }
};

/**
 * Get Request Distribution by Type
 */
export const getRequestsByType = async () => {
  try {
    const sql = `
      SELECT type, COUNT(*) as count 
      FROM "REQUESTS" 
      GROUP BY type
    `;
    const { rows } = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error('Error getting requests by type:', error);
    throw error;
  }
};

/**
 * Get Request Distribution by Urgency
 */
export const getRequestsByUrgency = async () => {
  try {
    const sql = `
      SELECT urgency, COUNT(*) as count 
      FROM "REQUESTS" 
      GROUP BY urgency 
      ORDER BY urgency ASC
    `;
    const { rows } = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error('Error getting requests by urgency:', error);
    throw error;
  }
};

/**
 * Get Top Requested Items
 */
export const getTopRequestedItems = async () => {
  try {
    const sql = `
      SELECT i.item_name, SUM(rm.qty) as total_qty
      FROM "REQUEST_MATERIALS" rm
      JOIN "ITEMS" i ON rm.item_id = i.item_id
      GROUP BY i.item_name
      ORDER BY total_qty DESC
      LIMIT 5
    `;
    const { rows } = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error('Error getting top items:', error);
    throw error;
  }
};
