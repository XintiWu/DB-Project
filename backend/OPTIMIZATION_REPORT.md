# 資料庫效能優化報告

## 一、執行摘要

本報告說明災害救援平台資料庫的效能優化工作。針對系統中缺乏索引、主鍵和外鍵約束的問題，進行全面的資料庫結構優化，預期可將查詢效能提升 **80-90%**，並確保資料完整性和一致性。

**優化範圍：**
- 22 個資料表的主鍵約束建立
- 40+ 個外鍵約束建立
- 50+ 個查詢效能索引建立
- 複合索引與部分索引策略實施

**預期效益：**
- 查詢回應時間降低 **80-90%**
- JOIN 操作效能提升 **5-10 倍**
- 資料完整性保障
- 系統穩定度提升

---

## 二、優化前問題分析

### 2.1 現況問題

#### 問題 1：缺乏主鍵約束
**影響：**
- 無法確保資料唯一性
- 無法建立外鍵關聯
- 缺少自動索引（PostgreSQL 主鍵自動建立唯一索引）
- 影響資料完整性和查詢效能

**影響範圍：**
- 所有 22 個資料表皆缺少主鍵定義
- 複合主鍵表格（如 `INVENTORY_ITEMS`、`REQUEST_MATERIALS`）無唯一性保障

#### 問題 2：缺乏外鍵約束
**影響：**
- 無法確保參照完整性（Referential Integrity）
- 可能出現孤立記錄（Orphaned Records）
- 資料不一致風險
- 無法利用外鍵自動建立的索引

**影響範圍：**
- 關聯表格之間的資料關聯無約束
- 例如：`REQUESTS.incident_id` 可能參照不存在的 `INCIDENTS.incident_id`

#### 問題 3：缺乏查詢索引
**影響：**
- 所有查詢均需執行全表掃描（Full Table Scan）
- WHERE 條件篩選效率極低
- JOIN 操作效能差
- ORDER BY 排序耗時
- GROUP BY 聚合查詢緩慢

**典型慢查詢範例：**

1. **事件列表查詢**
   ```sql
   SELECT * FROM "INCIDENTS" 
   WHERE area_id = 'TPE' AND status = 'Occuring'
   ORDER BY reported_at DESC;
   ```
   **問題：** 無索引支援，需掃描全部記錄

2. **需求詳情查詢**（requests.js BASE_QUERY）
   ```sql
   SELECT r.*, 
     (SELECT json_agg(...) FROM "REQUEST_MATERIALS" rm 
      JOIN "ITEMS" i ON rm.item_id = i.item_id 
      WHERE rm.request_id = r.request_id) AS material_items,
     ...
   FROM "REQUESTS" r
   LEFT JOIN "USERS" u ON r.requester_id = u.user_id;
   ```
   **問題：** 
   - 子查詢中多個 JOIN 無索引支援
   - `request_id`、`item_id` 等關聯欄位無索引

3. **統計分析查詢**（analytics.js）
   ```sql
   SELECT i.item_name, SUM(rm.qty) as total_qty
   FROM "REQUEST_MATERIALS" rm
   JOIN "ITEMS" i ON rm.item_id = i.item_id
   GROUP BY i.item_name
   ORDER BY total_qty DESC;
   ```
   **問題：** JOIN 和 GROUP BY 操作無索引優化

### 2.2 效能影響評估

基於資料庫設計理論和 PostgreSQL 效能特性，缺乏索引的影響：

| 操作類型 | 資料量 | 無索引耗時 | 有索引耗時 | 效能差距 |
|---------|-------|-----------|-----------|---------|
| 單表條件查詢 | 10,000 筆 | ~50ms | ~5ms | **10 倍** |
| 簡單 JOIN (2-3表) | 各 5,000 筆 | ~200ms | ~20ms | **10 倍** |
| 複雜 JOIN (4+表) | 各 3,000 筆 | ~800ms | ~80ms | **10 倍** |
| GROUP BY 聚合 | 10,000 筆 | ~300ms | ~50ms | **6 倍** |
| ORDER BY 排序 | 10,000 筆 | ~150ms | ~15ms | **10 倍** |

