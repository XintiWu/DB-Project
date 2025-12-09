import { pool } from './db.js';

async function verifyConstraints() {
  const client = await pool.connect();
  try {
    console.log('🔍 檢查資料庫約束和生成的資料...\n');

    // 1. 檢查 INVENTORIES 約束
    console.log('📦 檢查 INVENTORIES 表:');
    const invStatusCheck = await client.query(`
      SELECT COUNT(*) as invalid_count
      FROM "INVENTORIES"
      WHERE status NOT IN ('Active', 'Inactive')
    `);
    console.log(`  ✅ Status 約束檢查: ${invStatusCheck.rows[0].invalid_count} 筆不符合`);
    
    const invCount = await client.query('SELECT COUNT(*) FROM "INVENTORIES"');
    console.log(`  📊 總筆數: ${invCount.rows[0].count}`);

    // 2. 檢查 INVENTORY_ITEMS 約束
    console.log('\n📦 檢查 INVENTORY_ITEMS 表:');
    const invItemsStatusCheck = await client.query(`
      SELECT COUNT(*) as invalid_count
      FROM "INVENTORY_ITEMS"
      WHERE status NOT IN ('Available', 'Lent', 'Unavailable')
    `);
    console.log(`  ✅ Status 約束檢查: ${invItemsStatusCheck.rows[0].invalid_count} 筆不符合`);
    
    const invItemsCount = await client.query('SELECT COUNT(*) FROM "INVENTORY_ITEMS"');
    console.log(`  📊 總筆數: ${invItemsCount.rows[0].count}`);
    
    // 檢查外鍵約束
    const invItemsFKCheck = await client.query(`
      SELECT COUNT(*) as orphan_count
      FROM "INVENTORY_ITEMS" ii
      LEFT JOIN "INVENTORIES" i ON ii.inventory_id = i.inventory_id
      LEFT JOIN "ITEMS" it ON ii.item_id = it.item_id
      WHERE i.inventory_id IS NULL OR it.item_id IS NULL
    `);
    console.log(`  ✅ 外鍵約束檢查: ${invItemsFKCheck.rows[0].orphan_count} 筆孤立記錄`);

    // 3. 檢查 INVENTORY_OWNERS 約束
    console.log('\n👥 檢查 INVENTORY_OWNERS 表:');
    const ownersFKCheck = await client.query(`
      SELECT COUNT(*) as orphan_count
      FROM "INVENTORY_OWNERS" io
      LEFT JOIN "INVENTORIES" i ON io.inventory_id = i.inventory_id
      LEFT JOIN "USERS" u ON io.user_id = u.user_id
      WHERE i.inventory_id IS NULL OR u.user_id IS NULL
    `);
    console.log(`  ✅ 外鍵約束檢查: ${ownersFKCheck.rows[0].orphan_count} 筆孤立記錄`);
    
    const ownersCount = await client.query('SELECT COUNT(*) FROM "INVENTORY_OWNERS"');
    console.log(`  📊 總筆數: ${ownersCount.rows[0].count}`);

    // 4. 檢查 REQUESTS 約束
    console.log('\n📋 檢查 REQUESTS 表:');
    const reqStatusCheck = await client.query(`
      SELECT COUNT(*) as invalid_count
      FROM "REQUESTS"
      WHERE status NOT IN ('Not Completed', 'Completed')
    `);
    console.log(`  ✅ Status 約束檢查: ${reqStatusCheck.rows[0].invalid_count} 筆不符合`);
    
    const reqTypeCheck = await client.query(`
      SELECT COUNT(*) as invalid_count
      FROM "REQUESTS"
      WHERE type NOT IN ('Material', 'Tool', 'Humanpower')
    `);
    console.log(`  ✅ Type 約束檢查: ${reqTypeCheck.rows[0].invalid_count} 筆不符合`);
    
    const reqUrgencyCheck = await client.query(`
      SELECT COUNT(*) as invalid_count
      FROM "REQUESTS"
      WHERE urgency < 1 OR urgency > 5
    `);
    console.log(`  ✅ Urgency 約束檢查 (1-5): ${reqUrgencyCheck.rows[0].invalid_count} 筆不符合`);
    
    const reqFKCheck = await client.query(`
      SELECT COUNT(*) as orphan_count
      FROM "REQUESTS" r
      LEFT JOIN "USERS" u ON r.requester_id = u.user_id
      LEFT JOIN "INCIDENTS" i ON r.incident_id = i.incident_id
      WHERE u.user_id IS NULL OR i.incident_id IS NULL
    `);
    console.log(`  ✅ 外鍵約束檢查: ${reqFKCheck.rows[0].orphan_count} 筆孤立記錄`);
    
    const reqCount = await client.query('SELECT COUNT(*) FROM "REQUESTS"');
    console.log(`  📊 總筆數: ${reqCount.rows[0].count}`);

    // 5. 檢查 REQUEST_MATERIALS 約束
    console.log('\n📦 檢查 REQUEST_MATERIALS 表:');
    const reqMatFKCheck = await client.query(`
      SELECT COUNT(*) as orphan_count
      FROM "REQUEST_MATERIALS" rm
      LEFT JOIN "REQUESTS" r ON rm.request_id = r.request_id
      LEFT JOIN "ITEMS" i ON rm.item_id = i.item_id
      WHERE r.request_id IS NULL OR i.item_id IS NULL
    `);
    console.log(`  ✅ 外鍵約束檢查: ${reqMatFKCheck.rows[0].orphan_count} 筆孤立記錄`);
    
    const reqMatCount = await client.query('SELECT COUNT(*) FROM "REQUEST_MATERIALS"');
    console.log(`  📊 總筆數: ${reqMatCount.rows[0].count}`);

    // 6. 檢查 REQUEST_EQUIPMENTS 約束
    console.log('\n🔧 檢查 REQUEST_EQUIPMENTS 表:');
    const reqEquipFKCheck = await client.query(`
      SELECT COUNT(*) as orphan_count
      FROM "REQUEST_EQUIPMENTS" re
      LEFT JOIN "REQUESTS" r ON re.request_id = r.request_id
      LEFT JOIN "ITEMS" i ON re.required_equipment = i.item_id
      WHERE r.request_id IS NULL OR i.item_id IS NULL
    `);
    console.log(`  ✅ 外鍵約束檢查: ${reqEquipFKCheck.rows[0].orphan_count} 筆孤立記錄`);
    
    const reqEquipCount = await client.query('SELECT COUNT(*) FROM "REQUEST_EQUIPMENTS"');
    console.log(`  📊 總筆數: ${reqEquipCount.rows[0].count}`);

    // 7. 檢查 REQUEST_HUMANPOWER 約束
    console.log('\n👷 檢查 REQUEST_HUMANPOWER 表:');
    const reqHumanFKCheck = await client.query(`
      SELECT COUNT(*) as orphan_count
      FROM "REQUEST_HUMANPOWER" rh
      LEFT JOIN "REQUESTS" r ON rh.request_id = r.request_id
      LEFT JOIN "SKILL_TAGS" s ON rh.skill_tag_id = s.skill_tag_id
      WHERE r.request_id IS NULL OR s.skill_tag_id IS NULL
    `);
    console.log(`  ✅ 外鍵約束檢查: ${reqHumanFKCheck.rows[0].orphan_count} 筆孤立記錄`);
    
    const reqHumanCount = await client.query('SELECT COUNT(*) FROM "REQUEST_HUMANPOWER"');
    console.log(`  📊 總筆數: ${reqHumanCount.rows[0].count}`);

    // 8. 檢查地址是否都在花蓮縣
    console.log('\n📍 檢查地址範圍:');
    const addressCheck = await client.query(`
      SELECT COUNT(*) as non_hualien_count
      FROM "REQUESTS"
      WHERE address NOT LIKE '花蓮縣%'
    `);
    console.log(`  ✅ 花蓮縣地址檢查: ${addressCheck.rows[0].non_hualien_count} 筆不在花蓮縣`);
    
    const locationCheck = await client.query(`
      SELECT COUNT(*) as out_of_range
      FROM "REQUESTS"
      WHERE latitude < 23.4 OR latitude > 24.5 
         OR longitude < 121.0 OR longitude > 121.8
    `);
    console.log(`  ✅ 經緯度範圍檢查: ${locationCheck.rows[0].out_of_range} 筆超出花蓮縣範圍`);

    console.log('\n✅ 約束檢查完成！');
    
  } catch (error) {
    console.error('❌ 檢查時發生錯誤:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

verifyConstraints();

