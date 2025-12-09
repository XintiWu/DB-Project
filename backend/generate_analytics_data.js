// 生成 MongoDB 分析資料（搜尋關鍵字、點擊紀錄、分頁統計等）
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = 'disaster_platform_analytics';

// 花蓮縣各鄉鎮
const HUALIEN_TOWNSHIPS = [
  '花蓮縣花蓮市', '花蓮縣鳳林鎮', '花蓮縣玉里鎮', '花蓮縣新城鄉',
  '花蓮縣吉安鄉', '花蓮縣壽豐鄉', '花蓮縣光復鄉', '花蓮縣豐濱鄉',
  '花蓮縣瑞穗鄉', '花蓮縣富里鄉', '花蓮縣秀林鄉', '花蓮縣萬榮鄉',
  '花蓮縣卓溪鄉'
];

// 熱門搜尋關鍵字（與災害相關）
const SEARCH_KEYWORDS = [
  '帳篷', '睡袋', '飲用水', '食物', '醫療用品', '手電筒', '電池',
  '毛毯', '急救包', '口罩', '消毒水', '衛生紙', '罐頭', '泡麵',
  '避難所', '物資', '救援', '志工', '捐款', '災情', '地震',
  '颱風', '撤離', '安全', '緊急', '需求', '提供', '認領',
  '倉庫', '物資中心', '救援站', '醫療站', '臨時住所'
];

// 頁面列表
const PAGES = [
  'home', 'requests', 'incidents', 'shelters', 'resources', 
  'financials', 'publish', 'profile', 'admin', 'login', 'register'
];

// 頁面中文名稱對應
const PAGE_NAMES = {
  'home': '首頁',
  'requests': '需求列表',
  'incidents': '災情',
  'shelters': '避難所',
  'resources': '資源',
  'financials': '財務',
  'publish': '發布需求',
  'profile': '個人中心',
  'admin': '管理後台',
  'login': '登入',
  'register': '註冊'
};

// 動作列表
const ACTIONS = [
  'page_view', 'nav_click', 'button_click', 'card_click', 
  'form_submit', 'claim_click', 'donate_click', 'borrow_click',
  'search_click', 'filter_click'
];

// 工具函數
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(getRandomInt(0, 23), getRandomInt(0, 59), getRandomInt(0, 59));
  return date;
};

async function generateSearchLogs(client) {
  const db = client.db(DB_NAME);
  const collection = db.collection('search_logs');
  
  console.log('📝 生成搜尋關鍵字資料...');
  
  // 清空現有資料（可選）
  await collection.deleteMany({});
  
  const searchLogs = [];
  const NUM_SEARCHES = 500; // 生成 500 筆搜尋記錄
  
  for (let i = 0; i < NUM_SEARCHES; i++) {
    const daysAgo = getRandomInt(0, 30);
    const timestamp = getRandomDate(daysAgo);
    const keyword = getRandomElement(SEARCH_KEYWORDS);
    
    // 某些關鍵字出現頻率更高（模擬真實使用）
    const popularKeywords = ['帳篷', '飲用水', '食物', '醫療用品', '避難所'];
    const finalKeyword = Math.random() < 0.4 ? getRandomElement(popularKeywords) : keyword;
    
    searchLogs.push({
      userId: `user_${getRandomInt(1, 100)}`,
      query: finalKeyword,
      keyword: finalKeyword,
      category: getRandomElement(['all', 'material', 'tool', 'humanpower']),
      resultCount: getRandomInt(5, 100),
      timestamp: timestamp,
      date: timestamp.toISOString().split('T')[0],
      hour: timestamp.getHours(),
      metadata: {
        township: getRandomElement(HUALIEN_TOWNSHIPS),
        device: getRandomElement(['desktop', 'mobile', 'tablet'])
      }
    });
  }
  
  await collection.insertMany(searchLogs);
  console.log(`  ✅ 已生成 ${NUM_SEARCHES} 筆搜尋記錄\n`);
}

