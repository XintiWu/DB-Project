# 點擊追蹤系統使用說明

## 重要：重啟後端服務器

在第一次使用點擊追蹤功能之前，**必須重啟後端服務器**以載入新的 analytics 路由。

### 步驟：

1. **停止當前後端服務器**
   - 找到運行 `npm start` 的終端窗口
   - 按 `Ctrl + C` 停止服務器

2. **重新啟動後端**
   ```bash
   cd backend
   npm start
   ```

3. **確認服務器已載入 analytics 路由**
   - 應該看到 "✅ MongoDB 連接成功" 的訊息
   - 服務器運行在 http://localhost:3000

## 使用生成測試資料腳本

### 正確的使用方式：

```bash
# 必須在 backend 目錄下執行
cd backend
node generate_click_data.js
```

### 錯誤的使用方式（會報錯）：

```bash
# ❌ 在項目根目錄執行會找不到文件
node generate_click_data.js
```

## 完整測試流程

1. **確保 MongoDB 運行**
   ```bash
   docker ps | grep mongo
   # 如果沒有運行，執行：
   docker start mongodb
   ```

2. **重啟後端服務器**（重要！）
   ```bash
   cd backend
   npm start
   ```

3. **生成測試點擊資料**
   ```bash
   cd backend
   node generate_click_data.js
   ```

4. **分析點擊資料**
   ```bash
   cd backend
   node analyze_clicks.js
   ```

## 常見問題

### Q: 為什麼會出現 HTTP 404 錯誤？
A: 後端服務器需要重啟以載入新的 analytics 路由。請停止並重新啟動後端服務器。

### Q: 為什麼會出現 "Cannot find module" 錯誤？
A: 必須在 `backend/` 目錄下執行腳本，不是在項目根目錄。

### Q: MongoDB 連接失敗怎麼辦？
A: 確保 Docker 容器正在運行：
```bash
docker ps | grep mongo
# 如果沒有，啟動它：
docker start mongodb
```

