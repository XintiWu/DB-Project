import { pool } from './db.js';

// 四個測試查詢
const QUERIES = [
  {
    name: '需求列表（多表 JOIN）',
    sql: `
      EXPLAIN ANALYZE
      SELECT 
        r.request_id,
        r.title,
        r.address,
        r.status,
        r.urgency,
        rm.qty AS required_qty,
        COALESCE(r.current_qty, 0) AS current_qty,
        i.item_name,
        i.unit,
        ic.category_name
      FROM "REQUESTS" r
      JOIN "REQUEST_MATERIALS" rm ON r.request_id = rm.request_id
      JOIN "ITEMS" i ON rm.item_id = i.item_id
      LEFT JOIN "ITEM_CATEGORIES" ic ON i.category_id = ic.category_id
      WHERE r.status = 'Not Completed'
      ORDER BY r.urgency DESC, r.created_at DESC;
    `
  },
  {
    name: '依類型統計數量',
    sql: `
      EXPLAIN ANALYZE
      SELECT type, COUNT(*) AS count
      FROM "REQUESTS"
      GROUP BY type
      ORDER BY count DESC;
    `
  },
  {
    name: '熱門物資 Top 5',
    sql: `
      EXPLAIN ANALYZE
      SELECT 
        i.item_name,
        SUM(rm.qty) AS total_qty
      FROM "REQUEST_MATERIALS" rm
      JOIN "ITEMS" i ON rm.item_id = i.item_id
      GROUP BY i.item_name
      ORDER BY total_qty DESC
      LIMIT 5;
    `
  },
  {
    name: '可用倉庫與庫存',
    sql: `
      EXPLAIN ANALYZE
      SELECT 
        i.inventory_id,
        i.address,
        i.status,
        SUM(ii.qty) AS total_qty
      FROM "INVENTORIES" i
      JOIN "INVENTORY_ITEMS" ii ON i.inventory_id = ii.inventory_id
      WHERE i.status = 'Active'
      GROUP BY i.inventory_id, i.address, i.status
      HAVING SUM(ii.qty) > 0
      ORDER BY i.inventory_id;
    `
  }
];

// 索引建立 SQL
const INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_requests_status ON "REQUESTS"(status);',
  'CREATE INDEX IF NOT EXISTS idx_requests_type ON "REQUESTS"(type);',
  'CREATE INDEX IF NOT EXISTS idx_requests_urgency ON "REQUESTS"(urgency);',
  'CREATE INDEX IF NOT EXISTS idx_inventories_status ON "INVENTORIES"(status);'
];

// 刪除索引 SQL
const DROP_INDEXES = [
  'DROP INDEX IF EXISTS idx_requests_status;',
  'DROP INDEX IF EXISTS idx_requests_type;',
  'DROP INDEX IF EXISTS idx_requests_urgency;',
  'DROP INDEX IF EXISTS idx_inventories_status;'
];

// 從 EXPLAIN ANALYZE 結果中提取執行時間（毫秒）
function extractExecutionTime(result) {
  const text = result.rows.map(r => r['QUERY PLAN']).join('\n');
  const match = text.match(/Execution Time: ([\d.]+) ms/);
  if (match) {
    return parseFloat(match[1]);
  }
  return null;
}

