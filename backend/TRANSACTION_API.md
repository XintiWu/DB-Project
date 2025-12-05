# 交易管理 (Transaction) API 使用說明

本文檔說明所有使用資料庫 Transaction 保證數據一致性的 API 端點。

---

## 1. 借出物品 (Lend Item)

### 端點
`POST /api/lends`

### 功能
借出物品時會自動：
1. 檢查庫存是否足夠（使用行鎖 `FOR UPDATE`）
2. 扣減庫存數量
3. 創建借出記錄

### 請求參數
```json
{
  "user_id": 1,           // 借用者 ID
  "item_id": 5,           // 物品 ID
  "qty": 10,              // 借用數量
  "from_inventory_id": 2  // 來源庫存 ID
}
```

### 成功響應
```json
{
  "lend_id": 123,
  "user_id": 1,
  "item_id": 5,
  "qty": 10,
  "from_inventory_id": 2,
  "lend_at": "2025-12-05T08:30:00.000Z",
  "returned_at": null
}
```

### 錯誤情況
- **庫存不足**：`庫存不足：目前庫存 5，需要 10`
- **物品不存在**：`此庫存中沒有該物品`

### Transaction 保證
- 庫存扣減和借出記錄創建為原子操作
- 使用行鎖防止並發導致的超賣問題

---

## 2. 歸還物品 (Return Item)

### 端點
`PUT /api/lends/:id/return`

### 功能
歸還物品時會自動：
1. 獲取借出記錄詳情（使用行鎖）
2. 更新歸還時間戳
3. 恢復庫存數量

### 請求參數
無需 body，lend_id 在 URL 中

### 成功響應
```json
{
  "lend_id": 123,
  "user_id": 1,
  "item_id": 5,
  "qty": 10,
  "from_inventory_id": 2,
  "lend_at": "2025-12-05T08:30:00.000Z",
  "returned_at": "2025-12-06T10:15:00.000Z"
}
```

### 錯誤情況
- **重複歸還**：`此物品已經歸還過了`
- **記錄不存在**：`借出記錄不存在`

### Transaction 保證
- 更新歸還時間和恢復庫存為原子操作
- 防止重複歸還導致的庫存錯誤

---

## 3. 物資提供 (Provide Item)

### 端點
`POST /api/provides`

### 功能
提供物資時會自動：
1. 創建提供記錄
2. 增加庫存數量（若物品不存在則新增）

### 請求參數
```json
{
  "user_id": 2,        // 提供者 ID
  "item_id": 8,        // 物品 ID
  "qty": 50,           // 提供數量
  "inventory_id": 1    // 目標庫存 ID（必填）
}
```

### 成功響應
```json
{
  "provide_id": 456,
  "user_id": 2,
  "item_id": 8,
  "qty": 50,
  "provide_date": "2025-12-05T09:00:00.000Z"
}
```

### 錯誤情況
- **缺少庫存 ID**：`必須指定庫存 ID (inventory_id)`

### Transaction 保證
- 提供記錄創建和庫存增加為原子操作
- 自動處理新物品插入或現有物品更新

---

## 4. 接受需求 (Accept Request)

### 端點
`POST /api/request-accepters`

### 功能
接受需求時會自動：
1. 獲取需求詳情並鎖定
2. 創建接受者記錄
3. 根據需求類型創建詳細記錄
4. 更新需求的當前數量
5. 檢查是否達成需求，自動標記為完成

### 請求參數（物資/工具需求）
```json
{
  "request_id": 10,      // 需求 ID
  "accepter_id": 3,      // 接受者 ID
  "items": [             // 提供的物品列表
    {
      "item_id": 5,
      "qty": 20
    },
    {
      "item_id": 8,
      "qty": 15
    }
  ]
}
```

### 請求參數（人力需求）
```json
{
  "request_id": 11,    // 需求 ID
  "accepter_id": 3,    // 接受者 ID
  "qty": 5             // 提供的人數
}
```

### 成功響應
```json
{
  "accepter": {
    "request_id": 10,
    "accepter_id": 3,
    "created_at": "2025-12-05T10:00:00.000Z"
  },
  "request": {
    "request_id": 10,
    "requester_id": 1,
    "status": "Completed",    // 或 "Not Completed"
    "required_qty": 50,
    "current_qty": 50,        // 已達成
    ...
  },
  "qtyAccepted": 35           // 本次接受的總數量
}
```

### 錯誤情況
- **需求不存在**：`需求不存在`
- **物資需求缺少 items**：`物資/工具需求必須提供 items 陣列`
- **人力需求缺少 qty**：`人力需求必須提供 qty（人數）`
- **未知需求類型**：`未知的需求類型: XXX`

### Transaction 保證
- 所有相關表的更新為原子操作
- 自動檢查並更新需求完成狀態
- 防止並發接受導致的數量錯誤

---

## 已實現的其他 Transaction

### 5. 創建需求 (Create Request)
**端點**: `POST /api/requests`

創建需求時會自動：
1. 插入基本需求記錄
2. 根據類型插入相關詳細記錄（物資/人力/裝備）

### 6. 創建庫存 (Create Inventory)
**端點**: `POST /api/inventories`

創建庫存時會自動：
1. 插入庫存記錄
2. 創建庫存擁有者關聯

---

## Transaction 使用的技術特性

### 行鎖 (Row Locking)
使用 `FOR UPDATE` 鎖定關鍵行，防止並發問題：
```sql
SELECT qty FROM "INVENTORY_ITEMS"
WHERE inventory_id = $1 AND item_id = $2
FOR UPDATE;
```

### 原子操作
所有相關操作包裹在 `BEGIN`...`COMMIT` 中：
- 任一步驟失敗，自動 `ROLLBACK`
- 確保數據一致性

### 錯誤處理
所有 Transaction 函數都會：
1. 捕獲錯誤
2. 執行 ROLLBACK
3. 釋放資料庫連接
4. 拋出有意義的錯誤訊息

---

## 測試建議

### 1. 測試庫存不足
```bash
# 借出超過庫存的數量
POST /api/lends
{
  "user_id": 1,
  "item_id": 5,
  "qty": 999999,
  "from_inventory_id": 1
}
# 應該回傳: 庫存不足錯誤
```

### 2. 測試重複歸還
```bash
# 對同一 lend_id 歸還兩次
PUT /api/lends/123/return
PUT /api/lends/123/return
# 第二次應該回傳: 此物品已經歸還過了
```

### 3. 測試需求自動完成
```bash
# 提供足夠數量來完成需求
POST /api/request-accepters
{
  "request_id": 10,
  "accepter_id": 3,
  "items": [{"item_id": 5, "qty": 50}]
}
# 檢查 response.request.status 是否為 "Completed"
```

---

## 注意事項

1. **inventory_id 必填**：物資提供時必須指定目標庫存
2. **需求類型區分**：接受需求時根據類型提供不同參數
   - Material/Tool → 提供 `items` 陣列
   - Humanpower → 提供 `qty` 數字
3. **並發安全**：所有 Transaction 都使用行鎖，可安全並發調用
4. **序列設置**：確保 LENDS 和 PROVIDES 表有正確的序列設置

---

## 開發者資訊

- **修改檔案**：
  - `backend/services/lends.js`
  - `backend/services/provides.js`
  - `backend/services/request_accepters.js`
  
- **資料庫連接**：使用 `pool.connect()` 獲取專用連接以支援 Transaction

- **測試狀態**：✅ 所有功能已通過測試

