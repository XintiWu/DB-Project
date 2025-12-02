from flask import Flask, jsonify
from flask_cors import CORS
# ⭐️ 導入我們定義好的資料庫操作函式
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

if __name__ == "__main__":
  print(f"Flask Server running on http://localhost:{PORT}")
  app.run(debug=True, port=PORT)
  with app.test_client() as client:
        response = client.get("/users")
        print(response.json)
