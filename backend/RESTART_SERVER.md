# 重啟後端服務器

## 問題
認領功能返回 404，因為服務器需要重啟以載入新的路由。

## 解決方法

### 方法 1: 手動重啟
1. 找到運行後端的終端窗口
2. 按 `Ctrl+C` 停止服務器
3. 運行 `npm start` 或 `node server.js` 重新啟動

### 方法 2: 使用腳本重啟
```bash
cd backend
# 停止現有服務器（如果有的話）
pkill -f "node server.js"
# 重新啟動
node server.js
```

### 方法 3: 檢查服務器是否正在運行
```bash
ps aux | grep "node.*server.js"
```

如果看到進程，需要先停止它：
```bash
kill <PID>
```

然後重新啟動。

## 驗證
重啟後，測試端點：
```bash
curl -X POST http://localhost:3000/api/request-accepters/bulk \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'
```

應該看到後端控制台輸出：
```
=== Bulk Accept Request ===
```

而不是 404 錯誤。

