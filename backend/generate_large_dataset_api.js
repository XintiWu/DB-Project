// 使用 API 生成大規模資料集
const API_BASE_URL = 'http://localhost:3000/api';

// 設定要生成的資料量
const NUM_INVENTORIES = 5000;  // 5000 個倉庫
const NUM_REQUESTS = 10000;    // 10000 筆需求
const ITEMS_PER_INVENTORY = 3; // 每個倉庫平均 3 個物品

const REQUEST_TYPES = ['Material', 'Tool', 'Humanpower'];
const INVENTORY_STATUSES = ['Active', 'Inactive'];
const REQUEST_STATUSES = ['Not Completed', 'Completed'];
const URGENCIES = [1, 2, 3, 4, 5];

// 地址列表（花蓮縣災區附近）
const ADDRESSES = [
  '花蓮縣花蓮市中山路200號', '花蓮縣花蓮市中正路150號', '花蓮縣花蓮市中華路300號',
  '花蓮縣花蓮市建國路100號', '花蓮縣花蓮市和平路250號', '花蓮縣花蓮市復興街80號',
  '花蓮縣花蓮市明禮路120號', '花蓮縣花蓮市林森路180號', '花蓮縣花蓮市自由街90號',
  '花蓮縣花蓮市博愛街200號', '花蓮縣新城鄉北埔路50號', '花蓮縣新城鄉大漢村中正路100號',
  '花蓮縣新城鄉嘉里村嘉里路80號', '花蓮縣吉安鄉吉安路一段200號', '花蓮縣吉安鄉中正路二段150號',
  '花蓮縣吉安鄉建國路一段100號', '花蓮縣吉安鄉中山路三段80號', '花蓮縣壽豐鄉壽豐路一段200號',
  '花蓮縣壽豐鄉志學村中正路100號', '花蓮縣鳳林鎮中正路一段150號', '花蓮縣鳳林鎮中山路200號',
  '花蓮縣鳳林鎮光復路100號', '花蓮縣光復鄉中正路一段80號', '花蓮縣光復鄉中山路二段120號',
  '花蓮縣瑞穗鄉中正南路一段200號', '花蓮縣瑞穗鄉中山路一段150號', '花蓮縣玉里鎮中正路200號',
  '花蓮縣玉里鎮中山路二段150號', '花蓮縣玉里鎮中華路100號', '花蓮縣富里鄉中山路200號',
  '花蓮縣富里鄉中正路150號', '花蓮縣秀林鄉和平村和平路100號', '花蓮縣秀林鄉富世村富世路80號',
  '花蓮縣豐濱鄉豐濱村中正路120號', '花蓮縣萬榮鄉萬榮村中正路80號', '花蓮縣卓溪鄉卓溪村中正路100號'
];

// 需求標題
const TITLES_MATERIAL = [
  '急需飲用水', '需要保暖衣物', '缺乏醫療口罩', '需要乾糧', '急需帳篷',
  '需要睡袋', '急需嬰兒奶粉', '需要衛生紙', '急需消毒水', '需要毛巾',
  '需要毛毯', '急需手電筒', '需要電池', '急需急救包', '需要雨衣',
  '需要雨鞋', '急需泡麵', '需要罐頭', '急需礦泉水', '需要紙杯'
];

const TITLES_TOOL = [
  '需要發電機', '急需抽水機', '需要鏟子', '需要電鋸', '急需照明設備',
  '需要無線電', '急需救生艇', '需要繩索', '急需安全帽', '需要手套',
  '需要鐵鎚', '急需切割機', '需要梯子', '急需對講機', '需要工具箱',
  '需要千斤頂', '急需破拆工具', '需要探照燈', '急需擴音器', '需要警示燈'
];

const TITLES_HUMANPOWER = [
  '急需醫護人員', '需要搬運志工', '需要交通引導', '急需心理輔導', '需要搜救人員',
  '需要煮食志工', '急需清潔人員', '需要翻譯人員', '急需社工', '需要司機',
  '需要工程師', '急需建築工人', '需要電工', '急需水電工', '需要志工',
  '急需志願者', '需要義工', '急需協助人員', '需要支援人力', '急需救援人員'
];

// 工具函數
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min, max) => Math.random() * (max - min) + min;

