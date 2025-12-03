import { pool } from "../db.js";

export function createBaseController(tableName, primaryKey = null) {
  const pk = primaryKey || `${tableName.toLowerCase()}_id`;

  return {
    // 取得全部
    async getAll(req, res) {
      try {
        const result = await pool.query(`SELECT * FROM "${tableName}"`);
        res.json(result.rows);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    // 取得單筆
    async getOne(req, res) {
      try {
        const id = req.params.id;
        const result = await pool.query(
          `SELECT * FROM "${tableName}" WHERE "${pk}"=$1`,
          [id]
        );
        res.json(result.rows[0] || null);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    // 新增
    async create(req, res) {
      try {
        const keys = Object.keys(req.body);
        const values = Object.values(req.body);

        const placeholders = keys.map((_, i) => `$${i + 1}`).join(",");

        const sql = `
          INSERT INTO "${tableName}" (${keys.join(",")})
          VALUES (${placeholders})
          RETURNING *`;
        
        const result = await pool.query(sql, values);
        res.json(result.rows[0]);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    // 更新
    async update(req, res) {
      try {
        const id = req.params.id;
        const keys = Object.keys(req.body);
        const values = Object.values(req.body);

        const setters = keys.map((k, i) => `"${k}"=$${i + 1}`).join(",");

        const sql = `
          UPDATE "${tableName}" SET ${setters}
          WHERE "${pk}"=$${keys.length + 1}
          RETURNING *`;

        const result = await pool.query(sql, [...values, id]);
        res.json(result.rows[0]);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    },

    // 删除
    async remove(req, res) {
      try {
        const id = req.params.id;

        const result = await pool.query(
          `DELETE FROM "${tableName}" WHERE "${pk}"=$1 RETURNING *`,
          [id]
        );

        res.json(result.rows[0] || null);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    }
  };
}
