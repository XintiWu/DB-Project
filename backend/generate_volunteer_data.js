// 生成志工貢獻度排行資料
import { pool } from './db.js';

const HUALIEN_TOWNSHIPS = [
  '花蓮縣花蓮市', '花蓮縣鳳林鎮', '花蓮縣玉里鎮', '花蓮縣新城鄉',
  '花蓮縣吉安鄉', '花蓮縣壽豐鄉', '花蓮縣光復鄉', '花蓮縣豐濱鄉',
  '花蓮縣瑞穗鄉', '花蓮縣富里鄉', '花蓮縣秀林鄉', '花蓮縣萬榮鄉',
  '花蓮縣卓溪鄉'
];

// 常見姓名
const NAMES = [
  '陳小明', '林志強', '黃美玲', '張文華', '王建國', '李淑芬', '劉志明',
  '吳雅婷', '鄭文傑', '許淑娟', '周建宏', '蔡美惠', '楊志偉', '謝淑芳',
  '羅文傑', '葉雅玲', '江建宏', '何美玲', '高志明', '徐淑芬', '孫文華',
  '馬建國', '朱雅婷', '胡志強', '郭美惠', '梁文傑', '蘇淑芬', '韓建宏',
  '唐雅玲', '馮志明', '于淑芳', '董文華', '鄧建國', '曹雅婷', '嚴志強'
];

async function generateVolunteerData() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 開始生成志工貢獻度排行資料...\n');
    
    await client.query('BEGIN');
    
    // 1. 獲取現有用戶（如果沒有足夠的用戶，創建一些）
    const userResult = await client.query('SELECT user_id, name FROM "USERS" WHERE role = \'Member\' LIMIT 50');
    let users = userResult.rows;
    
    // 如果用戶不足，創建一些新用戶
    if (users.length < 20) {
      console.log(`  現有用戶不足，創建 ${20 - users.length} 個新用戶...`);
      for (let i = users.length; i < 20; i++) {
        const name = NAMES[i % NAMES.length] + (i > NAMES.length ? `_${i}` : '');
        const email = `volunteer${i}@example.com`;
        const passwordHash = '$2a$10$dummyhash'; // 簡化的 hash
        
        const phone = `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
        const insertResult = await client.query(`
          INSERT INTO "USERS" (name, email, password_hash, role, status, phone)
          VALUES ($1, $2, $3, 'Member', 'Active', $4)
          RETURNING user_id, name
        `, [name, email, passwordHash, phone]);
        
        users.push(insertResult.rows[0]);
      }
    }
    
    console.log(`  ✅ 準備使用 ${users.length} 個用戶\n`);
    
    // 2. 獲取現有需求
    const requestResult = await client.query(`
      SELECT request_id FROM "REQUESTS" 
      WHERE status != 'Completed' 
      LIMIT 1000
    `);
    const requests = requestResult.rows;
    
    if (requests.length === 0) {
      console.log('  ⚠️  沒有可用的需求，無法生成志工資料');
      await client.query('ROLLBACK');
      return;
    }
    
    console.log(`  ✅ 找到 ${requests.length} 個可用需求\n`);
    
    // 3. 生成志工認領記錄（讓某些用戶認領更多，形成排行榜）
    const NUM_ACCEPTS = 200; // 生成 200 筆認領記錄
    const acceptCounts = {}; // 追蹤每個用戶的認領次數
    
    // 設定某些用戶為「超級志工」（認領更多）
    const superVolunteers = users.slice(0, 5); // 前 5 個用戶是超級志工
    const regularVolunteers = users.slice(5);
    
    console.log('  生成認領記錄...');
    
    for (let i = 0; i < NUM_ACCEPTS; i++) {
      let selectedUser;
      
      // 70% 機率選擇超級志工，30% 機率選擇一般志工
      if (Math.random() < 0.7 && superVolunteers.length > 0) {
        selectedUser = getRandomElement(superVolunteers);
      } else {
        selectedUser = getRandomElement(regularVolunteers);
      }
      
      const request = getRandomElement(requests);
      const qty = Math.floor(Math.random() * 10) + 1;
      
      // 檢查是否已經認領過這個需求（避免重複）
      const existingCheck = await client.query(`
        SELECT COUNT(*) FROM "REQUEST_ACCEPTS"
        WHERE request_id = $1 AND accepter_id = $2
      `, [request.request_id, selectedUser.user_id]);
      
      if (parseInt(existingCheck.rows[0].count) > 0) {
        continue; // 跳過已認領的需求
      }
      
      // 插入認領記錄
      await client.query(`
        INSERT INTO "REQUEST_ACCEPTS" 
        (request_id, accepter_id, qty, created_at, description, source)
        VALUES ($1, $2, $3, NOW() - INTERVAL '${Math.floor(Math.random() * 30)} days', $4, $5)
      `, [
        request.request_id,
        selectedUser.user_id,
        qty,
        `提供 ${qty} 單位協助`,
        '志工認領'
      ]);
      
      // 更新計數
      if (!acceptCounts[selectedUser.user_id]) {
        acceptCounts[selectedUser.user_id] = 0;
      }
      acceptCounts[selectedUser.user_id]++;
      
      // 更新需求的 current_qty
      await client.query(`
        UPDATE "REQUESTS"
        SET current_qty = LEAST(current_qty + $1, required_qty)
        WHERE request_id = $2
      `, [qty, request.request_id]);
      
      if ((i + 1) % 50 === 0) {
        console.log(`    ✅ 已生成 ${i + 1} / ${NUM_ACCEPTS} 筆認領記錄`);
      }
    }
    
    await client.query('COMMIT');
    
    console.log(`\n✅ 志工貢獻度排行資料生成完成！`);
    console.log(`   總認領記錄: ${NUM_ACCEPTS} 筆`);
    console.log(`   參與志工: ${Object.keys(acceptCounts).length} 人\n`);
    
    // 顯示前 10 名
    const topVolunteers = Object.entries(acceptCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    
    console.log('📊 前 10 名志工：');
    for (const [userId, count] of topVolunteers) {
      const user = users.find(u => u.user_id === parseInt(userId));
      console.log(`   ${user?.name || 'Unknown'}: ${count} 次`);
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 生成志工資料時發生錯誤:', error);
    throw error;
  } finally {
    client.release();
  }
}

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

generateVolunteerData()
  .then(() => {
    console.log('\n✅ 完成！');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ 錯誤:', error);
    process.exit(1);
  });
