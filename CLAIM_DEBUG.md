# 認領功能調試指南

## 問題排查步驟

### 1. 檢查後端日誌
當認領失敗時，請查看後端控制台的輸出，應該會看到：
- `=== Bulk Accept Request ===`
- `Request body: ...`
- `bulkAcceptRequests called with: ...`
- `bulkAcceptRequests result: ...`

### 2. 檢查前端控制台
打開瀏覽器開發者工具（F12），查看 Console 標籤：
- 應該看到 `提交認領數據: ...`
- 如果失敗，會看到 `Claim failed: ...` 和詳細錯誤

### 3. 檢查網路請求
在瀏覽器開發者工具的 Network 標籤中：
- 找到 `request-accepters/bulk` 請求
- 查看 Request Payload（發送的數據）
- 查看 Response（後端返回的數據）
- 查看 Status Code（應該是 201 或 500）

### 4. 常見問題

#### 問題 1: "認領項目不能為空"
- **原因**：前端沒有正確發送 items 陣列
- **解決**：檢查 `claimItems` 是否為空

#### 問題 2: "無效的需求 ID"
- **原因**：`needId` 不是有效的數字
- **解決**：確保 `needId` 是有效的 request_id

#### 問題 3: "需求不存在"
- **原因**：request_id 在資料庫中不存在
- **解決**：檢查需求是否已被刪除或 ID 是否正確

#### 問題 4: "需求沒有關聯的物品"
- **原因**：Material/Tool 類型的需求沒有在 REQUEST_MATERIALS 表中的記錄
- **解決**：檢查需求是否正確創建了材料關聯

#### 問題 5: "您已經認領過此需求"
- **原因**：同一個用戶已經認領過這個需求
- **解決**：這是正常的，防止重複認領

#### 問題 6: "認領數量超過剩餘需求"
- **原因**：認領的數量超過了需求的剩餘數量
- **解決**：減少認領數量

### 5. 測試 API 端點

使用 curl 測試：

```bash
curl -X POST http://localhost:3000/api/request-accepters/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "claimerName": "測試用戶",
    "claimerPhone": "0912345678",
    "claimerEmail": "test@example.com",
    "notes": "測試",
    "items": [
      {
        "needId": "236",
        "needType": "material",
        "quantity": 5,
        "title": "測試需求",
        "category": "food",
        "unit": "件"
      }
    ]
  }'
```

### 6. 檢查資料庫

```sql
-- 檢查需求
SELECT request_id, type, required_qty, current_qty, status 
FROM "REQUESTS" 
WHERE request_id = 236;

-- 檢查材料關聯
SELECT * FROM "REQUEST_MATERIALS" WHERE request_id = 236;

-- 檢查認領記錄
SELECT * FROM "REQUEST_ACCEPTERS" WHERE request_id = 236;

-- 檢查認領物品記錄
SELECT * FROM "REQUEST_ITEM_ACCEPT" WHERE request_id = 236;
```

## 修復記錄

### 2025-12-05
1. ✅ 添加了詳細的日誌記錄
2. ✅ 改進了錯誤處理和錯誤訊息
3. ✅ 添加了重複認領檢查
4. ✅ 添加了數量驗證
5. ✅ 改進了前端錯誤顯示

## 下一步

如果問題仍然存在，請提供：
1. 後端控制台的完整錯誤日誌
2. 瀏覽器控制台的錯誤訊息
3. Network 標籤中的請求詳情（Request 和 Response）

