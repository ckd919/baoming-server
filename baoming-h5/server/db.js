/**
 * PostgreSQL 连接池
 */
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({
  host:     process.env.DB_HOST || '127.0.0.1',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'mydb',
  user:     process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Aled2239',
  max: 10,
  idleTimeoutMillis: 30000,
});

// 测试连接
pool.query('SELECT NOW()')
  .then(() => console.log('✅ PostgreSQL 连接成功'))
  .catch(err => console.error('❌ PostgreSQL 连接失败:', err.message));

export default pool;
