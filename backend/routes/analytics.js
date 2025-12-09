// 分析 API 路由
import express from 'express';
import * as analyticsService from '../services/analytics.js';

const router = express.Router();

// 記錄點擊事件
router.post('/clicks', async (req, res) => {
  try {
    const clickData = {
      userId: req.body.userId || 'anonymous',
      page: req.body.page,
      action: req.body.action || null,
      element: req.body.element || null,
      metadata: req.body.metadata || {},
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
    };
    
    const result = await analyticsService.trackClick(clickData);
    res.status(201).json({ success: true, id: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 記錄搜尋日誌
router.post('/log-search', async (req, res) => {
  try {
    const searchData = {
      userId: req.body.userId || 'anonymous',
      query: req.body.query,
      category: req.body.category || 'all',
      resultCount: req.body.resultCount || 0,
      metadata: req.body.metadata || {},
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress,
    };
    
    const result = await analyticsService.logSearch(searchData);
    res.status(201).json({ success: true, id: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 獲取系統統計
router.get('/stats', async (req, res) => {
    try {
        const stats = await analyticsService.getSystemStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 獲取頁面統計
router.get('/pages', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await analyticsService.getPageStats(startDate, endDate);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 獲取功能統計
router.get('/features', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const stats = await analyticsService.getFeatureStats(startDate, endDate);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 獲取時間分析
router.get('/time', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'hour' } = req.query;
    const stats = await analyticsService.getTimeAnalysis(startDate, endDate, groupBy);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 獲取用戶行為路徑
router.get('/paths', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const paths = await analyticsService.getUserPaths(limit);
    res.json(paths);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 獲取最熱門功能
router.get('/top-features', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const features = await analyticsService.getTopFeatures(limit);
    res.json(features);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Report Function B-1 Route
router.get('/incident-stats', async (req, res) => {
    try {
        const stats = await analyticsService.getIncidentStatsByArea();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Report Function B-2 Route
router.get('/top-needed-categories', async (req, res) => {
    try {
        const stats = await analyticsService.getTopNeededCategories();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Report Function B-3 Route
router.get('/idle-resources', async (req, res) => {
    try {
        const days = req.query.days || 30;
        const result = await analyticsService.getIdleResources(days);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Report Function B-4 Route
router.get('/search-keywords-analysis', async (req, res) => {
    try {
        const result = await analyticsService.getSearchKeywordsAnalysis();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Report Function B-5 Route
router.get('/volunteer-leaderboard', async (req, res) => {
    try {
        const limit = req.query.limit || 10;
        const result = await analyticsService.getVolunteerLeaderboard(limit);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