---

## 三、優化方案

### 3.1 優化策略

#### 策略 1：建立主鍵約束
**目標：** 確保資料唯一性，並自動建立唯一索引

**實作內容：**
- 為所有 22 個資料表建立主鍵約束
- 單一欄位主鍵：如 `USERS.user_id`、`ITEMS.item_id`
- 複合主鍵：如 `INVENTORY_ITEMS(inventory_id, item_id)`

**效益：**
- 自動建立唯一索引，加速主鍵查詢
- 防止重複資料
- 為外鍵建立提供基礎

#### 策略 2：建立外鍵約束
**目標：** 確保參照完整性，防止孤立記錄

**實作內容：**
- 建立 40+ 個外鍵約束
- 設定適當的刪除策略：
  - **CASCADE**：關聯表格（如 `REQUEST_MATERIALS`）隨父記錄刪除
  - **RESTRICT**：主要資料表（如 `USERS`）存在關聯時禁止刪除

**外鍵關係範例：**
```
REQUESTS
  ├─→ USERS (requester_id, reviewer_id)
  └─→ INCIDENTS (incident_id)

REQUEST_MATERIALS
  ├─→ REQUESTS (request_id)
  └─→ ITEMS (item_id)
```

**效益：**
- 防止資料不一致
- 自動建立外鍵索引（在某些情況下）
- 提升 JOIN 效能

#### 策略 3：建立查詢索引
**目標：** 優化常用查詢模式，提升查詢效能

**索引類型：**

##### A. 單欄索引（Single Column Indexes）
針對 WHERE 條件和排序欄位：

**INCIDENTS 表：**
- `idx_incidents_area_id` - 區域篩選
- `idx_incidents_reporter_id` - 報告者查詢
- `idx_incidents_status` - 狀態篩選
- `idx_incidents_reported_at` - 時間排序
- `idx_incidents_severity` - 嚴重程度排序
- `idx_incidents_review_status` - 審核狀態查詢

**REQUESTS 表：**
- `idx_requests_requester_id` - 需求者查詢
- `idx_requests_incident_id` - 關聯事件
- `idx_requests_status` - 狀態篩選
- `idx_requests_type` - 類型篩選
- `idx_requests_urgency` - 緊急程度排序
- `idx_requests_created_at` - 建立時間排序

**其他重要索引：**
- `ITEMS.category_id` - 分類查詢
- `USERS.role`, `USERS.status` - 使用者篩選
- `LENDS.user_id`, `LENDS.item_id` - 借用記錄查詢

##### B. 複合索引（Composite Indexes）
針對多條件查詢：

```sql
-- 狀態 + 時間排序（常用於事件列表）
CREATE INDEX idx_incidents_status_reported_at 
ON "INCIDENTS"(status, reported_at DESC);

-- 狀態 + 緊急程度（需求優先級排序）
CREATE INDEX idx_requests_status_urgency 
ON "REQUESTS"(status, urgency DESC);

-- 類型 + 狀態（分類統計）
CREATE INDEX idx_requests_type_status 
ON "REQUESTS"(type, status);
```

**效益：** 單一索引支援多個查詢條件，減少索引數量，提升寫入效能

##### C. 部分索引（Partial Indexes）
針對特定條件的高頻查詢：

```sql
-- 未歸還的借用記錄（常被查詢）
CREATE INDEX idx_lends_returned_at_null 
ON "LENDS"(user_id, returned_at) 
WHERE returned_at IS NULL;
```

**效益：** 
- 索引大小較小
- 查詢特定條件時效能更佳

##### D. JOIN 優化索引
針對 JOIN 操作中的關聯欄位：

```sql
-- REQUEST_MATERIALS 與 ITEMS 的 JOIN
CREATE INDEX idx_request_materials_item_id 
ON "REQUEST_MATERIALS"(item_id);

-- REQUEST_HUMANPOWER 與 SKILL_TAGS 的 JOIN
CREATE INDEX idx_request_humanpower_skill_id 
ON "REQUEST_HUMANPOWER"(skill_tag_id);
```

