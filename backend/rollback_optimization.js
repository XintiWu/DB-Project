import { pool } from './db.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * 回滾效能優化
 */
const rollbackOptimization = async () => {
  try {
    console.log('⚠️  開始回滾效能優化...\n');
    
    const confirm = process.argv.includes('--confirm');
    if (!confirm) {
      console.log('❌ 此操作將刪除所有主鍵、外鍵和索引！');
      console.log('   如要執行，請使用：node rollback_optimization.js --confirm\n');
      process.exit(1);
    }

    // 讀取回滾 SQL 腳本
    const sqlFilePath = join(__dirname, 'rollback_optimization.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    // 分割 SQL 語句
    const statements = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`📋 共有 ${statements.length} 個回滾語句需要執行\n`);

    let successCount = 0;
    let failCount = 0;

    // 逐一執行回滾語句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      const match = statement.match(/^(DROP INDEX|ALTER TABLE)\s+(?:IF EXISTS\s+)?"?(\w+)"?/i);
      const action = match ? match[1].toUpperCase() : 'EXECUTE';
      const target = match ? match[2] : '';
      
      process.stdout.write(`[${i + 1}/${statements.length}] ${action} ${target}...`);

      try {
        await pool.query(statement);
        console.log(' ✅');
        successCount++;
      } catch (error) {
        console.log(' ⚠️');
        if (!error.message.includes('does not exist')) {
          failCount++;
          console.log(`   錯誤: ${error.message}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 回滾結果統計：');
    console.log('='.repeat(60));
    console.log(`✅ 成功: ${successCount} 個語句`);
    console.log(`❌ 失敗: ${failCount} 個語句`);
    
    console.log('\n✨ 回滾完成！');
    console.log('⚠️  資料庫已恢復到優化前的狀態\n');

    process.exit(failCount > 0 ? 1 : 0);

  } catch (error) {
    console.error('❌ 回滾過程發生錯誤:', error);
    process.exit(1);
  }
};

rollbackOptimization();






