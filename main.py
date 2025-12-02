import sys
import os

# ⭐️ 調整系統路徑：將 backend/ (父目錄) 加入到搜尋路徑中
# 這樣 Python 就能找到 src/
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.database.db_connector import get_all_users_from_db

app = Flask(__name__)
# 設定 CORS 允許前端存取 (假設前端在 5173)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
PORT = 5000


# 核心功能：定義 GET /api/users 介面
@app.route('/api/users', methods=['GET'])
def list_users():
  # 呼叫資料庫操作模組，取得使用者資料
  users = get_all_users_from_db()

  if users:
    # 成功取得資料，回傳 200 OK 和 JSON 列表
    return jsonify({
      "status": "success",
      "count": len(users),
      "data": users
    }), 200
  else:
    # 如果資料庫連線失敗或沒有資料
    return jsonify({
      "status": "error",
      "message": "無法取得使用者資料或資料庫連線錯誤"
    }), 500


if __name__ == '__main__':
  print(f"Flask Server running on http://localhost:{PORT}")
  app.run(debug=True, port=PORT)
