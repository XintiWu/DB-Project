# backend/src/database/db_connector.py

# ⭐️ 這裡也使用絕對導入路徑：直接導入根目錄下的 config
from config import PG_CONFIG
import psycopg2

# 核心功能：從資料庫中取得所有使用者
def get_all_users_from_db():
  connection = None
  results = []

  # 建立連接字串
  conn_string = f"dbname={PG_CONFIG['dbname']} user={PG_CONFIG['user']} password={PG_CONFIG['password']} host={PG_CONFIG['host']} port={PG_CONFIG['port']}"

  try:
    # 建立 PostgreSQL 資料庫連線
    connection = psycopg2.connect(conn_string)

    # 建立游標
    # connection.cursor() 預設回傳元組 (tuple)，是最安全且高效能的方式
    with connection.cursor() as cursor:
      # 撰寫 SQL 查詢語句
      # 假設你的 users 表格有 id, username, email 欄位
      sql = " " # REPLACE THIS!!!!!!

      # 執行查詢
      cursor.execute(sql)

      # 獲取所有結果
      raw_results = cursor.fetchall()

      column_names = [desc[0] for desc in cursor.description]
      for row in raw_results:
        results.append(dict(zip(column_names, row)))

      return results

  except psycopg2.Error as e:
    # 處理連線或查詢錯誤
    print(f"PostgreSQL 錯誤: {e}")
    return []

  finally:
    # 確保連線關閉
    if connection:
      connection.close()