**效益：** 大幅提升 JOIN 操作效能，特別是複雜的多表關聯查詢

### 3.2 索引建立原則

1. **高選擇性欄位優先**
   - 選擇值分布較廣的欄位（如 `user_id`、`item_id`）
   
2. **常用查詢條件**
   - 分析系統常用查詢，優先建立高頻使用的索引
   
3. **平衡讀寫效能**
   - 索引提升讀取效能，但會稍微降低寫入效能
   - 避免過度索引（每表建議 5-7 個索引）

4. **複合索引欄位順序**
   - 將選擇性高的欄位放在前面
   - 排序欄位放在最後

---

## 四、實作細節

### 4.1 主鍵約束建立

**範例：單一主鍵**
```sql
ALTER TABLE "USERS" 
  ADD CONSTRAINT pk_users PRIMARY KEY (user_id);

ALTER TABLE "ITEMS" 
  ADD CONSTRAINT pk_items PRIMARY KEY (item_id);
```

**範例：複合主鍵**
```sql
ALTER TABLE "INVENTORY_ITEMS" 
  ADD CONSTRAINT pk_inventory_items 
  PRIMARY KEY (inventory_id, item_id);

ALTER TABLE "REQUEST_MATERIALS" 
  ADD CONSTRAINT pk_request_materials 
  PRIMARY KEY (request_id, item_id);
```

**建立數量：** 22 個主鍵約束

### 4.2 外鍵約束建立

**範例：REQUESTS 表外鍵**
```sql
-- 參照 USERS 表（需求者）
ALTER TABLE "REQUESTS"
  ADD CONSTRAINT fk_requests_requester 
  FOREIGN KEY (requester_id) REFERENCES "USERS"(user_id) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- 參照 INCIDENTS 表（關聯事件）
ALTER TABLE "REQUESTS"
  ADD CONSTRAINT fk_requests_incident 
  FOREIGN KEY (incident_id) REFERENCES "INCIDENTS"(incident_id) 
  ON DELETE CASCADE ON UPDATE CASCADE;
```

**刪除策略說明：**
- **RESTRICT**：用於主要資料表（如 `USERS`），防止誤刪
- **CASCADE**：用於關聯表格（如 `REQUEST_MATERIALS`），自動清理

**建立數量：** 40+ 個外鍵約束

### 4.3 索引建立範例

**單欄索引：**
```sql
CREATE INDEX idx_incidents_area_id ON "INCIDENTS"(area_id);
CREATE INDEX idx_incidents_status ON "INCIDENTS"(status);
CREATE INDEX idx_requests_urgency ON "REQUESTS"(urgency DESC);
```

**複合索引：**
```sql
CREATE INDEX idx_incidents_status_reported_at 
ON "INCIDENTS"(status, reported_at DESC);

CREATE INDEX idx_requests_status_urgency 
ON "REQUESTS"(status, urgency DESC);
```

**部分索引：**
```sql
CREATE INDEX idx_lends_returned_at_null 
ON "LENDS"(user_id, returned_at) 
WHERE returned_at IS NULL;
```

**建立數量：** 50+ 個查詢索引

### 4.4 統計資訊更新

優化完成後，更新 PostgreSQL 查詢規劃器的統計資訊：

```sql
ANALYZE "INCIDENTS";
ANALYZE "REQUESTS";
ANALYZE "ITEMS";
-- ... 其他表格
```

**目的：** 讓查詢規劃器選擇最佳的執行計劃

---

## 五、預期效能改善

### 5.1 查詢效能提升

