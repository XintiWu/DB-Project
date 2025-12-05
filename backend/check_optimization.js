import { pool } from './db.js';

/**
 * 檢查資料庫優化狀態
 */
const checkOptimization = async () => {
  try {
    console.log('🔍 檢查資料庫優化狀態...\n');

    // 1. 檢查主鍵約束
    console.log('📌 主鍵約束檢查：');
    console.log('─'.repeat(60));
    const pkQuery = `
      SELECT 
        tc.table_name,
        tc.constraint_name
      FROM information_schema.table_constraints tc
      WHERE tc.constraint_type = 'PRIMARY KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name;
    `;
    const pkResult = await pool.query(pkQuery);
    console.log(`✅ 找到 ${pkResult.rows.length} 個主鍵約束`);
    console.table(pkResult.rows);

    // 2. 檢查外鍵約束
    console.log('\n🔗 外鍵約束檢查：');
    console.log('─'.repeat(60));
    const fkQuery = `
      SELECT 
        tc.table_name as "表格",
        tc.constraint_name as "約束名稱",
        kcu.column_name as "欄位",
        ccu.table_name as "參照表格",
        ccu.column_name as "參照欄位"
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name;
    `;
    const fkResult = await pool.query(fkQuery);
    console.log(`✅ 找到 ${fkResult.rows.length} 個外鍵約束`);
    if (fkResult.rows.length > 0) {
      console.table(fkResult.rows.slice(0, 10)); // 只顯示前 10 個
      if (fkResult.rows.length > 10) {
        console.log(`... 還有 ${fkResult.rows.length - 10} 個外鍵約束`);
      }
    }

    // 3. 檢查索引
    console.log('\n📊 索引檢查：');
    console.log('─'.repeat(60));
    const idxQuery = `
      SELECT 
        schemaname as "Schema",
        tablename as "表格",
        indexname as "索引名稱",
        pg_size_pretty(pg_relation_size(indexrelid)) as "大小"
      FROM pg_indexes pi
      JOIN pg_stat_user_indexes psui ON pi.indexname = psui.indexname
      WHERE schemaname = 'public'
        AND pi.indexname NOT LIKE 'pk_%'  -- 排除主鍵索引
      ORDER BY tablename, indexname;
    `;
    const idxResult = await pool.query(idxQuery);
    console.log(`✅ 找到 ${idxResult.rows.length} 個查詢索引（不含主鍵）`);
    if (idxResult.rows.length > 0) {
      console.table(idxResult.rows.slice(0, 15)); // 只顯示前 15 個
      if (idxResult.rows.length > 15) {
        console.log(`... 還有 ${idxResult.rows.length - 15} 個索引`);
      }
    }

    // 4. 索引使用統計
    console.log('\n📈 索引使用統計（Top 10）：');
    console.log('─'.repeat(60));
    const statsQuery = `
      SELECT 
        schemaname as "Schema",
        tablename as "表格",
        indexname as "索引名稱",
        idx_scan as "掃描次數",
        idx_tup_read as "讀取行數",
        idx_tup_fetch as "取得行數"
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public'
      ORDER BY idx_scan DESC
      LIMIT 10;
    `;
    const statsResult = await pool.query(statsQuery);
    console.table(statsResult.rows);

    // 5. 表格統計
    console.log('\n📋 表格統計：');
    console.log('─'.repeat(60));
    const tableStatsQuery = `
      SELECT 
        schemaname as "Schema",
        tablename as "表格",
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as "總大小",
        pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as "表格大小",
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as "索引大小"
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    `;
    const tableStatsResult = await pool.query(tableStatsQuery);
    console.table(tableStatsResult.rows);

    // 6. 總結
    console.log('\n' + '='.repeat(60));
    console.log('📊 優化狀態總結：');
    console.log('='.repeat(60));
    console.log(`✅ 主鍵約束：${pkResult.rows.length} 個`);
    console.log(`✅ 外鍵約束：${fkResult.rows.length} 個`);
    console.log(`✅ 查詢索引：${idxResult.rows.length} 個`);
    
    // 計算總索引大小
    const totalIdxSizeQuery = `
      SELECT pg_size_pretty(SUM(pg_relation_size(indexrelid))) as total_size
      FROM pg_stat_user_indexes
      WHERE schemaname = 'public';
    `;
    const totalIdxSize = await pool.query(totalIdxSizeQuery);
    console.log(`💾 索引總大小：${totalIdxSize.rows[0].total_size}`);

    console.log('\n✨ 檢查完成！');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ 檢查過程發生錯誤:', error);
    process.exit(1);
  }
};

checkOptimization();

