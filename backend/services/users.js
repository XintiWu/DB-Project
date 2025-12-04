// services/users.js
import { pool } from '../db.js';

/**
 * 取得所有使用者
 * List_all_users
 */
export const getAllUsers = async () => {
  try {
    const sql = 'SELECT * FROM "USERS"';
    const { rows } = await pool.query(sql);
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw error; 
  }
};

/**
 * 取得單一使用者
 */
export const getUserById = async (id) => {
  try {
    const sql = 'SELECT * FROM "USERS" WHERE user_id = $1';
    const { rows } = await pool.query(sql, [id]);
    return rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
};

/**
 * 建立新使用者
 */
export const createUser = async (data) => {
  const { name, role, phone, status = 'Active' } = data;

  try {
    const sql = `
      INSERT INTO "USERS" (name, role, phone, status)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id, created_at;
    `;
    
    const values = [name, role, phone, status];
    const { rows } = await pool.query(sql, values);
    
    return rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
};

/**
 * 更新使用者
 */
export const updateUser = async (data) => {
  const { id, name, role, phone, status = 'Active' } = data;

  try {
    const sql = `
      UPDATE "USERS" 
      SET name = $1, role = $2, phone = $3, status = $4 
      WHERE user_id = $5
      RETURNING *; 
    `;
    
    const values = [name, role, phone, status, id];
    const { rows } = await pool.query(sql, values);
    
    return rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
};

/**
 * 刪除使用者
 */
export const deleteUser = async (id) => {

  try {
    const sql = 'DELETE FROM "USERS" WHERE user_id = $1 RETURNING user_id';
    const { rows } = await pool.query(sql, [id]);
    
    return rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
};