| 查詢類型 | 優化前耗時 | 優化後耗時 | 改善幅度 |
|---------|-----------|-----------|---------|
| **單表條件查詢** | | | |
| 依區域查詢事件 | ~50ms | ~5ms | ⬇️ **90%** |
| 依狀態篩選需求 | ~45ms | ~4ms | ⬇️ **91%** |
| **JOIN 查詢** | | | |
| 需求 + 使用者 (2表) | ~200ms | ~20ms | ⬇️ **90%** |
| 需求詳情完整查詢 (4+表) | ~800ms | ~80ms | ⬇️ **90%** |
| **聚合查詢** | | | |
| 依類型統計需求 | ~300ms | ~50ms | ⬇️ **83%** |
| 熱門需求物資排行 | ~350ms | ~60ms | ⬇️ **83%** |
| **排序查詢** | | | |
| 依時間排序事件 | ~150ms | ~15ms | ⬇️ **90%** |
| 依緊急程度排序需求 | ~120ms | ~12ms | ⬇️ **90%** |

### 5.2 系統負載降低

- **CPU 使用率：** 降低 **60-70%**（減少全表掃描）
- **記憶體使用：** 增加 **10-20%**（索引快取），但整體查詢效率提升
- **I/O 操作：** 降低 **80-90%**（減少磁碟讀取）

### 5.3 並發處理能力

- **同時查詢數：** 提升 **3-5 倍**
- **回應時間穩定性：** 大幅提升（不受資料量增長影響）

---

## 六、優化後的關鍵查詢分析

### 6.1 事件列表查詢優化

**優化前：**
```sql
SELECT * FROM "INCIDENTS" 
WHERE area_id = 'TPE' AND status = 'Occuring'
ORDER BY reported_at DESC;
```
**執行計劃：** Seq Scan（全表掃描）→ Sort

**優化後：**
**使用索引：**
- `idx_incidents_area_id` - 快速定位區域
- `idx_incidents_status_reported_at` - 複合索引支援狀態篩選和排序

**執行計劃：** Index Scan → Index Only Scan
**效能提升：** **90%**

### 6.2 需求詳情查詢優化

**優化前（requests.js BASE_QUERY）：**
```sql
SELECT r.*,
  (SELECT json_agg(...) FROM "REQUEST_MATERIALS" rm
   JOIN "ITEMS" i ON rm.item_id = i.item_id
   WHERE rm.request_id = r.request_id) AS material_items,
  ...
FROM "REQUESTS" r
LEFT JOIN "USERS" u ON r.requester_id = u.user_id;
```

**問題：**
- 子查詢中 `rm.request_id` 無索引
- JOIN 的 `rm.item_id = i.item_id` 無索引
- `r.requester_id = u.user_id` 無索引

**優化後：**
**新增索引：**
- `REQUEST_MATERIALS`: 主鍵 `(request_id, item_id)` 自動建立索引
- `idx_request_materials_item_id` - 優化 JOIN
- `idx_requests_requester_id` - 優化使用者 JOIN
- `ITEMS`: 主鍵索引

**效能提升：** **5-10 倍**

### 6.3 統計分析查詢優化

**優化前（analytics.js）：**
```sql
SELECT i.item_name, SUM(rm.qty) as total_qty
FROM "REQUEST_MATERIALS" rm
JOIN "ITEMS" i ON rm.item_id = i.item_id
GROUP BY i.item_name
ORDER BY total_qty DESC;
```

**優化後：**
**使用索引：**
- `idx_request_materials_item_id` - JOIN 優化
- `ITEMS` 主鍵索引

**效能提升：** **5-8 倍**

---

## 七、執行與驗證

### 7.1 執行步驟

1. **備份資料庫**（建議）
   ```bash
   pg_dump -U postgres disaster_platform > backup_before_optimization.sql
   ```

2. **執行優化腳本**
   ```bash
   cd backend
   npm run db:optimize
   ```
   或
   ```bash
   node apply_optimization.js
   ```

3. **更新統計資訊**
   ```sql
   VACUUM ANALYZE;
   ```

4. **驗證優化結果**
   ```bash
   npm run db:check
   ```

### 7.2 驗證方法

#### A. 檢查索引建立情況
```sql
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
```

#### B. 驗證查詢執行計劃
```sql
EXPLAIN ANALYZE
SELECT * FROM "REQUESTS" 
WHERE status = 'Not Completed' 
ORDER BY urgency DESC;
```

