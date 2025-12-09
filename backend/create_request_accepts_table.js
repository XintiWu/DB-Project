import { pool } from './db.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createTable() {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    console.log('📋 創建 REQUEST_ACCEPTS 表...');
    
    // 檢查表是否已存在
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'REQUEST_ACCEPTS'
      );
    `);
    
    if (checkTable.rows[0].exists) {
      console.log('⚠️  REQUEST_ACCEPTS 表已存在，跳過創建');
      await client.query('COMMIT');
      return;
    }
    
    // 創建表
    await client.query(`
      CREATE TABLE "REQUEST_ACCEPTS" (
        request_id bigint NOT NULL,
        accepter_id bigint NOT NULL,
        created_at timestamp with time zone NOT NULL DEFAULT NOW(),
        "ETA" time with time zone,
        description text,
        source text,
        CONSTRAINT pk_request_accepts PRIMARY KEY (request_id, accepter_id)
      );
    `);
    
    console.log('✅ 表創建成功');
    
    // 添加外鍵約束
    console.log('📋 添加外鍵約束...');
    await client.query(`
      ALTER TABLE "REQUEST_ACCEPTS"
        ADD CONSTRAINT fk_request_accepts_request 
        FOREIGN KEY (request_id) REFERENCES "REQUESTS"(request_id) 
        ON DELETE CASCADE ON UPDATE CASCADE;
    `);
    
    await client.query(`
      ALTER TABLE "REQUEST_ACCEPTS"
        ADD CONSTRAINT fk_request_accepts_accepter 
        FOREIGN KEY (accepter_id) REFERENCES "USERS"(user_id) 
        ON DELETE CASCADE ON UPDATE CASCADE;
    `);
    
    console.log('✅ 外鍵約束添加成功');
    
    // 創建索引
    console.log('📋 創建索引...');
    await client.query(`
      CREATE INDEX idx_request_accepts_accepter_id ON "REQUEST_ACCEPTS"(accepter_id);
    `);
    
    await client.query(`
      CREATE INDEX idx_request_accepts_created_at ON "REQUEST_ACCEPTS"(created_at DESC);
    `);
    
    console.log('✅ 索引創建成功');
    
    await client.query('COMMIT');
    console.log('\n🎉 REQUEST_ACCEPTS 表創建完成！');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ 創建表失敗:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createTable().catch(console.error);

