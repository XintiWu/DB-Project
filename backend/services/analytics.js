import { getMongoDB } from '../mongodb.js';
import { pool } from '../db.js';

export const getSystemStats = async () => {
    try {
        const queries = {
            totalRequests: 'SELECT COUNT(*) FROM "REQUESTS"',
            pendingRequests: 'SELECT COUNT(*) FROM "REQUESTS" WHERE status != \'Completed\'',
            completedRequests: 'SELECT COUNT(*) FROM "REQUESTS" WHERE status = \'Completed\'',
            totalIncidents: 'SELECT COUNT(*) FROM "INCIDENTS"',
            totalUsers: 'SELECT COUNT(*) FROM "USERS"',
            byType: 'SELECT type, COUNT(*) as count FROM "REQUESTS" GROUP BY type',
            byUrgency: 'SELECT urgency, COUNT(*) as count FROM "REQUESTS" GROUP BY urgency',
            topItems: `
                SELECT i.item_name, SUM(rm.qty) as total_qty
                FROM "REQUEST_MATERIALS" rm
                JOIN "ITEMS" i ON rm.item_id = i.item_id
                GROUP BY i.item_name
                ORDER BY total_qty DESC
                LIMIT 5
            `
        };

        const [
            totalRequestsRes,
            pendingRequestsRes,
            completedRequestsRes,
            totalIncidentsRes,
            totalUsersRes,
            byTypeRes,
            byUrgencyRes,
            topItemsRes
        ] = await Promise.all([
            pool.query(queries.totalRequests),
            pool.query(queries.pendingRequests),
            pool.query(queries.completedRequests),
            pool.query(queries.totalIncidents),
            pool.query(queries.totalUsers),
            pool.query(queries.byType),
            pool.query(queries.byUrgency),
            pool.query(queries.topItems)
        ]);

        return {
            system: {
                totalRequests: parseInt(totalRequestsRes.rows[0].count),
                pendingRequests: parseInt(pendingRequestsRes.rows[0].count),
                completedRequests: parseInt(completedRequestsRes.rows[0].count),
                totalIncidents: parseInt(totalIncidentsRes.rows[0].count),
                totalUsers: parseInt(totalUsersRes.rows[0].count)
            },
            byType: byTypeRes.rows,
            byUrgency: byUrgencyRes.rows,
            topItems: topItemsRes.rows
        };

    } catch (error) {
        console.error('Error getting system stats:', error);
        throw error;
    }
};

/**
 * Report Function B-1: 統計各地區災情數量
 */
export const getIncidentStatsByArea = async () => {
    try {
        const sql = `
            SELECT a.area_name, COUNT(i.incident_id) as incident_count
            FROM "INCIDENTS" i
            JOIN "AREA" a ON i.area_id = a.area_id
            GROUP BY a.area_name
            ORDER BY incident_count DESC;
        `;
        const { rows } = await pool.query(sql);
        return rows;
    } catch (error) {
        console.error('Error getting incident stats by area:', error);
        throw error;
    }
};

/**
 * Report Function B-2: 分析最急需的物資類別 (Optimized JOIN)
 */
export const getTopNeededCategories = async () => {
    try {
        const sql = `
            SELECT c.category_name, SUM(r.required_qty - r.current_qty) as shortage
            FROM "REQUESTS" r
            JOIN "REQUEST_MATERIALS" rm ON r.request_id = rm.request_id
            JOIN "ITEMS" i ON rm.item_id = i.item_id
            JOIN "ITEM_CATEGORIES" c ON i.category_id = c.category_id
            WHERE r.status = 'Not Completed'
            GROUP BY c.category_name
            ORDER BY shortage DESC;
        `;
        const { rows } = await pool.query(sql);
        return rows;
    } catch (error) {
        console.error('Error getting top needed categories:', error);
        throw error;
    }
};

/**
 * Report Function B-3: 找出閒置的高價值庫存
 */