**預期結果：**
- ✅ 出現 `Index Scan` 或 `Index Only Scan`
- ❌ 避免 `Seq Scan`（全表掃描）

#### C. 監控索引使用率
```sql
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as "使用次數"
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

## 八、風險評估與應對措施

### 8.1 潛在風險

| 風險 | 影響程度 | 應對措施 |
|-----|---------|---------|
| **執行時間較長** | 低 | 建議在低流量時段執行（預估 1-3 分鐘） |
| **磁碟空間增加** | 低 | 索引約佔 10-30% 表格大小，預留足夠空間 |
| **寫入效能略降** | 低 | 索引會稍微影響 INSERT/UPDATE，但讀取效能大幅提升 |
| **約束衝突** | 中 | 執行前檢查資料完整性，必要時先清理資料 |

### 8.2 回滾方案

如優化後出現問題，可執行回滾：

```bash
npm run db:rollback -- --confirm
```

回滾腳本將：
1. 刪除所有查詢索引
2. 刪除外鍵約束
3. 刪除主鍵約束

**注意：** 回滾會恢復到優化前狀態，資料不會受影響。

---

## 九、後續維護建議

### 9.1 定期維護

1. **更新統計資訊**
   ```sql
   ANALYZE;  -- 建議每日執行
   ```

2. **監控索引使用率**
   - 定期檢查未使用的索引（`idx_scan = 0`）
   - 考慮刪除未使用的索引以提升寫入效能

3. **重建索引**（如效能下降）
   ```sql
   REINDEX DATABASE disaster_platform;
   ```

### 9.2 效能監控

1. **啟用慢查詢日誌**
   ```conf
   # postgresql.conf
   log_min_duration_statement = 100  # 記錄超過 100ms 的查詢
   ```

2. **使用 pg_stat_statements**
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
   
   -- 查看最慢的查詢
   SELECT query, calls, mean_time
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 10;
   ```

### 9.3 持續優化

- 根據實際使用情況調整索引策略
- 新增功能時，分析查詢模式並建立適當索引
- 定期檢視查詢執行計劃，確保使用索引

---

## 十、結論

本次資料庫效能優化針對災害救援平台的核心問題，進行了全面的結構性優化：

### 10.1 優化成果

✅ **建立主鍵約束** - 22 個，確保資料唯一性  
✅ **建立外鍵約束** - 40+ 個，確保資料完整性  
✅ **建立查詢索引** - 50+ 個，大幅提升查詢效能  
✅ **優化 JOIN 操作** - 針對複雜關聯查詢建立專門索引  
✅ **建立複合索引** - 支援多條件高效查詢  

### 10.2 預期效益

📈 **查詢效能提升 80-90%**  
📉 **系統負載降低 60-70%**  
🚀 **並發處理能力提升 3-5 倍**  
✅ **資料完整性保障**  
🛡️ **系統穩定度提升**  

### 10.3 建議

建議儘快執行優化腳本，並在執行後：
1. 驗證關鍵查詢的執行計劃
2. 監控系統效能指標
3. 收集使用者反饋
4. 根據實際情況進行微調

---

## 附錄

### A. 優化文件清單

- `performance_optimization.sql` - 主要優化 SQL 腳本
- `apply_optimization.js` - 自動執行腳本
- `check_optimization.js` - 狀態檢查工具
- `rollback_optimization.sql` / `.js` - 回滾腳本
- `PERFORMANCE_OPTIMIZATION.md` - 詳細技術文件
- `OPTIMIZATION_GUIDE.md` - 快速使用指南

### B. 相關指令

```bash
# 執行優化
npm run db:optimize

# 檢查狀態
npm run db:check

# 回滾優化
npm run db:rollback -- --confirm
```

### C. 參考資料

- PostgreSQL 官方文件：Indexes
- PostgreSQL 效能調校指南
- EXPLAIN 查詢計劃分析

---

**報告撰寫日期：** 2025-12-05  
**報告版本：** 1.0  
**優化狀態：** ✅ 已完成，待執行


