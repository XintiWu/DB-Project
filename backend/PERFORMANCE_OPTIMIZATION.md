# 資料庫效能優化文件

## 📋 概述

此文件說明災害救援平台資料庫的效能優化措施，包括主鍵、外鍵和索引的建立。

## 🎯 優化目標

1. **提升查詢效能** - 透過索引加速常用查詢
2. **確保資料完整性** - 透過外鍵約束防止資料不一致
3. **優化 JOIN 操作** - 為關聯查詢建立適當索引
4. **改善複雜查詢** - 使用複合索引優化多條件查詢

## 📦 優化內容

### 1. 主鍵約束 (Primary Keys)

為所有表格建立主鍵約束，共 **22 個表格**：

- ✅ 單一主鍵：AREA, FINANCIALS, INCIDENTS, INVENTORIES, ITEMS, etc.
- ✅ 複合主鍵：INVENTORY_ITEMS, INVENTORY_OWNERS, REQUEST_* 關聯表

### 2. 外鍵約束 (Foreign Keys)

建立 **40+ 個外鍵約束**，確保參照完整性：

#### 主要外鍵關係：

```
INCIDENTS
  ├─→ AREA (area_id)
  ├─→ USERS (reporter_id, reviewer_id)
  └─→ ...

REQUESTS
  ├─→ USERS (requester_id, reviewer_id)
  ├─→ INCIDENTS (incident_id)
  └─→ ...

ITEMS
  └─→ ITEM_CATEGORIES (category_id)

REQUEST_MATERIALS
  ├─→ REQUESTS (request_id)
  └─→ ITEMS (item_id)
```

#### 刪除策略：

- **CASCADE**: 當父記錄刪除時，自動刪除子記錄（關聯表）
- **RESTRICT**: 當存在子記錄時，禁止刪除父記錄（主要資料表）

### 3. 查詢效能索引 (Performance Indexes)

建立 **50+ 個索引**，針對常用查詢模式：

#### 單欄索引

| 表格 | 索引欄位 | 用途 |
|------|---------|------|
| INCIDENTS | area_id, reporter_id, status | 篩選條件 |
| INCIDENTS | reported_at | 時間排序 |
| REQUESTS | requester_id, incident_id | 關聯查詢 |
| REQUESTS | status, type, urgency | 篩選與分類 |
| ITEMS | category_id, item_name | 分類與搜尋 |
| USERS | role, status, phone | 使用者查詢 |

#### 複合索引 (Composite Indexes)

針對多條件查詢優化：

```sql
-- 範例 1: 狀態 + 時間排序
CREATE INDEX idx_incidents_status_reported_at 
ON "INCIDENTS"(status, reported_at DESC);

-- 範例 2: 狀態 + 緊急程度
CREATE INDEX idx_requests_status_urgency 
ON "REQUESTS"(status, urgency DESC);

-- 範例 3: 類型 + 狀態
CREATE INDEX idx_requests_type_status 
ON "REQUESTS"(type, status);
```

#### 部分索引 (Partial Index)

針對特定條件的索引：

```sql
-- 未歸還的借用記錄
CREATE INDEX idx_lends_returned_at_null 
ON "LENDS"(user_id, returned_at) 
WHERE returned_at IS NULL;
```

## 🚀 執行步驟

### 方法 1: 使用 Node.js 腳本（推薦）

```bash
cd backend
node apply_optimization.js
```

**優點：**
- ✅ 自動執行所有語句
- ✅ 顯示執行進度
- ✅ 錯誤處理與統計
- ✅ 顯示優化結果

### 方法 2: 直接執行 SQL

```bash
psql -U postgres -d disaster_platform -f performance_optimization.sql
```

## 📊 效能預期改善

### 查詢效能提升預估

| 查詢類型 | 優化前 | 優化後 | 改善幅度 |
|---------|-------|-------|---------|
| 單表條件查詢 | ~50ms | ~5ms | **90%** ↓ |
| 簡單 JOIN (2-3表) | ~200ms | ~20ms | **90%** ↓ |
| 複雜 JOIN (4+表) | ~800ms | ~80ms | **90%** ↓ |
| 聚合查詢 (GROUP BY) | ~300ms | ~50ms | **83%** ↓ |
| 排序查詢 (ORDER BY) | ~150ms | ~15ms | **90%** ↓ |

*註：實際效能取決於資料量和硬體配置*

### 重點優化的查詢

#### 1. 事件列表查詢（依區域和狀態）

**優化前：**
```sql
-- 全表掃描
SELECT * FROM "INCIDENTS" 
WHERE area_id = 'TPE' AND status = 'Occuring'
ORDER BY reported_at DESC;
```

