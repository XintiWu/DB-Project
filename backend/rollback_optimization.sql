-- ============================================
-- 災害救援平台 - 效能優化回滾腳本
-- ============================================
-- 如果需要撤銷效能優化，執行此腳本
-- ============================================

-- ============================================
-- 第一部分：刪除查詢索引
-- ============================================

-- INCIDENTS 表索引
DROP INDEX IF EXISTS idx_incidents_area_id;
DROP INDEX IF EXISTS idx_incidents_reporter_id;
DROP INDEX IF EXISTS idx_incidents_status;
DROP INDEX IF EXISTS idx_incidents_reported_at;
DROP INDEX IF EXISTS idx_incidents_severity;
DROP INDEX IF EXISTS idx_incidents_review_status;
DROP INDEX IF EXISTS idx_incidents_status_reported_at;

-- REQUESTS 表索引
DROP INDEX IF EXISTS idx_requests_requester_id;
DROP INDEX IF EXISTS idx_requests_incident_id;
DROP INDEX IF EXISTS idx_requests_status;
DROP INDEX IF EXISTS idx_requests_type;
DROP INDEX IF EXISTS idx_requests_created_at;
DROP INDEX IF EXISTS idx_requests_urgency;
DROP INDEX IF EXISTS idx_requests_review_status;
DROP INDEX IF EXISTS idx_requests_status_urgency;
DROP INDEX IF EXISTS idx_requests_type_status;

-- USERS 表索引
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_status;
DROP INDEX IF EXISTS idx_users_phone;
DROP INDEX IF EXISTS idx_users_created_at;

-- ITEMS 表索引
DROP INDEX IF EXISTS idx_items_category_id;
DROP INDEX IF EXISTS idx_items_name;

-- INVENTORY_ITEMS 表索引
DROP INDEX IF EXISTS idx_inventory_items_item_id;
DROP INDEX IF EXISTS idx_inventory_items_status;
DROP INDEX IF EXISTS idx_inventory_items_updated_at;

-- INVENTORIES 表索引
DROP INDEX IF EXISTS idx_inventories_status;

-- LENDS 表索引
DROP INDEX IF EXISTS idx_lends_user_id;
DROP INDEX IF EXISTS idx_lends_item_id;
DROP INDEX IF EXISTS idx_lends_inventory_id;
DROP INDEX IF EXISTS idx_lends_lend_at;
DROP INDEX IF EXISTS idx_lends_returned_at_null;

-- PROVIDES 表索引
DROP INDEX IF EXISTS idx_provides_user_id;
DROP INDEX IF EXISTS idx_provides_item_id;
DROP INDEX IF EXISTS idx_provides_provide_date;

-- FINANCIALS 表索引
DROP INDEX IF EXISTS idx_financials_admin_id;
DROP INDEX IF EXISTS idx_financials_created_at;
DROP INDEX IF EXISTS idx_financials_purpose;

-- REQUEST_MATERIALS 表索引
DROP INDEX IF EXISTS idx_request_materials_item_id;

-- REQUEST_HUMANPOWER 表索引
DROP INDEX IF EXISTS idx_request_humanpower_skill_id;

-- REQUEST_EQUIPMENTS 表索引
DROP INDEX IF EXISTS idx_request_equipments_equipment_id;

-- REQUEST_ACCEPTERS 表索引
DROP INDEX IF EXISTS idx_request_accepters_accepter_id;
DROP INDEX IF EXISTS idx_request_accepters_created_at;

-- SHELTERS 表索引
DROP INDEX IF EXISTS idx_shelters_area_id;
DROP INDEX IF EXISTS idx_shelters_type;
DROP INDEX IF EXISTS idx_shelters_location;

-- INVENTORY_OWNERS 表索引
DROP INDEX IF EXISTS idx_inventory_owners_user_id;


-- ============================================
-- 第二部分：刪除外鍵約束
-- ============================================

-- FINANCIALS
ALTER TABLE "FINANCIALS" DROP CONSTRAINT IF EXISTS fk_financials_admin;

-- INCIDENTS
ALTER TABLE "INCIDENTS" DROP CONSTRAINT IF EXISTS fk_incidents_area;
ALTER TABLE "INCIDENTS" DROP CONSTRAINT IF EXISTS fk_incidents_reporter;
ALTER TABLE "INCIDENTS" DROP CONSTRAINT IF EXISTS fk_incidents_reviewer;

-- INVENTORY_ITEMS
ALTER TABLE "INVENTORY_ITEMS" DROP CONSTRAINT IF EXISTS fk_inventory_items_inventory;
ALTER TABLE "INVENTORY_ITEMS" DROP CONSTRAINT IF EXISTS fk_inventory_items_item;

-- INVENTORY_OWNERS
ALTER TABLE "INVENTORY_OWNERS" DROP CONSTRAINT IF EXISTS fk_inventory_owners_inventory;
ALTER TABLE "INVENTORY_OWNERS" DROP CONSTRAINT IF EXISTS fk_inventory_owners_user;

-- ITEMS
ALTER TABLE "ITEMS" DROP CONSTRAINT IF EXISTS fk_items_category;

-- ITEM_SUPPLIES
ALTER TABLE "ITEM_SUPPLIES" DROP CONSTRAINT IF EXISTS fk_item_supplies_item;

-- ITEM_TOOLS
ALTER TABLE "ITEM_TOOLS" DROP CONSTRAINT IF EXISTS fk_item_tools_item;

-- LENDS
ALTER TABLE "LENDS" DROP CONSTRAINT IF EXISTS fk_lends_user;
ALTER TABLE "LENDS" DROP CONSTRAINT IF EXISTS fk_lends_item;
ALTER TABLE "LENDS" DROP CONSTRAINT IF EXISTS fk_lends_inventory;