export const getIdleResources = async (days = 30) => {
    try {
        const sql = `
            SELECT i.item_name, ii.qty, ii.updated_at, 
                   CONCAT('倉庫 #', inv.inventory_id) as inventory_name
            FROM "INVENTORY_ITEMS" ii
            JOIN "ITEMS" i ON ii.item_id = i.item_id
            JOIN "INVENTORIES" inv ON ii.inventory_id = inv.inventory_id
            WHERE ii.qty > 100 
            AND ii.updated_at < NOW() - ($1 || ' days')::INTERVAL
            ORDER BY ii.qty DESC;
        `;
        const { rows } = await pool.query(sql, [days]);
        return rows;
    } catch (error) {
        console.error('Error getting idle resources:', error);
        throw error;
    }
};

/**
 * Report Function B-5: 志工貢獻度排行
 */
export const getVolunteerLeaderboard = async (limit = 10) => {
    try {
        const sql = `
            SELECT u.name, COUNT(ra.request_id) as help_count
            FROM "REQUEST_ACCEPTS" ra
            JOIN "USERS" u ON ra.accepter_id = u.user_id
            GROUP BY u.name
            ORDER BY help_count DESC
            LIMIT $1;
        `;
        const { rows } = await pool.query(sql, [limit]);
        return rows;
    } catch (error) {
        console.error('Error getting volunteer leaderboard:', error);
        throw error;
    }
};


/**
 * 記錄點擊事件
 */
export const trackClick = async (clickData) => {
  try {
    const db = await getMongoDB();
    const clicksCollection = db.collection('clicks');
    
    const clickEvent = {
      ...clickData,
      timestamp: new Date(),
      date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      hour: new Date().getHours(),
      dayOfWeek: new Date().getDay(), // 0 = Sunday, 6 = Saturday
    };
    
    const result = await clicksCollection.insertOne(clickEvent);
    return result.insertedId;
  } catch (error) {
    console.error('Error tracking click:', error);
    throw error;
  }
};

/**
 * 獲取頁面點擊統計
 */
export const getPageStats = async (startDate, endDate) => {
  try {
    const db = await getMongoDB();
    const clicksCollection = db.collection('clicks');
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate) matchStage.timestamp.$gte = new Date(startDate);
      if (endDate) matchStage.timestamp.$lte = new Date(endDate);
    }
    
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$page',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          page: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { count: -1 } }
    ];
    
    const stats = await clicksCollection.aggregate(pipeline).toArray();
    return stats;
  } catch (error) {
    console.error('Error getting page stats:', error);
    throw error;
  }
};

/**
 * 獲取功能點擊統計
 */
export const getFeatureStats = async (startDate, endDate) => {
  try {
    const db = await getMongoDB();
    const clicksCollection = db.collection('clicks');
    
    const matchStage = { action: { $exists: true, $ne: null } };
    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate) matchStage.timestamp.$gte = new Date(startDate);
      if (endDate) matchStage.timestamp.$lte = new Date(endDate);
    }
    
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: { page: '$page', action: '$action' },
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          page: '$_id.page',
          action: '$_id.action',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { count: -1 } }
    ];
    
    const stats = await clicksCollection.aggregate(pipeline).toArray();
    return stats;
  } catch (error) {
    console.error('Error getting feature stats:', error);
    throw error;
  }
};

/**
 * 獲取時間段分析（按小時、按天）
 */
export const getTimeAnalysis = async (startDate, endDate, groupBy = 'hour') => {
  try {
    const db = await getMongoDB();
    const clicksCollection = db.collection('clicks');
    
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.timestamp = {};
      if (startDate) matchStage.timestamp.$gte = new Date(startDate);
      if (endDate) matchStage.timestamp.$lte = new Date(endDate);
    }
    
    const groupField = groupBy === 'hour' ? '$hour' : '$dayOfWeek';
    
    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: groupField,
          count: { $sum: 1 },
          pages: { $push: '$page' }
        }
      },
      {
        $project: {
          time: '$_id',
          count: 1,
          topPages: {
            $slice: [
              {
                $map: {
                  input: { $setUnion: '$pages' },
                  as: 'page',
                  in: {
                    page: '$$page',
                    count: {
                      $size: {
                        $filter: {
                          input: '$pages',
                          cond: { $eq: ['$$page', '$$this'] }
                        }
                      }
                    }
                  }
                }
              },
              5
            ]
          }
        }
      },
      { $sort: { time: 1 } }
    ];
    
    const stats = await clicksCollection.aggregate(pipeline).toArray();
    return stats;
  } catch (error) {
    console.error('Error getting time analysis:', error);
    throw error;
  }
};

