import { pool } from './db.js';

// Title 到物品名稱的映射
const titleToItemMap = {
  '飲用水': ['瓶裝水', '桶裝水', '礦泉水'],
  '保暖衣物': ['保暖外套', '兒童外套'],
  '醫療口罩': ['口罩'],
  '乾糧': ['白米', '泡麵', '罐頭食品', '便當', '餅乾', '麵包', '即食粥', '麵條'],
  '帳篷': ['帳篷'],
  '睡袋': ['睡袋'],
  '嬰兒奶粉': ['營養奶粉'],
  '衛生紙': ['衛生紙'],
  '消毒水': ['消毒液'],
  '毛巾': ['毛巾'],
  '毛毯': ['毛毯'],
  '手電筒': ['LED手電筒'],
  '電池': ['電池'],
  '急救包': ['急救箱'],
  '雨衣': ['雨衣'],
  '雨鞋': ['雨鞋'],
  '泡麵': ['泡麵'],
  '罐頭': ['罐頭食品'],
  '礦泉水': ['礦泉水'],
  '紙杯': ['紙杯'],
  
  // 工具
  '發電機': ['發電機'],
  '抽水機': ['抽水機'],
  '鏟子': ['鏟子'],
  '電鋸': ['電鋸'],
  '照明設備': ['LED手電筒', '太陽能路燈'],
  '無線電': ['對講機', '衛星電話'],
  '救生艇': ['救生艇'],
  '繩索': ['繩索'],
  '安全帽': ['安全帽'],
  '手套': ['手套'],
  '鐵鎚': ['鐵鎚'],
  '切割機': ['切割機'],
  '梯子': ['梯子'],
  '對講機': ['對講機'],
  '工具箱': ['工具箱'],
  '千斤頂': ['千斤頂'],
  '破拆工具': ['破拆工具'],
  '探照燈': ['探照燈'],
  '擴音器': ['擴音器'],
  '警示燈': ['警示燈']
};

async function fixRequestMatching() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    console.log('🔧 開始修復需求匹配...\n');
    
    // 獲取所有物品
    const itemsRes = await client.query('SELECT item_id, item_name FROM "ITEMS"');
    const itemMap = new Map(itemsRes.rows.map(r => [r.item_name, r.item_id]));
    
    // 修復 Material 需求
    console.log('📦 修復物資需求...');
    const materialRequests = await client.query(`
      SELECT r.request_id, r.title, r.type, rm.item_id, i.item_name
      FROM "REQUESTS" r
      LEFT JOIN "REQUEST_MATERIALS" rm ON r.request_id = rm.request_id
      LEFT JOIN "ITEMS" i ON rm.item_id = i.item_id
      WHERE r.type = 'Material'
    `);
    
    let fixedCount = 0;
    for (const req of materialRequests.rows) {
      const title = req.title;
      const possibleItems = titleToItemMap[title] || [];
      
      if (possibleItems.length > 0) {
        // 找到匹配的物品
        let matchedItemId = null;
        for (const itemName of possibleItems) {
          if (itemMap.has(itemName)) {
            matchedItemId = itemMap.get(itemName);
            break;
          }
        }
        
        // 如果找到匹配的物品且當前不匹配，則更新
        if (matchedItemId && matchedItemId !== req.item_id) {
          await client.query(`
            UPDATE "REQUEST_MATERIALS"
            SET item_id = $1
            WHERE request_id = $2
          `, [matchedItemId, req.request_id]);
          fixedCount++;
        }
      }
    }
    console.log(`✅ 修復了 ${fixedCount} 筆物資需求\n`);
    
    // 修復 Tool 需求
    console.log('🔧 修復工具需求...');
    const toolRequests = await client.query(`
      SELECT r.request_id, r.title, r.type, re.required_equipment, i.item_name
      FROM "REQUESTS" r
      LEFT JOIN "REQUEST_EQUIPMENTS" re ON r.request_id = re.request_id
      LEFT JOIN "ITEMS" i ON re.required_equipment = i.item_id
      WHERE r.type = 'Tool'
    `);
    
    fixedCount = 0;
    for (const req of toolRequests.rows) {
      const title = req.title;
      const possibleItems = titleToItemMap[title] || [];
      
      if (possibleItems.length > 0) {
        let matchedItemId = null;
        for (const itemName of possibleItems) {
          if (itemMap.has(itemName)) {
            matchedItemId = itemMap.get(itemName);
            break;
          }
        }
        
        if (matchedItemId && matchedItemId !== req.required_equipment) {
          await client.query(`
            UPDATE "REQUEST_EQUIPMENTS"
            SET required_equipment = $1
            WHERE request_id = $2
          `, [matchedItemId, req.request_id]);
          fixedCount++;
        }
      }
    }
    console.log(`✅ 修復了 ${fixedCount} 筆工具需求\n`);
    
    await client.query('COMMIT');
    console.log('🎉 修復完成！');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 修復時發生錯誤:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

fixRequestMatching();

