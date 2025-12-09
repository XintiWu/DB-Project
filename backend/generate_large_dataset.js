import { pool } from './db.js';

// 設定要生成的資料量
const NUM_INVENTORIES = 5000;  // 5000 個倉庫
const NUM_REQUESTS = 10000;    // 10000 筆需求
const ITEMS_PER_INVENTORY = 3; // 每個倉庫平均 3 個物品

const REQUEST_TYPES = ['Material', 'Tool', 'Humanpower'];
const INVENTORY_STATUSES = ['Active', 'Inactive'];  // 根據實際資料庫使用 Active/Inactive
const REQUEST_STATUSES = ['Not Completed', 'Completed'];
const URGENCIES = [1, 2, 3, 4, 5];

// 倉庫名稱模板
const WAREHOUSE_NAMES = [
  '緊急物資倉庫', '救災物資中心', '臨時儲存站', '救援物資庫', '應急倉儲',
  '物資集散中心', '救災倉庫', '緊急儲備庫', '救援物資站', '應急物資庫',
  '災害物資中心', '緊急儲存中心', '救援倉庫', '物資儲備站', '應急中心'
];

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

// 需求標題（僅物品名稱，不含「需要」、「急需」等前綴）
const TITLES_MATERIAL = [
  '飲用水', '保暖衣物', '醫療口罩', '乾糧', '帳篷',
  '睡袋', '嬰兒奶粉', '衛生紙', '消毒水', '毛巾',
  '毛毯', '手電筒', '電池', '急救包', '雨衣',
  '雨鞋', '泡麵', '罐頭', '礦泉水', '紙杯'
];

const TITLES_TOOL = [
  '發電機', '抽水機', '鏟子', '電鋸', '照明設備',
  '無線電', '救生艇', '繩索', '安全帽', '手套',
  '鐵鎚', '切割機', '梯子', '對講機', '工具箱',
  '千斤頂', '破拆工具', '探照燈', '擴音器', '警示燈'
];

const TITLES_HUMANPOWER = [
  '醫護人員', '搬運志工', '交通引導', '心理輔導', '搜救人員',
  '煮食志工', '清潔人員', '翻譯人員', '社工', '司機',
  '工程師', '建築工人', '電工', '水電工', '志工',
  '志願者', '義工', '協助人員', '支援人力', '救援人員'
];

// 工具函數
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min, max) => Math.random() * (max - min) + min;

