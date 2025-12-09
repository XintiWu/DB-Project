import { pool } from './db.js';

async function checkTables() {
  try {
    // 檢查 REQUEST_ACCEPTS 表是否存在
    const checkAccepts = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'REQUEST_ACCEPTS'
      );
    `);
    
    // 檢查 REQUEST_ACCEPTERS 表是否存在
    const checkAccepters = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'REQUEST_ACCEPTERS'
      );
    `);
    
    const hasAccepts = checkAccepts.rows[0].exists;
    const hasAccepters = checkAccepters.rows[0].exists;
    
    console.log('📊 資料庫表檢查結果：');
    console.log(`  REQUEST_ACCEPTS 表: ${hasAccepts ? '✅ 存在' : '❌ 不存在'}`);
    console.log(`  REQUEST_ACCEPTERS 表: ${hasAccepters ? '✅ 存在' : '❌ 不存在'}`);
    
    if (hasAccepts) {
      // 檢查 REQUEST_ACCEPTS 表的結構
      const columns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'REQUEST_ACCEPTS'
        ORDER BY ordinal_position;
      `);
      console.log('\n  REQUEST_ACCEPTS 表的欄位：');
      columns.rows.forEach(col => {
        console.log(`    - ${col.column_name} (${col.data_type})`);
      });
    }
    
    if (hasAccepters) {
      // 檢查 REQUEST_ACCEPTERS 表的結構
      const columns = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'REQUEST_ACCEPTERS'
        ORDER BY ordinal_position;
      `);
      console.log('\n  REQUEST_ACCEPTERS 表的欄位：');
      columns.rows.forEach(col => {
        console.log(`    - ${col.column_name} (${col.data_type})`);
      });
    }
    
    // 提供建議
    console.log('\n💡 建議：');
    if (!hasAccepts && hasAccepters) {
      console.log('  資料庫使用舊架構（REQUEST_ACCEPTERS），需要：');
      console.log('  1. 創建 REQUEST_ACCEPTS 表，或');
      console.log('  2. 修改代碼使用 REQUEST_ACCEPTERS 表');
    } else if (hasAccepts && !hasAccepters) {
      console.log('  資料庫使用新架構（REQUEST_ACCEPTS），代碼應該可以正常工作');
    } else if (hasAccepts && hasAccepters) {
      console.log('  兩個表都存在，需要確認使用哪個表');
    } else {
      console.log('  兩個表都不存在，需要創建表');
    }
    
    await pool.end();
  } catch (error) {
    console.error('❌ 檢查失敗:', error);
    await pool.end();
    process.exit(1);
  }
}

checkTables();