**優化後：**
- 使用 `idx_incidents_status_reported_at` 索引
- 預期速度提升 **10-20 倍**

#### 2. 需求詳情查詢（含子表 JOIN）

**優化前：**
```sql
-- requests.js BASE_QUERY
-- 多次子查詢 + JOIN，無索引支援
```

**優化後：**
- REQUEST_MATERIALS: `idx_request_materials_item_id`
- REQUEST_HUMANPOWER: `idx_request_humanpower_skill_id`
- REQUEST_EQUIPMENTS: `idx_request_equipments_equipment_id`
- 預期速度提升 **5-10 倍**

#### 3. 統計分析查詢

**範例：最常需求物資**
```sql
SELECT i.item_name, SUM(rm.qty) as total_qty
FROM "REQUEST_MATERIALS" rm
JOIN "ITEMS" i ON rm.item_id = i.item_id
GROUP BY i.item_name
ORDER BY total_qty DESC;
```

**優化：**
- ITEMS: `idx_items_category_id`
- REQUEST_MATERIALS: 主鍵 + `idx_request_materials_item_id`
- 預期速度提升 **5-8 倍**

## 🔍 驗證效能

### 1. 檢查索引使用情況

```sql
-- 查看表的所有索引
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 2. 分析查詢計劃

```sql
-- 查看查詢是否使用索引
EXPLAIN ANALYZE
SELECT * FROM "REQUESTS" 
WHERE status = 'Not Completed' 
ORDER BY urgency DESC;
```

**好的輸出應包含：**
- `Index Scan` 或 `Index Only Scan` (而非 Seq Scan)
- `Bitmap Index Scan` (對於複雜查詢)

### 3. 監控索引效能

```sql
-- 檢查索引大小
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC;

-- 檢查索引使用頻率
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

## ⚠️ 注意事項

### 1. 執行時機

- ⏰ 建議在**低流量時段**執行
- 📊 大型表格建立索引可能需要**數分鐘**
- 🔒 部分操作會**鎖定表格**（短暫）

### 2. 磁碟空間

- 💾 索引會佔用額外磁碟空間（約 10-30% 表格大小）
- 📈 確保有足夠空間（建議預留 **500MB+**）

### 3. 維護

定期執行維護命令：

```sql
-- 重建統計資訊
VACUUM ANALYZE;

-- 重建索引（如果效能下降）
REINDEX DATABASE disaster_platform;
```

### 4. 備份建議

執行前備份資料庫：

```bash
pg_dump -U postgres disaster_platform > backup_before_optimization.sql
```

## 🔄 回滾方案

如果優化後出現問題，可以執行回滾：

```bash
# 使用 Node.js
node rollback_optimization.js

# 或直接執行 SQL
psql -U postgres -d disaster_platform -f rollback_optimization.sql
```

**回滾順序：**
1. 刪除查詢索引
2. 刪除外鍵約束
3. 刪除主鍵約束

## 📈 效能監控

### 啟用查詢日誌

在 `postgresql.conf` 中：

```conf
# 記錄慢查詢
log_min_duration_statement = 100  # 記錄超過 100ms 的查詢

# 記錄所有查詢
log_statement = 'all'
```

### 使用 pg_stat_statements

```sql
-- 安裝擴展
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- 查看最慢的查詢
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

## 🎓 最佳實踐建議

1. **定期更新統計資訊**
   ```sql
   ANALYZE;  -- 每天執行
   ```

2. **監控索引使用率**
   - 刪除未使用的索引（idx_scan = 0）
   - 新增頻繁查詢欄位的索引

3. **避免過度索引**
   - 每個表不要超過 5-7 個索引
   - 寫入密集的表少建索引

4. **使用 EXPLAIN 優化查詢**
   - 開發新功能時先檢查執行計劃
   - 確保索引被正確使用

## 📚 參考資源

- [PostgreSQL 索引文件](https://www.postgresql.org/docs/current/indexes.html)
- [PostgreSQL 效能調校](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [EXPLAIN 指南](https://www.postgresql.org/docs/current/using-explain.html)

## ✅ 檢查清單

執行優化後，請確認：

- [ ] 所有主鍵約束建立成功
- [ ] 所有外鍵約束建立成功
- [ ] 所有索引建立成功
- [ ] 執行 ANALYZE 更新統計資訊
- [ ] 使用 EXPLAIN 驗證關鍵查詢
- [ ] 測試應用程式功能正常
- [ ] 監控系統效能指標
- [ ] 備份優化後的資料庫

---

**最後更新：** 2025-12-05  
**版本：** 1.0  
**維護者：** DB-Project Team