async function generateClickData(client) {
  const db = client.db(DB_NAME);
  const collection = db.collection('clicks');
  
  console.log('🖱️  生成點擊紀錄資料...');
  
  // 清空現有資料（可選）
  await collection.deleteMany({});
  
  const clicks = [];
  const NUM_USERS = 150; // 150 個用戶
  const CLICKS_PER_USER = getRandomInt(30, 150); // 每個用戶 30-150 次點擊
  
  // 頁面熱門度權重（某些頁面更常被訪問）
  const pageWeights = {
    'home': 0.15,
    'requests': 0.25,  // 需求列表最熱門
    'incidents': 0.15,
    'shelters': 0.10,
    'resources': 0.20,  // 資源頁面也很熱門
    'financials': 0.05,
    'publish': 0.05,
    'profile': 0.03,
    'admin': 0.01,
    'login': 0.01
  };
  
  // 鄉鎮需求熱門度（光復鄉最多）
  const townshipWeights = {
    '花蓮縣光復鄉': 0.30,  // 光復鄉最多
    '花蓮縣花蓮市': 0.15,
    '花蓮縣玉里鎮': 0.12,
    '花蓮縣富里鄉': 0.10,
    '花蓮縣壽豐鄉': 0.08,
    '花蓮縣瑞穗鄉': 0.08,
    '花蓮縣鳳林鎮': 0.06,
    '花蓮縣吉安鄉': 0.05,
    '花蓮縣新城鄉': 0.04,
    '花蓮縣秀林鄉': 0.01,
    '花蓮縣萬榮鄉': 0.01,
    '花蓮縣豐濱鄉': 0.00
  };
  
  const weightedPageSelect = () => {
    const rand = Math.random();
    let sum = 0;
    for (const [page, weight] of Object.entries(pageWeights)) {
      sum += weight;
      if (rand <= sum) return page;
    }
    return 'home';
  };
  
  const weightedTownshipSelect = () => {
    const rand = Math.random();
    let sum = 0;
    for (const [township, weight] of Object.entries(townshipWeights)) {
      sum += weight;
      if (rand <= sum) return township;
    }
    return '花蓮縣花蓮市';
  };
  
  let totalClicks = 0;
  
  for (let userId = 1; userId <= NUM_USERS; userId++) {
    const userClicks = getRandomInt(30, 150);
    const userPath = [];
    const userTownship = weightedTownshipSelect(); // 每個用戶主要關注的鄉鎮
    
    for (let click = 0; click < userClicks; click++) {
      const daysAgo = getRandomInt(0, 30);
      const timestamp = getRandomDate(daysAgo);
      
      // 模擬用戶行為路徑
      let page, action, element;
      
      if (click === 0 || Math.random() < 0.3) {
        // 30% 機率是新頁面訪問
        page = weightedPageSelect();
        action = 'page_view';
        userPath.push(page);
      } else {
        // 70% 機率是頁面內操作
        page = userPath.length > 0 ? getRandomElement(userPath) : weightedPageSelect();
        action = getRandomElement(ACTIONS);
        
        if (action === 'nav_click') {
          element = PAGE_NAMES[page] || page;
        } else if (action === 'button_click') {
          element = getRandomElement(['認領', '發布', '查看詳情', '提交', '取消', '借用', '提供']);
        } else if (action === 'card_click') {
          element = getRandomElement(['需求卡片', '事件卡片', '倉庫卡片', '避難所卡片']);
        } else if (action === 'search_click') {
          element = getRandomElement(SEARCH_KEYWORDS);
        }
      }
      
      clicks.push({
        userId: `user_${userId}`,
        page: page,
        action: action,
        element: element || null,
        metadata: {
          timestamp: timestamp.toISOString(),
          sessionId: `session_${userId}_${Math.floor(click / 10)}`,
          township: userTownship, // 用戶關注的鄉鎮
          pageName: PAGE_NAMES[page] || page,
          device: getRandomElement(['desktop', 'mobile', 'tablet'])
        },
        timestamp: timestamp,
        date: timestamp.toISOString().split('T')[0],
        hour: timestamp.getHours(),
        dayOfWeek: timestamp.getDay()
      });
      
      totalClicks++;
    }
    
    if (userId % 30 === 0 || userId === NUM_USERS) {
      console.log(`  ✅ 已生成 ${userId} / ${NUM_USERS} 個用戶的點擊資料 (總計 ${totalClicks} 次點擊)`);
    }
  }
  
  // 分批插入以避免過大
  const BATCH_SIZE = 1000;
  for (let i = 0; i < clicks.length; i += BATCH_SIZE) {
    const batch = clicks.slice(i, i + BATCH_SIZE);
    await collection.insertMany(batch);
  }
  
  console.log(`  ✅ 已生成 ${totalClicks} 筆點擊記錄\n`);
}

async function main() {
  let client;
  
  try {
    console.log('🚀 開始生成 MongoDB 分析資料...\n');
    console.log(`📡 連接到 MongoDB: ${MONGODB_URI}\n`);
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ MongoDB 連接成功\n');
    
    // 生成搜尋關鍵字資料
    await generateSearchLogs(client);
    
    // 生成點擊紀錄資料
    await generateClickData(client);
    
    console.log('✅ 所有分析資料生成完成！\n');
    console.log('📊 資料統計：');
    console.log(`   - 搜尋記錄: 500 筆`);
    console.log(`   - 點擊記錄: ~${150 * 90} 筆（150 用戶 × 平均 90 次點擊）`);
    console.log(`   - 時間範圍: 過去 30 天`);
    console.log(`   - 涵蓋鄉鎮: ${HUALIEN_TOWNSHIPS.length} 個花蓮縣鄉鎮\n`);
    
  } catch (error) {
    console.error('❌ 生成資料時發生錯誤:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('📡 MongoDB 連接已關閉');
    }
  }
}

main();

