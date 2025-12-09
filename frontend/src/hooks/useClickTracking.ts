import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:3000/api';

// 生成或獲取用戶 ID
function getUserId(): string {
  let userId = localStorage.getItem('analytics_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('analytics_user_id', userId);
  }
  return userId;
}

// 發送點擊事件到後端
async function trackClick(data: {
  page: string;
  action?: string;
  element?: string;
  metadata?: Record<string, any>;
}) {
  try {
    const userId = getUserId();
    await fetch(`${API_BASE_URL}/analytics/clicks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        ...data,
      }),
    });
  } catch (error) {
    // 靜默失敗，不影響用戶體驗
    console.error('Failed to track click:', error);
  }
}

/**
 * 頁面訪問追蹤 Hook
 */
export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    // 追蹤頁面訪問
    const pageName = location.pathname.replace('/', '') || 'home';
    trackClick({
      page: pageName,
      action: 'page_view',
      metadata: {
        path: location.pathname,
        search: location.search,
      },
    });
  }, [location]);
}

/**
 * 點擊追蹤 Hook
 */
export function useClickTracking() {
  const track = useCallback((action: string, element?: string, metadata?: Record<string, any>) => {
    const pageName = window.location.pathname.replace('/', '') || 'home';
    trackClick({
      page: pageName,
      action,
      element,
      metadata,
    });
  }, []);

  return { track };
}

// 注意：withClickTracking HOC 暫時不使用，因為需要 JSX 支持
// 如果需要使用，請將此文件重命名為 .tsx 並使用 JSX 語法

