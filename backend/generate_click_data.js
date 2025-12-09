// 生成測試點擊資料
const API_BASE_URL = 'http://localhost:3000/api';

const PAGES = ['home', 'requests', 'incidents', 'shelters', 'resources', 'financials', 'publish', 'profile', 'admin', 'login', 'register'];
const ACTIONS = [
  'nav_click', 'page_view', 'button_click', 'card_click', 'form_submit',
  'login_click', 'register_click', 'logout_click', 'profile_click',
  'cart_click', 'claim_click', 'donate_click', 'borrow_click'
];

const NAV_LABELS = ['需求列表', '災情', '避難所', '資源', '財務', '管理後台', '首頁', '發布需求'];

// 工具函數
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(getRandomInt(0, 23), getRandomInt(0, 59), getRandomInt(0, 59));
  return date;
};

// API 調用
async function trackClick(data) {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics/clicks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
}

async function generateClickData() {
  try {
    console.log('🚀 開始生成測試點擊資料...\n');
    
    const NUM_USERS = 50;  // 50 個模擬用戶
    const CLICKS_PER_USER = getRandomInt(20, 100);  // 每個用戶 20-100 次點擊
    const DAYS_BACK = 30;  // 過去 30 天的資料
    
    let totalClicks = 0;
    
    for (let userId = 1; userId <= NUM_USERS; userId++) {
      const userClicks = getRandomInt(20, 100);
      const userPath = [];
      
      for (let click = 0; click < userClicks; click++) {
        const daysAgo = getRandomInt(0, DAYS_BACK);
        const timestamp = getRandomDate(daysAgo);
        
        // 模擬用戶行為路徑
        let page, action, element;
        
        if (click === 0 || Math.random() < 0.3) {
          // 30% 機率是新頁面訪問
          page = getRandomElement(PAGES);
          action = 'page_view';
          userPath.push(page);
        } else {
          // 70% 機率是頁面內操作
          page = getRandomElement(userPath.length > 0 ? userPath : PAGES);
          action = getRandomElement(ACTIONS);
          
          if (action === 'nav_click') {
            element = getRandomElement(NAV_LABELS);
          } else if (action === 'button_click') {
            element = getRandomElement(['認領', '發布', '查看詳情', '提交', '取消']);
          } else if (action === 'card_click') {
            element = getRandomElement(['需求卡片', '事件卡片', '倉庫卡片']);
          }
        }
        
        const clickData = {
          userId: `user_${userId}`,
          page,
          action,
          element: element || null,
          metadata: {
            timestamp: timestamp.toISOString(),
            sessionId: `session_${userId}_${Math.floor(click / 10)}`,
          },
        };
        
        try {
          await trackClick(clickData);
          totalClicks++;
          
          // 添加小延遲避免過載
          if (totalClicks % 100 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`  ⚠️  用戶 ${userId} 點擊 ${click} 失敗:`, error.message);
        }
      }
      
      if (userId % 10 === 0 || userId === NUM_USERS) {
        console.log(`  ✅ 已生成 ${userId} / ${NUM_USERS} 個用戶的點擊資料 (總計 ${totalClicks} 次點擊)`);
      }
    }
    
    console.log(`\n✅ 測試點擊資料生成完成！`);
    console.log(`   總用戶數: ${NUM_USERS}`);
    console.log(`   總點擊數: ${totalClicks}`);
    console.log(`   時間範圍: 過去 ${DAYS_BACK} 天\n`);
    
  } catch (error) {
    console.error('❌ 生成點擊資料時發生錯誤:', error);
  }
}

// 檢查後端是否運行
async function checkBackend() {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/`);
    if (!response.ok) {
      throw new Error('後端服務未運行');
    }
    console.log('✅ 後端服務運行正常\n');
    return true;
  } catch (error) {
    console.error('❌ 無法連接到後端服務，請確保後端運行在 http://localhost:3000');
    console.error('   請執行: cd backend && npm start');
    return false;
  }
}

// 主函數
async function main() {
  const isBackendRunning = await checkBackend();
  if (!isBackendRunning) {
    process.exit(1);
  }
  
  await generateClickData();
}

main();

