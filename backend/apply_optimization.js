import { pool } from './db.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 執行效能優化腳本
 */
const applyOptimization = async () => {
  try {
    console.log('🚀 開始執行效能優化...\n');

    // 讀取 SQL 腳本
    const sqlFilePath = join(__dirname, 'performance_optimization.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // 分割 SQL 語句（以分號分隔，但忽略註解中的分號）
    const statements = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📋 共有 ${statements.length} 個 SQL 語句需要執行\n`);

    let successCount = 0;
    let failCount = 0;
    const errors = [];

    // 逐一執行 SQL 語句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // 跳過 ANALYZE 語句的輸出
      const isAnalyze = statement.toUpperCase().startsWith('ANALYZE');
      
      if (!isAnalyze) {
        // 提取語句類型
        const match = statement.match(/^(ALTER TABLE|CREATE INDEX|ANALYZE)\s+"?(\w+)"?/i);
        const action = match ? match[1].toUpperCase() : 'EXECUTE';
        const table = match ? match[2] : '';
        
        process.stdout.write(`[${i + 1}/${statements.length}] ${action} ${table}...`);
      }

      try {
        await pool.query(statement);
        
        if (!isAnalyze) {
          console.log(' ✅');
        }
        successCount++;
      } catch (error) {
        if (!isAnalyze) {
          console.log(' ❌');
        }
        
        // 檢查是否為已存在的錯誤（可以忽略）
        if (error.message.includes('already exists') || 
            error.message.includes('does not exist')) {
          console.log(`   ⚠️  ${error.message}`);
        } else {
          failCount++;
          errors.push({
            statement: statement.substring(0, 100) + '...',
            error: error.message
          });
          console.log(`   ❌ 錯誤: ${error.message}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 執行結果統計：');
    console.log('='.repeat(60));
    console.log(`✅ 成功: ${successCount} 個語句`);
    console.log(`❌ 失敗: ${failCount} 個語句`);
    
    if (errors.length > 0) {
      console.log('\n❌ 錯誤詳情：');
      errors.forEach((err, index) => {
        console.log(`\n${index + 1}. ${err.statement}`);
        console.log(`   錯誤: ${err.error}`);
      });
    }

    // 顯示優化後的統計資訊
    console.log('\n' + '='.repeat(60));
    console.log('📈 資料庫索引統計：');
    console.log('='.repeat(60));
    
    const indexStats = await pool.query(`
      SELECT 
        schemaname,
        tablename,
        COUNT(*) as index_count
      FROM pg_indexes
      WHERE schemaname = 'public'
      GROUP BY schemaname, tablename
      ORDER BY index_count DESC;
    `);

    console.table(indexStats.rows);

    console.log('\n✨ 效能優化完成！');
    console.log('\n建議：');
    console.log('1. 執行 VACUUM ANALYZE 來更新統計資訊');
    console.log('2. 使用 EXPLAIN ANALYZE 檢查關鍵查詢的執行計劃');
    console.log('3. 監控系統效能，必要時調整索引策略\n');

    process.exit(failCount > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ 執行過程發生嚴重錯誤:', error);
    process.exit(1);
  }
};

applyOptimization();