// 計算平均值
function mean(values) {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

// 計算標準差
function standardDeviation(values) {
  const avg = mean(values);
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = mean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

// 執行單個查詢多次並返回結果
async function runQueryMultipleTimes(query, times = 5) {
  const results = [];
  for (let i = 0; i < times; i++) {
    try {
      const result = await pool.query(query.sql);
      const execTime = extractExecutionTime(result);
      if (execTime !== null) {
        results.push(execTime);
        console.log(`  第 ${i + 1} 次: ${execTime.toFixed(3)} ms`);
      } else {
        console.log(`  第 ${i + 1} 次: 無法解析執行時間`);
      }
    } catch (error) {
      console.error(`  第 ${i + 1} 次執行失敗:`, error.message);
    }
  }
  return results;
}

// 主函數
async function benchmark() {
  const client = await pool.connect();
  try {
    console.log('🚀 開始效能測試...\n');
    
    // 先刪除現有索引（如果存在）
    console.log('📋 步驟 1: 刪除現有索引（如果存在）...');
    for (const dropIndex of DROP_INDEXES) {
      try {
        await client.query(dropIndex);
      } catch (error) {
        // 忽略不存在的索引錯誤
      }
    }
    console.log('✅ 索引已刪除\n');
    
    // 測試 1: 建立索引前
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 測試 1: 建立索引前的效能');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const beforeResults = {};
    
    for (const query of QUERIES) {
      console.log(`\n🔍 查詢: ${query.name}`);
      console.log('執行 5 次測試...');
      const times = await runQueryMultipleTimes(query, 5);
      
      if (times.length > 0) {
        const avg = mean(times);
        const std = standardDeviation(times);
        const avgSeconds = avg / 1000;
        const stdSeconds = std / 1000;
        
        beforeResults[query.name] = {
          times: times.map(t => t / 1000), // 轉換為秒
          average: avgSeconds,
          stdDev: stdSeconds
        };
        
        console.log(`\n📈 統計結果:`);
        console.log(`  執行時間（秒）: ${times.map(t => (t / 1000).toFixed(3)).join('、')}`);
        console.log(`  平均執行時間: ${avgSeconds.toFixed(4)} 秒`);
        console.log(`  標準差: ${stdSeconds.toFixed(4)} 秒`);
      }
    }
    
    // 建立索引
    console.log('\n\n📋 步驟 2: 建立索引...');
    for (const createIndex of INDEXES) {
      try {
        await client.query(createIndex);
        console.log(`  ✅ ${createIndex.split('ON')[0].trim()}`);
      } catch (error) {
        console.error(`  ❌ 建立索引失敗: ${error.message}`);
      }
    }
    console.log('✅ 索引建立完成\n');
    
    // 測試 2: 建立索引後
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 測試 2: 建立索引後的效能');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const afterResults = {};
    
    for (const query of QUERIES) {
      console.log(`\n🔍 查詢: ${query.name}`);
      console.log('執行 5 次測試...');
      const times = await runQueryMultipleTimes(query, 5);
      
      if (times.length > 0) {
        const avg = mean(times);
        const std = standardDeviation(times);
        const avgSeconds = avg / 1000;
        const stdSeconds = std / 1000;
        
        afterResults[query.name] = {
          times: times.map(t => t / 1000), // 轉換為秒
          average: avgSeconds,
          stdDev: stdSeconds
        };
        
        console.log(`\n📈 統計結果:`);
        console.log(`  執行時間（秒）: ${times.map(t => (t / 1000).toFixed(3)).join('、')}`);
        console.log(`  平均執行時間: ${avgSeconds.toFixed(4)} 秒`);
        console.log(`  標準差: ${stdSeconds.toFixed(4)} 秒`);
      }
    }
    
    // 輸出比較結果
    console.log('\n\n═══════════════════════════════════════════════════════');
    console.log('📊 效能比較總結');
    console.log('═══════════════════════════════════════════════════════\n');
    
    for (const query of QUERIES) {
      const before = beforeResults[query.name];
      const after = afterResults[query.name];
      
      if (before && after) {
        const improvement = ((before.average - after.average) / before.average * 100).toFixed(2);
        console.log(`\n${query.name}:`);
        console.log(`  建立索引前: 平均 ${before.average.toFixed(4)} 秒，標準差 ${before.stdDev.toFixed(4)} 秒`);
        console.log(`  建立索引後: 平均 ${after.average.toFixed(4)} 秒，標準差 ${after.stdDev.toFixed(4)} 秒`);
        console.log(`  效能提升: ${improvement}%`);
      }
    }
    
    // 輸出 LaTeX 格式的數據
    console.log('\n\n═══════════════════════════════════════════════════════');
    console.log('📝 LaTeX 報告用數據');
    console.log('═══════════════════════════════════════════════════════\n');
    
    for (const query of QUERIES) {
      const before = beforeResults[query.name];
      const after = afterResults[query.name];
      
      if (before && after) {
        console.log(`\n${query.name}:`);
        console.log(`建立索引前運行五次的結果分別是 ${before.times.map(t => t.toFixed(3)).join('、')} 秒，`);
        console.log(`平均運行時間約為 ${before.average.toFixed(4)} 秒，標準差約為 ${before.stdDev.toFixed(4)} 秒；`);
        console.log(`建立索引後運行五次的結果分別是 ${after.times.map(t => t.toFixed(3)).join('、')} 秒，`);
        console.log(`平均運行時間約為 ${after.average.toFixed(4)} 秒，標準差約為 ${after.stdDev.toFixed(4)} 秒。`);
      }
    }
    
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

// 執行測試
benchmark().catch(console.error);


