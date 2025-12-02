# backend/config.py

# 💡 請將這些參數替換成你自己的 PostgreSQL 連線資訊
PG_CONFIG = {
    'host': 'localhost',
    'port': '5432',                 # PostgreSQL 預設埠號
    'user': 'postgres',         # 替換成你的 PG 使用者名稱
    'password': '', # 替換成你的 PG 密碼
    'dbname': 'disaster_platform'     # 替換成你的 PG 資料庫名稱
}
