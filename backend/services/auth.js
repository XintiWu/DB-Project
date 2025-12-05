import { pool } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Register a new user
 */
export const register = async (data) => {
  const { name, email, password, role = 'Member', phone } = data;

  try {
    // Check if user exists
    const checkSql = 'SELECT * FROM "USERS" WHERE email = $1';
    const checkRes = await pool.query(checkSql, [email]);
    if (checkRes.rows.length > 0) {
      throw new Error('Email already registered');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const insertSql = `
      INSERT INTO "USERS" (name, email, password_hash, role, phone, status)
      VALUES ($1, $2, $3, $4, $5, 'Active')
      RETURNING user_id, name, email, role;
    `;
    const { rows } = await pool.query(insertSql, [name, email, passwordHash, role, phone]);
    const user = rows[0];

    // Generate Token
    const token = jwt.sign({ id: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    return { user, token };
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Login user
 */
export const login = async (data) => {
  const { email, password } = data;

  try {
    // Find user
    const sql = 'SELECT * FROM "USERS" WHERE email = $1';
    const { rows } = await pool.query(sql, [email]);
    if (rows.length === 0) {
      throw new Error('此 Email 尚未註冊');
    }

    const user = rows[0];

    // Check password
    if (!user.password_hash) {
        // Handle legacy users or users without password
        throw new Error('此帳號尚未設定密碼，請聯繫管理員');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new Error('密碼錯誤，請重新輸入');
    }

    // Generate Token
    const token = jwt.sign({ id: user.user_id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

    // Return user info (excluding password)
    const { password_hash, ...userInfo } = user;
    return { user: userInfo, token };

  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};
