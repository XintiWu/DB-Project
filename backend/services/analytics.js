// 點擊追蹤和分析服務
import { getMongoDB } from '../mongodb.js';

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
