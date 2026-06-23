/**
 * 数据库迁移脚本 (Node.js)
 * 执行方式: node migrate.js
 */
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'mydb',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Aled2239',
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔧 开始数据库迁移...');

    // 读取并执行迁移 SQL
    const fs = await import('fs');
    const sql = fs.readFileSync('migrate.sql', 'utf8');
    await client.query(sql);

    console.log('✅ 数据库迁移完成');
  } catch (err) {
    if (err.message.includes('already exists') || err.code === '42701') {
      console.log('⚠️  部分列已存在（正常，跳过）');
    } else {
      console.error('❌ 迁移错误:', err.message);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