// API 調用函數
async function apiRequest(endpoint, method = 'GET', body = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || error.message || `HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
}

async function generateLargeDataset() {
  try {
    console.log('🚀 開始通過 API 生成大規模資料集...\n');
    
    // 1. 獲取基礎資料
    console.log('📋 獲取基礎資料...');
    const users = await apiRequest('/users');
    const incidentsRes = await apiRequest('/incidents?limit=100');
    const items = await apiRequest('/items');
    const skills = await apiRequest('/skill-tags');

    const incidents = incidentsRes.data || incidentsRes;
    
    if (!users || users.length === 0) {
      throw new Error('沒有找到用戶，請先創建用戶');
    }
    if (!incidents || incidents.length === 0) {
      throw new Error('沒有找到事件，請先創建事件');
    }
    if (!items || items.length === 0) {
      throw new Error('沒有找到物品，請先創建物品');
    }
    if (!skills || skills.length === 0) {
      throw new Error('沒有找到技能標籤，請先創建技能標籤');
    }
    
    const userIds = users.map(u => u.user_id);
    const incidentIds = incidents.map(i => i.incident_id);
    const itemIds = items.map(i => i.item_id);
    const skillIds = skills.map(s => s.skill_tag_id);
    
    console.log(`✅ 找到 ${userIds.length} 個用戶`);
    console.log(`✅ 找到 ${incidentIds.length} 個事件`);
    console.log(`✅ 找到 ${itemIds.length} 個物品`);
    console.log(`✅ 找到 ${skillIds.length} 個技能標籤\n`);

    // 2. 生成 INVENTORIES
    console.log(`📦 正在生成 ${NUM_INVENTORIES} 個倉庫...`);
    const generatedInventoryIds = [];
    
    for (let i = 0; i < NUM_INVENTORIES; i++) {
      try {
        const address = getRandomElement(ADDRESSES);
        const ownerId = getRandomElement(userIds);
        const status = getRandomElement(['Public', 'Private', 'Inactive']);
        
        const result = await apiRequest('/inventories', 'POST', {
          address,
          owner_id: ownerId,
          name: `倉庫 #${i + 1}`,
          status // Add this line
        });
        
        generatedInventoryIds.push(result.inventory_id);
        
        // 為每個倉庫添加物品
        const numItems = getRandomInt(1, ITEMS_PER_INVENTORY * 2);
        for (let k = 0; k < numItems; k++) {
          const itemId = getRandomElement(itemIds);
          const qty = getRandomInt(1, 100);
          const status = getRandomElement(['Owned', 'Lent', 'Unavailable']);
          
          try {
            await apiRequest('/inventory-items', 'POST', {
              inventory_id: result.inventory_id,
              item_id: itemId,
              qty,
              status
            });
          } catch (err) {
            // 忽略重複或錯誤
          }
        }
        
        if ((i + 1) % 500 === 0 || i + 1 === NUM_INVENTORIES) {
          console.log(`  ✅ 已生成 ${i + 1} / ${NUM_INVENTORIES} 個倉庫`);
        }
      } catch (error) {
        console.error(`  ⚠️  生成倉庫 ${i + 1} 時發生錯誤:`, error.message);
      }
    }
    console.log(`✅ 倉庫生成完成！共 ${generatedInventoryIds.length} 個\n`);

    // 3. 生成 REQUESTS
    console.log(`📋 正在生成 ${NUM_REQUESTS} 筆需求...`);
    let successCount = 0;
    
    for (let i = 0; i < NUM_REQUESTS; i++) {
      try {
        const type = getRandomElement(REQUEST_TYPES);
        const status = getRandomElement(REQUEST_STATUSES);
        const urgency = getRandomElement(URGENCIES);
        const incidentId = getRandomElement(incidentIds);
        const requesterId = getRandomElement(userIds);
        const requiredQty = getRandomInt(1, 50);
        const address = getRandomElement(ADDRESSES);
        const latitude = getRandomFloat(23.4, 24.5);  // 花蓮縣緯度範圍
        const longitude = getRandomFloat(121.0, 121.8);  // 花蓮縣經度範圍
        
        let title = '';
        let requestData = {
          requester_id: requesterId,
          incident_id: incidentId,
          status,
          urgency,
          type,
          address,
          latitude,
          longitude,
          title: ''
        };
        
        if (type === 'Material') {
          // Filter items that are NOT tools (Materials/Supplies)
          // Note: items[] contains is_tool boolean (true/false) based on getAllItems service
          const materialItems = items.filter(i => !i.is_tool);
          // If no specific materials found, fallback to all items or handle error. 
          // Assuming data exists.
          const targetItem = materialItems.length > 0 ? getRandomElement(materialItems) : getRandomElement(items);
          
          title = `急需 ${targetItem.item_name}`;
          const itemId = targetItem.item_id;
          
          requestData.title = title;
          requestData.items = [{ item_id: itemId, qty: requiredQty }];

        } else if (type === 'Tool') {
          // Filter items that ARE tools
          const toolItems = items.filter(i => i.is_tool);
          const targetItem = toolItems.length > 0 ? getRandomElement(toolItems) : getRandomElement(items);
          
          title = `需要 ${targetItem.item_name}`;
          const itemId = targetItem.item_id;
          
          requestData.title = title;
          requestData.equipments = [{ required_equipment: itemId, qty: requiredQty }];

        } else if (type === 'Humanpower') {
          const targetSkill = getRandomElement(skills);
          
          title = `急需 ${targetSkill.skill_tag_name} 支援`;
          const skillId = targetSkill.skill_tag_id;
          
          requestData.title = title;
          requestData.skills = [{ skill_tag_id: skillId, qty: requiredQty }];
        }
        
        await apiRequest('/requests', 'POST', requestData);
        successCount++;
        
        if ((i + 1) % 2000 === 0 || i + 1 === NUM_REQUESTS) {
          console.log(`  ✅ 已生成 ${i + 1} / ${NUM_REQUESTS} 筆需求 (成功: ${successCount})`);
        }
      } catch (error) {
        console.error(`  ⚠️  生成需求 ${i + 1} 時發生錯誤:`, error.message);
      }
    }
    console.log(`✅ 需求生成完成！共 ${successCount} 筆成功\n`);

    // 4. 統計資訊
    console.log('📊 資料生成統計：');
    const invRes = await apiRequest('/inventories');
    const invCount = invRes.meta ? invRes.meta.totalItems : (Array.isArray(invRes) ? invRes.length : 'N/A');
    
    const reqRes = await apiRequest('/requests');
    // Requests might be paginated too? users script didn't fetch it before.
    // Let's check if requests is paginated. Yes it is.
    const reqCount = reqRes.meta ? reqRes.meta.totalItems : (Array.isArray(reqRes) ? reqRes.length : 'N/A');
    
    console.log(`  📦 倉庫 (INVENTORIES): ${invCount} 筆`);
    console.log(`  📋 需求 (REQUESTS): ${reqCount} 筆`);
    console.log('\n🎉 大規模資料生成完成！');
    
  } catch (error) {
    console.error('❌ 生成資料時發生錯誤:', error);
    throw error;
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
  
  await generateLargeDataset();
}

main();

