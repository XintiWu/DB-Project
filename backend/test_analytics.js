// 快速測試 analytics API
const API_BASE_URL = 'http://localhost:3000/api';

async function testAnalytics() {
  try {
    console.log('🧪 測試 Analytics API...\n');
    
    // 測試 POST /api/analytics/clicks
    console.log('1. 測試記錄點擊事件...');
    const response = await fetch(`${API_BASE_URL}/analytics/clicks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 'test_user_123',
        page: 'home',
        action: 'button_click',
        element: '測試按鈕',
        metadata: { test: true }
      }),
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('   ✅ 成功:', result);
    } else {
      const error = await response.text();
      console.log('   ❌ 失敗:', response.status, error);
    }
    
    // 測試 GET /api/analytics/pages
    console.log('\n2. 測試獲取頁面統計...');
    const pagesResponse = await fetch(`${API_BASE_URL}/analytics/pages`);
    if (pagesResponse.ok) {
      const pages = await pagesResponse.json();
      console.log('   ✅ 成功:', pages.length, '個頁面');
    } else {
      console.log('   ❌ 失敗:', pagesResponse.status);
    }
    
  } catch (error) {
    console.error('❌ 測試失敗:', error.message);
  }
}

testAnalytics();

