// services/users.js
const db = require('../db'); 

/**
 * 取得所有使用者
 * List_all_users
 */
const getAllUsers = async () => {
  try {
    const sql = 'SELECT * FROM "USERS"';
    const { rows } = await db.query(sql);
    return rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw error; 
  }
};

/**
 * 建立新使用者
 */
const createUser = async (data) => {
  const { name, role, phone, status = 'active' } = data;

  try {
    const sql = `
      INSERT INTO "USERS" (name, role, phone, status)
      VALUES ($1, $2, $3, $4)
      RETURNING user_id, created_at;
    `;
    
    const values = [name, role, phone, status];
    const { rows } = await db.query(sql, values);
    
    return rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
};

/**
 * 更新使用者
 */
const updateUser = async (data) => {
  const { id, name, role, phone, status = 'active' } = data;

  try {
    const sql = `
      UPDATE "USERS" 
      SET name = $1, role = $2, phone = $3, status = $4 
      WHERE id = $5
      RETURNING *; 
    `;
    
    const values = [name, role, phone, status, id];
    const { rows } = await db.query(sql, values);
    
    return rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
};

/**
 * 刪除使用者
 */
const deleteUser = async (id) => {

  try {
    const sql = 'DELETE FROM "USERS" WHERE id = $1 RETURNING id';
    const { rows } = await db.query(sql, [id]);
    
    return rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw error;
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};