async function generateLargeDataset() {
  const client = await pool.connect();
  try {
    console.log('🚀 開始生成大規模資料集...\n');
    await client.query('BEGIN');

    // 1. 確保必要的基礎資料存在
    console.log('📋 檢查基礎資料...');
    
    // Users
    let usersRes = await client.query('SELECT user_id FROM "USERS" LIMIT 100');
    if (usersRes.rows.length === 0) {
      console.log('⚠️  沒有找到用戶，正在創建測試用戶...');
      for (let i = 0; i < 50; i++) {
        await client.query(`
          INSERT INTO "USERS" (user_id, name, phone, role, status)
          VALUES ($1, $2, $3, 'Member', 'Active')
        `, [1000 + i, `User${i}`, `09${String(i).padStart(8, '0')}`]);
      }
      usersRes = await client.query('SELECT user_id FROM "USERS"');
    }
    const userIds = usersRes.rows.map(r => r.user_id);
    console.log(`✅ 找到 ${userIds.length} 個用戶`);

    // Areas
    let areasRes = await client.query('SELECT area_id FROM "AREA" LIMIT 1');
    if (areasRes.rows.length === 0) {
      console.log('⚠️  沒有找到區域，正在創建測試區域...');
      await client.query(`INSERT INTO "AREA" (area_id, area_name) VALUES ('A01', 'Test Area')`);
      areasRes = await client.query('SELECT area_id FROM "AREA"');
    }
    const areaId = areasRes.rows[0].area_id;
    console.log(`✅ 找到區域: ${areaId}`);

    // Incidents
    let incidentsRes = await client.query('SELECT incident_id FROM "INCIDENTS" LIMIT 100');
    if (incidentsRes.rows.length === 0) {
      console.log('⚠️  沒有找到事件，正在創建測試事件...');
      const reviewerId = userIds[0];
      for (let i = 0; i < 20; i++) {
        await client.query(`
          INSERT INTO "INCIDENTS" (incident_id, title, type, severity, area_id, reporter_id, latitude, longitude, status, address, reviewer_id, review_status)
          VALUES ($1, $2, 'Fire', 3, $3, $4, $5, $6, 'Occuring', $7, $8, 'Verified')
        `, [2000 + i, `Incident ${i}`, areaId, userIds[0], getRandomFloat(23.4, 24.5), getRandomFloat(121.0, 121.8), getRandomElement(ADDRESSES), reviewerId]);
      }
      incidentsRes = await client.query('SELECT incident_id FROM "INCIDENTS"');
    }
    const incidentIds = incidentsRes.rows.map(r => r.incident_id);
    console.log(`✅ 找到 ${incidentIds.length} 個事件`);

    // Item Categories
    let categoriesRes = await client.query('SELECT category_id FROM "ITEM_CATEGORIES" LIMIT 10');
    if (categoriesRes.rows.length === 0) {
      console.log('⚠️  沒有找到物品類別，正在創建...');
      await client.query(`INSERT INTO "ITEM_CATEGORIES" (category_id, category_name, is_tool) VALUES (1, 'General', false)`);
      await client.query(`INSERT INTO "ITEM_CATEGORIES" (category_id, category_name, is_tool) VALUES (2, 'Tools', true)`);
      categoriesRes = await client.query('SELECT category_id FROM "ITEM_CATEGORIES"');
    }
    const categoryIds = categoriesRes.rows.map(r => r.category_id);
    console.log(`✅ 找到 ${categoryIds.length} 個物品類別`);

    // Items - 分別獲取物資和工具
    let materialItemsRes = await client.query(`
      SELECT i.item_id, i.item_name 
      FROM "ITEMS" i
      JOIN "ITEM_CATEGORIES" ic ON i.category_id = ic.category_id
      WHERE ic.is_tool = false
    `);
    let toolItemsRes = await client.query(`
      SELECT i.item_id, i.item_name 
      FROM "ITEMS" i
      JOIN "ITEM_CATEGORIES" ic ON i.category_id = ic.category_id
      WHERE ic.is_tool = true
    `);
    
    if (materialItemsRes.rows.length === 0 || toolItemsRes.rows.length === 0) {
      console.log('⚠️  沒有找到足夠的物品，正在創建測試物品...');
      // 創建物資類別物品
      const materialNames = ['飲用水', '毛毯', '醫療口罩', '乾糧', '帳篷', '睡袋', '手電筒', '電池', '急救包', '雨衣'];
      for (let i = 0; i < materialNames.length; i++) {
        await client.query(`
          INSERT INTO "ITEMS" (item_id, item_name, category_id, unit)
          VALUES ($1, $2, $3, 'pcs')
          ON CONFLICT (item_id) DO NOTHING
        `, [3000 + i, materialNames[i], categoryIds.find(c => c === 1) || categoryIds[0]]);
      }
      // 創建工具類別物品
      const toolNames = ['發電機', '抽水機', '鏟子', '電鋸', '照明設備', '無線電', '救生艇', '繩索', '安全帽', '手套'];
      for (let i = 0; i < toolNames.length; i++) {
        await client.query(`
          INSERT INTO "ITEMS" (item_id, item_name, category_id, unit)
          VALUES ($1, $2, $3, 'pcs')
          ON CONFLICT (item_id) DO NOTHING
        `, [4000 + i, toolNames[i], categoryIds.find(c => c === 2) || categoryIds[1] || categoryIds[0]]);
      }
      // 重新查詢
      materialItemsRes = await client.query(`
        SELECT i.item_id, i.item_name 
        FROM "ITEMS" i
        JOIN "ITEM_CATEGORIES" ic ON i.category_id = ic.category_id
        WHERE ic.is_tool = false
      `);
      toolItemsRes = await client.query(`
        SELECT i.item_id, i.item_name 
        FROM "ITEMS" i
        JOIN "ITEM_CATEGORIES" ic ON i.category_id = ic.category_id
        WHERE ic.is_tool = true
      `);
    }
    
    const materialItemIds = materialItemsRes.rows.map(r => r.item_id);
    const toolItemIds = toolItemsRes.rows.map(r => r.item_id);
    const materialItemMap = new Map(materialItemsRes.rows.map(r => [r.item_name, r.item_id]));
    const toolItemMap = new Map(toolItemsRes.rows.map(r => [r.item_name, r.item_id]));
    
    console.log(`✅ 找到 ${materialItemIds.length} 個物資物品，${toolItemIds.length} 個工具物品`);

    // Skill Tags - 獲取所有技能標籤並建立映射
    let skillsRes = await client.query('SELECT skill_tag_id, skill_tag_name FROM "SKILL_TAGS"');
    if (skillsRes.rows.length === 0) {
      console.log('⚠️  沒有找到技能標籤，正在創建...');
      const skills = ['Medical', 'Rescue', 'Driving', 'Cooking', 'Engineering', 'Communication'];
      let sid = 4000;
      for (const skill of skills) {
        await client.query(`
          INSERT INTO "SKILL_TAGS" (skill_tag_id, skill_tag_name)
          VALUES ($1, $2)
        `, [sid++, skill]);
      }
      skillsRes = await client.query('SELECT skill_tag_id, skill_tag_name FROM "SKILL_TAGS"');
    }
    const skillIds = skillsRes.rows.map(r => r.skill_tag_id);
    const skillMap = new Map(skillsRes.rows.map(r => [r.skill_tag_name, r.skill_tag_id]));
    
    // 建立 title 到 skill 的映射（簡化版，根據關鍵字匹配）
    const titleToSkillMap = {
      '醫護人員': ['急診專科醫師', '外傷科醫師', '麻醉科醫師', '手術室護理師', '加護病房護理師'],
      '搬運志工': ['職業大客車駕照', '堆高機操作', '重機械操作-吊車'],
      '交通引導': ['職業大客車駕照'],
      '心理輔導': ['臨床心理師', '諮商心理師'],
      '搜救人員': ['高級救護技術員(EMT-P)', '中級救護技術員(EMT-2)', '初級救護技術員(EMT-1)'],
      '煮食志工': [],
      '清潔人員': [],
      '翻譯人員': [],
      '社工': ['社工師證照'],
      '司機': ['職業大客車駕照'],
      '工程師': ['結構技師', '水利技師', '大地技師', '電機技師'],
      '建築工人': ['結構技師'],
      '電工': ['電機技師'],
      '水電工': ['電機技師', '水利技師'],
      '志工': [],
      '志願者': [],
      '義工': [],
      '協助人員': [],
      '支援人力': [],
      '救援人員': ['高級救護技術員(EMT-P)', '中級救護技術員(EMT-2)']
    };
    
    console.log(`✅ 找到 ${skillIds.length} 個技能標籤\n`);

    // 2. 生成 INVENTORIES
    console.log(`📦 正在生成 ${NUM_INVENTORIES} 個倉庫...`);
    const maxInvIdRes = await client.query('SELECT COALESCE(MAX(inventory_id), 0) as max_id FROM "INVENTORIES"');
    let nextInventoryId = maxInvIdRes.rows[0].max_id + 1;
    
    const generatedInventoryIds = [];
    const batchSize = 500;
    
    for (let i = 0; i < NUM_INVENTORIES; i += batchSize) {
      const currentBatch = Math.min(batchSize, NUM_INVENTORIES - i);
      const values = [];
      const placeholders = [];
      
      for (let j = 0; j < currentBatch; j++) {
        const inventoryId = nextInventoryId++;
        const address = getRandomElement(ADDRESSES);
        const status = getRandomElement(INVENTORY_STATUSES);
        
        values.push(inventoryId, address, status);
        placeholders.push(`($${j * 3 + 1}, $${j * 3 + 2}, $${j * 3 + 3})`);
        generatedInventoryIds.push(inventoryId);
      }
      
      const sql = `
        INSERT INTO "INVENTORIES" (inventory_id, address, status)
        VALUES ${placeholders.join(', ')}
      `;
      
      await client.query(sql, values);
      
      if ((i + currentBatch) % 1000 === 0 || i + currentBatch === NUM_INVENTORIES) {
        console.log(`  ✅ 已生成 ${Math.min(i + currentBatch, NUM_INVENTORIES)} / ${NUM_INVENTORIES} 個倉庫`);
      }
    }
    console.log(`✅ 倉庫生成完成！共 ${generatedInventoryIds.length} 個\n`);

    // 3. 為每個倉庫分配擁有者和物品
    console.log(`📦 正在為倉庫分配擁有者和物品...`);
    let inventoryItemCount = 0;
    
    for (let i = 0; i < generatedInventoryIds.length; i += batchSize) {
      const currentBatch = Math.min(batchSize, generatedInventoryIds.length - i);
      const batchInventoryIds = generatedInventoryIds.slice(i, i + currentBatch);
      
      // 分配擁有者
      const ownerValues = [];
      const ownerPlaceholders = [];
      for (let j = 0; j < batchInventoryIds.length; j++) {
        const inventoryId = batchInventoryIds[j];
        const ownerId = getRandomElement(userIds);
        ownerValues.push(inventoryId, ownerId);
        ownerPlaceholders.push(`($${j * 2 + 1}, $${j * 2 + 2})`);
      }
      
      if (ownerValues.length > 0) {
        try {
          const ownerSql = `
            INSERT INTO "INVENTORY_OWNERS" (inventory_id, user_id)
            VALUES ${ownerPlaceholders.join(', ')}
            ON CONFLICT (inventory_id, user_id) DO NOTHING
          `;
          await client.query(ownerSql, ownerValues);
        } catch (err) {
          console.error('Error inserting owners:', err.message);
          throw err;
        }
      }
      
      // 為每個倉庫添加物品
      for (const inventoryId of batchInventoryIds) {
        const numItems = getRandomInt(1, ITEMS_PER_INVENTORY * 2);
        for (let k = 0; k < numItems; k++) {
          // 混合物資和工具物品
          const allItemIds = [...materialItemIds, ...toolItemIds];
          const itemId = getRandomElement(allItemIds);
          const qty = getRandomInt(1, 100);
          const status = getRandomElement(['Available', 'Lent', 'Unavailable']);  // 修正為正確的 status 值
          
          try {
            await client.query(`
              INSERT INTO "INVENTORY_ITEMS" (inventory_id, item_id, qty, status)
              VALUES ($1, $2, $3, $4)
              ON CONFLICT (inventory_id, item_id) DO UPDATE SET qty = "INVENTORY_ITEMS".qty + $3, status = $4
            `, [inventoryId, itemId, qty, status]);
            inventoryItemCount++;
          } catch (err) {
            // 忽略重複鍵錯誤
            console.error(`Error inserting item ${itemId} to inventory ${inventoryId}:`, err.message);
          }
        }
      }
      
      if ((i + currentBatch) % 1000 === 0 || i + currentBatch === generatedInventoryIds.length) {
        console.log(`  ✅ 已處理 ${Math.min(i + currentBatch, generatedInventoryIds.length)} / ${generatedInventoryIds.length} 個倉庫`);
      }
    }
    console.log(`✅ 倉庫物品分配完成！共 ${inventoryItemCount} 筆物品記錄\n`);

    // 4. 生成 REQUESTS
    console.log(`📋 正在生成 ${NUM_REQUESTS} 筆需求...`);
    
    // 確保 title 欄位存在
    await client.query('ALTER TABLE "REQUESTS" ADD COLUMN IF NOT EXISTS title VARCHAR(100)');
    
    for (let i = 0; i < NUM_REQUESTS; i += batchSize) {
      const currentBatch = Math.min(batchSize, NUM_REQUESTS - i);
      const requestData = [];
      
      for (let j = 0; j < currentBatch; j++) {
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
        let matchedItemId = null;
        let matchedSkillId = null;
        
        if (type === 'Material') {
          title = getRandomElement(TITLES_MATERIAL);
          // 嘗試根據 title 匹配物品名稱
          matchedItemId = materialItemMap.get(title) || getRandomElement(materialItemIds);
        } else if (type === 'Tool') {
          title = getRandomElement(TITLES_TOOL);
          // 嘗試根據 title 匹配物品名稱
          matchedItemId = toolItemMap.get(title) || getRandomElement(toolItemIds);
        } else {
          title = getRandomElement(TITLES_HUMANPOWER);
          // 根據 title 匹配技能
          const possibleSkills = titleToSkillMap[title] || [];
          if (possibleSkills.length > 0) {
            const matchedSkillName = getRandomElement(possibleSkills);
            matchedSkillId = skillMap.get(matchedSkillName) || getRandomElement(skillIds);
          } else {
            matchedSkillId = getRandomElement(skillIds);
          }
        }
        
        requestData.push({
          requesterId, incidentId, status, urgency, type,
          address, latitude, longitude, requiredQty, title,
          matchedItemId, matchedSkillId
        });
      }
      
      // 逐筆插入 REQUESTS 以獲取自動生成的 request_id
      for (const reqData of requestData) {
        const insertResult = await client.query(`
          INSERT INTO "REQUESTS" 
          (requester_id, incident_id, status, urgency, type, address, latitude, longitude, required_qty, current_qty, title)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, $10)
          RETURNING request_id
        `, [
          reqData.requesterId, reqData.incidentId, reqData.status, reqData.urgency, reqData.type,
          reqData.address, reqData.latitude, reqData.longitude, reqData.requiredQty, reqData.title
        ]);
        
        const requestId = insertResult.rows[0].request_id;
        
        // 插入相關資料（使用匹配的物品/技能）
        if (reqData.type === 'Material') {
          const itemId = reqData.matchedItemId || getRandomElement(materialItemIds);
          try {
            await client.query(`
              INSERT INTO "REQUEST_MATERIALS" (request_id, item_id, qty)
              VALUES ($1, $2, $3)
              ON CONFLICT DO NOTHING
            `, [requestId, itemId, reqData.requiredQty]);
          } catch (err) {
            console.error(`Error inserting material for request ${requestId}:`, err.message);
          }
        } else if (reqData.type === 'Tool') {
          const itemId = reqData.matchedItemId || getRandomElement(toolItemIds);
          try {
            await client.query(`
              INSERT INTO "REQUEST_EQUIPMENTS" (request_id, required_equipment, qty)
              VALUES ($1, $2, $3)
              ON CONFLICT DO NOTHING
            `, [requestId, itemId, reqData.requiredQty]);
          } catch (err) {
            console.error(`Error inserting equipment for request ${requestId}:`, err.message);
          }
        } else if (reqData.type === 'Humanpower') {
          const skillId = reqData.matchedSkillId || getRandomElement(skillIds);
          try {
            await client.query(`
              INSERT INTO "REQUEST_HUMANPOWER" (request_id, skill_tag_id, qty)
              VALUES ($1, $2, $3)
              ON CONFLICT DO NOTHING
            `, [requestId, skillId, reqData.requiredQty]);
          } catch (err) {
            console.error(`Error inserting humanpower for request ${requestId}:`, err.message);
          }
        }
      }
      
      if ((i + currentBatch) % 2000 === 0 || i + currentBatch === NUM_REQUESTS) {
        console.log(`  ✅ 已生成 ${Math.min(i + currentBatch, NUM_REQUESTS)} / ${NUM_REQUESTS} 筆需求`);
      }
    }
    console.log(`✅ 需求生成完成！共 ${NUM_REQUESTS} 筆\n`);

    await client.query('COMMIT');
    
    // 統計資訊
    console.log('📊 資料生成統計：');
    const invCount = await client.query('SELECT COUNT(*) FROM "INVENTORIES"');
    const reqCount = await client.query('SELECT COUNT(*) FROM "REQUESTS"');
    const invItemCount = await client.query('SELECT COUNT(*) FROM "INVENTORY_ITEMS"');
    const matCount = await client.query('SELECT COUNT(*) FROM "REQUEST_MATERIALS"');
    const toolCount = await client.query('SELECT COUNT(*) FROM "REQUEST_EQUIPMENTS"');
    const humanCount = await client.query('SELECT COUNT(*) FROM "REQUEST_HUMANPOWER"');
    
    console.log(`  📦 倉庫 (INVENTORIES): ${invCount.rows[0].count} 筆`);
    console.log(`  📋 需求 (REQUESTS): ${reqCount.rows[0].count} 筆`);
    console.log(`  📦 倉庫物品 (INVENTORY_ITEMS): ${invItemCount.rows[0].count} 筆`);
    console.log(`  📋 物資需求 (REQUEST_MATERIALS): ${matCount.rows[0].count} 筆`);
    console.log(`  📋 工具需求 (REQUEST_EQUIPMENTS): ${toolCount.rows[0].count} 筆`);
    console.log(`  📋 人力需求 (REQUEST_HUMANPOWER): ${humanCount.rows[0].count} 筆`);
    console.log('\n🎉 大規模資料生成完成！');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 生成資料時發生錯誤:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

generateLargeDataset();

