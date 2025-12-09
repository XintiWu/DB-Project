-- ============================================================
-- EXPLAIN ANALYZE 測試腳本
-- ============================================================
-- 此腳本包含四個關鍵查詢的 EXPLAIN ANALYZE 指令
-- 用於手動執行並查看執行計畫
--
-- 注意：如需進行完整的效能測試（包含多次執行、統計分析），
-- 請使用 backend/benchmark_indexes.js 腳本：
--   cd backend && node benchmark_indexes.js
--
-- ============================================================

-- 避免大小寫或 schema 問題
SET search_path TO public;

------------------------------------------------------------
-- 1. 需求列表（RequestsPage）主要查詢
------------------------------------------------------------
EXPLAIN ANALYZE
SELECT 
  r.request_id,
  r.title,
  r.address,
  r.status,
  r.urgency,
  rm.qty      AS required_qty,
  COALESCE(r.current_qty, 0) AS current_qty,
  i.item_name,
  i.unit,
  ic.category_name
FROM "REQUESTS" r
JOIN "REQUEST_MATERIALS" rm ON r.request_id = rm.request_id
JOIN "ITEMS" i               ON rm.item_id   = i.item_id
LEFT JOIN "ITEM_CATEGORIES" ic ON i.category_id = ic.category_id
WHERE r.status = 'Not Completed'
ORDER BY r.urgency DESC, r.created_at DESC;

------------------------------------------------------------
-- 2. 按需求類型統計數量（後台長條圖）
------------------------------------------------------------
EXPLAIN ANALYZE
SELECT type, COUNT(*) AS count
FROM "REQUESTS"
GROUP BY type
ORDER BY count DESC;

------------------------------------------------------------
-- 3. 熱門需求物資 Top 5
------------------------------------------------------------
EXPLAIN ANALYZE
SELECT 
  i.item_name,
  SUM(rm.qty) AS total_qty
FROM "REQUEST_MATERIALS" rm
JOIN "ITEMS" i ON rm.item_id = i.item_id
GROUP BY i.item_name
ORDER BY total_qty DESC
LIMIT 5;

------------------------------------------------------------
-- 4. 可用倉庫與庫存（ResourcesPage）
------------------------------------------------------------
EXPLAIN ANALYZE
SELECT 
  i.inventory_id,
  i.address,
  i.status,
  SUM(ii.qty) AS total_qty
FROM "INVENTORIES" i
JOIN "INVENTORY_ITEMS" ii ON i.inventory_id = ii.inventory_id
WHERE i.status = 'Active'
GROUP BY i.inventory_id, i.address, i.status
HAVING SUM(ii.qty) > 0
ORDER BY i.inventory_id;