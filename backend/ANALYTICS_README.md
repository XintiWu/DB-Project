# 點擊追蹤與分析系統

這是一個使用 MongoDB (NoSQL) 來追蹤和分析用戶點擊行為的系統。

## 功能特點

- ✅ 自動追蹤頁面訪問
- ✅ 追蹤導航點擊
- ✅ 追蹤按鈕和功能點擊
- ✅ 時間段分析（按小時、按星期）
- ✅ 用戶行為路徑分析
- ✅ 最熱門功能統計

## 設置步驟

### 1. 安裝依賴

```bash
cd backend
npm install
```

### 2. 設置 MongoDB

確保 MongoDB 正在運行。可以選擇：

**選項 A: 本地 MongoDB**
```bash
# 安裝並啟動 MongoDB (macOS)
brew services start mongodb-community

# 或使用 Docker
docker run -d -p 27017:27017 --name mongodb mongo
```

**選項 B: MongoDB Atlas (雲端)**
- 在 [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) 創建免費帳號
- 獲取連接字串

### 3. 配置環境變數

在 `backend/.env` 中添加：

```env
# MongoDB 連接（本地）
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=disaster_platform_analytics

# 或 MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
```

### 4. 啟動後端服務

```bash
cd backend
npm start
```

後端會自動連接到 MongoDB。

## 使用方式

### 前端自動追蹤

前端已經自動集成點擊追蹤：
- 頁面訪問會自動記錄
- 導航連結點擊會自動記錄
- 按鈕點擊會自動記錄

### 生成測試資料

```bash
cd backend
node generate_click_data.js
```

這會生成：
- 50 個模擬用戶
- 每個用戶 20-100 次點擊
- 過去 30 天的資料

### 分析點擊資料

```bash
cd backend
node analyze_clicks.js
```

分析結果包括：
- 📄 頁面訪問統計
- 🎯 功能點擊統計
- 🔥 最熱門功能 Top 20
- ⏰ 按小時的訪問分佈
- 📅 按星期的訪問分佈
- 🛤️ 用戶行為路徑
- 📈 總體統計

## API 端點

### 記錄點擊
```http
POST /api/analytics/clicks
Content-Type: application/json

{
  "userId": "user_123",
  "page": "requests",
  "action": "button_click",
  "element": "認領",
  "metadata": {}
}
```

### 獲取頁面統計
```http
GET /api/analytics/pages?startDate=2024-01-01&endDate=2024-01-31
```

### 獲取功能統計
```http
GET /api/analytics/features?startDate=2024-01-01&endDate=2024-01-31
```

### 獲取時間分析
```http
GET /api/analytics/time?groupBy=hour
GET /api/analytics/time?groupBy=day
```

### 獲取用戶行為路徑
```http
GET /api/analytics/paths?limit=10
```

### 獲取最熱門功能
```http
GET /api/analytics/top-features?limit=20
```

## 資料結構

### 點擊事件 (clicks collection)

```javascript
{
  _id: ObjectId,
  userId: "user_123",
  page: "requests",
  action: "button_click",
  element: "認領",
  metadata: {
    sessionId: "session_123",
    // 其他自定義資料
  },
  timestamp: ISODate("2024-01-15T10:30:00Z"),
  date: "2024-01-15",
  hour: 10,
  dayOfWeek: 1, // 0 = Sunday
  userAgent: "Mozilla/5.0...",
  ip: "127.0.0.1"
}
```

## 分析範例

### 找出最常用的功能

```bash
node analyze_clicks.js
```

查看 "🔥 最熱門功能 Top 20" 部分。

### 找出用戶最常訪問的頁面

查看 "📄 頁面訪問統計" 部分。

### 找出用戶活躍時間

查看 "⏰ 按小時的訪問分佈" 部分。

## 注意事項

1. **隱私保護**: 點擊資料包含用戶行為，請遵守隱私法規
2. **資料清理**: 定期清理舊資料以節省空間
3. **效能**: 大量資料時考慮添加索引
4. **備份**: 定期備份 MongoDB 資料

## 擴展功能

可以添加的功能：
- 用戶會話分析
- A/B 測試追蹤
- 轉換率分析
- 漏斗分析
- 即時儀表板