-- PROVIDES
ALTER TABLE "PROVIDES" DROP CONSTRAINT IF EXISTS fk_provides_user;
ALTER TABLE "PROVIDES" DROP CONSTRAINT IF EXISTS fk_provides_item;

-- REQUESTS
ALTER TABLE "REQUESTS" DROP CONSTRAINT IF EXISTS fk_requests_requester;
ALTER TABLE "REQUESTS" DROP CONSTRAINT IF EXISTS fk_requests_incident;
ALTER TABLE "REQUESTS" DROP CONSTRAINT IF EXISTS fk_requests_reviewer;

-- REQUEST_ACCEPTERS
ALTER TABLE "REQUEST_ACCEPTERS" DROP CONSTRAINT IF EXISTS fk_request_accepters_request;
ALTER TABLE "REQUEST_ACCEPTERS" DROP CONSTRAINT IF EXISTS fk_request_accepters_accepter;

-- REQUEST_EQUIPMENTS
ALTER TABLE "REQUEST_EQUIPMENTS" DROP CONSTRAINT IF EXISTS fk_request_equipments_request;
ALTER TABLE "REQUEST_EQUIPMENTS" DROP CONSTRAINT IF EXISTS fk_request_equipments_item;

-- REQUEST_HUMANPOWER
ALTER TABLE "REQUEST_HUMANPOWER" DROP CONSTRAINT IF EXISTS fk_request_humanpower_request;
ALTER TABLE "REQUEST_HUMANPOWER" DROP CONSTRAINT IF EXISTS fk_request_humanpower_skill;

-- REQUEST_MATERIALS
ALTER TABLE "REQUEST_MATERIALS" DROP CONSTRAINT IF EXISTS fk_request_materials_request;
ALTER TABLE "REQUEST_MATERIALS" DROP CONSTRAINT IF EXISTS fk_request_materials_item;

-- REQUEST_ITEM_ACCEPT
ALTER TABLE "REQUEST_ITEM_ACCEPT" DROP CONSTRAINT IF EXISTS fk_request_item_accept_request;
ALTER TABLE "REQUEST_ITEM_ACCEPT" DROP CONSTRAINT IF EXISTS fk_request_item_accept_accepter;
ALTER TABLE "REQUEST_ITEM_ACCEPT" DROP CONSTRAINT IF EXISTS fk_request_item_accept_item;

-- REQUEST_RESCUE_ACCEPT
ALTER TABLE "REQUEST_RESCUE_ACCEPT" DROP CONSTRAINT IF EXISTS fk_request_rescue_accept_request;
ALTER TABLE "REQUEST_RESCUE_ACCEPT" DROP CONSTRAINT IF EXISTS fk_request_rescue_accept_accepter;

-- SHELTERS
ALTER TABLE "SHELTERS" DROP CONSTRAINT IF EXISTS fk_shelters_area;


-- ============================================
-- 第三部分：刪除主鍵約束
-- ============================================

ALTER TABLE "AREA" DROP CONSTRAINT IF EXISTS pk_area;
ALTER TABLE "FINANCIALS" DROP CONSTRAINT IF EXISTS pk_financials;
ALTER TABLE "INCIDENTS" DROP CONSTRAINT IF EXISTS pk_incidents;
ALTER TABLE "INVENTORIES" DROP CONSTRAINT IF EXISTS pk_inventories;
ALTER TABLE "INVENTORY_ITEMS" DROP CONSTRAINT IF EXISTS pk_inventory_items;
ALTER TABLE "INVENTORY_OWNERS" DROP CONSTRAINT IF EXISTS pk_inventory_owners;
ALTER TABLE "ITEMS" DROP CONSTRAINT IF EXISTS pk_items;
ALTER TABLE "ITEM_CATEGORIES" DROP CONSTRAINT IF EXISTS pk_item_categories;
ALTER TABLE "ITEM_SUPPLIES" DROP CONSTRAINT IF EXISTS pk_item_supplies;
ALTER TABLE "ITEM_TOOLS" DROP CONSTRAINT IF EXISTS pk_item_tools;
ALTER TABLE "LENDS" DROP CONSTRAINT IF EXISTS pk_lends;
ALTER TABLE "PROVIDES" DROP CONSTRAINT IF EXISTS pk_provides;
ALTER TABLE "REQUESTS" DROP CONSTRAINT IF EXISTS pk_requests;
ALTER TABLE "REQUEST_ACCEPTERS" DROP CONSTRAINT IF EXISTS pk_request_accepters;
ALTER TABLE "REQUEST_EQUIPMENTS" DROP CONSTRAINT IF EXISTS pk_request_equipments;
ALTER TABLE "REQUEST_HUMANPOWER" DROP CONSTRAINT IF EXISTS pk_request_humanpower;
ALTER TABLE "REQUEST_MATERIALS" DROP CONSTRAINT IF EXISTS pk_request_materials;
ALTER TABLE "REQUEST_ITEM_ACCEPT" DROP CONSTRAINT IF EXISTS pk_request_item_accept;
ALTER TABLE "REQUEST_RESCUE_ACCEPT" DROP CONSTRAINT IF EXISTS pk_request_rescue_accept;
ALTER TABLE "SHELTERS" DROP CONSTRAINT IF EXISTS pk_shelters;
ALTER TABLE "SKILL_TAGS" DROP CONSTRAINT IF EXISTS pk_skill_tags;
ALTER TABLE "USERS" DROP CONSTRAINT IF EXISTS pk_users;

-- ============================================
-- 完成回滾！
-- ============================================