/**
 * 獲取用戶行為路徑
 */
export const getUserPaths = async (limit = 10) => {
  try {
    const db = await getMongoDB();
    const clicksCollection = db.collection('clicks');
    
    const pipeline = [
      {
        $sort: { userId: 1, timestamp: 1 }
      },
      {
        $group: {
          _id: '$userId',
          path: { $push: '$page' },
          actions: { $push: '$action' },
          timestamps: { $push: '$timestamp' }
        }
      },
      {
        $project: {
          userId: '$_id',
          path: 1,
          actions: 1,
          pathLength: { $size: '$path' },
          uniquePages: { $size: { $setUnion: '$path' } }
        }
      },
      { $sort: { pathLength: -1 } },
      { $limit: limit }
    ];
    
    const paths = await clicksCollection.aggregate(pipeline).toArray();
    return paths;
  } catch (error) {
    console.error('Error getting user paths:', error);
    throw error;
  }
};

/**
 * 獲取最熱門的功能
 */
export const getTopFeatures = async (limit = 20) => {
  try {
    const db = await getMongoDB();
    const clicksCollection = db.collection('clicks');
    
    const pipeline = [
      {
        $match: { action: { $exists: true, $ne: null } }
      },
      {
        $group: {
          _id: '$action',
          count: { $sum: 1 },
          pages: { $addToSet: '$page' },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          action: '$_id',
          count: 1,
          pages: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit }
    ];
    
    const features = await clicksCollection.aggregate(pipeline).toArray();
    return features;
  } catch (error) {
    console.error('Error getting top features:', error);
    throw error;
  }
};
/**
 * 記錄搜尋日誌
 */

/**
 * Report Function B-4: NoSQL 分析 - 熱門搜尋關鍵字
 */
 export const getSearchKeywordsAnalysis = async () => {
  try {
    const db = await getMongoDB();
    const collection = db.collection('search_logs');
    
    // Aggregation Pipeline from Report
    const pipeline = [
        { $group: { _id: "$keyword", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
    ];
    
    const results = await collection.aggregate(pipeline).toArray();
    return results; // Returns [{ _id: 'tent', count: 50 }, ...]
  } catch (error) {
    console.error('Error getting search keyword analysis:', error);
    // Fallback if MongoDB is not connected or error
    return [];
  }
};

export const logSearch = async (searchData) => {
  try {
    const db = await getMongoDB();
    const searchLogsCollection = db.collection('search_logs');
    
    const logEntry = {
      ...searchData,
      timestamp: new Date(),
      date: new Date().toISOString().split('T')[0],
      hour: new Date().getHours(),
    };
    
    const result = await searchLogsCollection.insertOne(logEntry);
    return result.insertedId;
  } catch (error) {
    console.error('Error logging search:', error);
    throw error;
  }
};

/**
 * 獲取分頁點擊統計（哪個功能分頁比較多需求）
 */
export const getPageClickStats = async () => {
  try {
    const db = await getMongoDB();
    const clicksCollection = db.collection('clicks');
    
    const pipeline = [
      {
        $match: {
          action: 'page_view',
          page: { $exists: true }
        }
      },
      {
        $group: {
          _id: '$page',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          page: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { count: -1 } }
    ];
    
    const stats = await clicksCollection.aggregate(pipeline).toArray();
    return stats;
  } catch (error) {
    console.error('Error getting page click stats:', error);
    return [];
  }
};

/**
 * 獲取鄉鎮需求統計（花蓮縣的哪個鄉鎮比較多需求）
 */
export const getTownshipRequestStats = async () => {
  try {
    const db = await getMongoDB();
    const clicksCollection = db.collection('clicks');
    
    const pipeline = [
      {
        $match: {
          'metadata.township': { $exists: true },
          page: { $in: ['requests', 'publish'] } // 只統計需求相關頁面
        }
      },
      {
        $group: {
          _id: '$metadata.township',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          township: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { count: -1 } }
    ];
    
    const stats = await clicksCollection.aggregate(pipeline).toArray();
    return stats;
  } catch (error) {
    console.error('Error getting township request stats:', error);
    return [];
  }
};
