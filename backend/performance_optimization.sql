-- ============================================
-- 災害救援平台 - 效能優化 SQL 腳本
-- ============================================
-- 此腳本包含：
-- 1. 主鍵約束 (Primary Keys)
-- 2. 外鍵約束 (Foreign Keys)
-- 3. 查詢索引 (Indexes)
-- ============================================

-- ============================================
-- 第一部分：主鍵約束 (Primary Keys)
-- ============================================

-- AREA
ALTER TABLE "AREA" 
  ADD CONSTRAINT pk_area PRIMARY KEY (area_id);

-- FINANCIALS
ALTER TABLE "FINANCIALS" 
  ADD CONSTRAINT pk_financials PRIMARY KEY (txn_id);

-- INCIDENTS
ALTER TABLE "INCIDENTS" 
  ADD CONSTRAINT pk_incidents PRIMARY KEY (incident_id);

-- INVENTORIES
ALTER TABLE "INVENTORIES" 
  ADD CONSTRAINT pk_inventories PRIMARY KEY (inventory_id);

-- INVENTORY_ITEMS (複合主鍵)
ALTER TABLE "INVENTORY_ITEMS" 
  ADD CONSTRAINT pk_inventory_items PRIMARY KEY (inventory_id, item_id);

-- INVENTORY_OWNERS (複合主鍵)
ALTER TABLE "INVENTORY_OWNERS" 
  ADD CONSTRAINT pk_inventory_owners PRIMARY KEY (inventory_id, user_id);

-- ITEMS
ALTER TABLE "ITEMS" 
  ADD CONSTRAINT pk_items PRIMARY KEY (item_id);

-- ITEM_CATEGORIES
ALTER TABLE "ITEM_CATEGORIES" 
  ADD CONSTRAINT pk_item_categories PRIMARY KEY (category_id);

-- ITEM_SUPPLIES
ALTER TABLE "ITEM_SUPPLIES" 
  ADD CONSTRAINT pk_item_supplies PRIMARY KEY (item_id);

-- ITEM_TOOLS
ALTER TABLE "ITEM_TOOLS" 
  ADD CONSTRAINT pk_item_tools PRIMARY KEY (item_id);

-- LENDS
ALTER TABLE "LENDS" 
  ADD CONSTRAINT pk_lends PRIMARY KEY (lend_id);

-- PROVIDES
ALTER TABLE "PROVIDES" 
  ADD CONSTRAINT pk_provides PRIMARY KEY (provide_id);

-- REQUESTS
ALTER TABLE "REQUESTS" 
  ADD CONSTRAINT pk_requests PRIMARY KEY (request_id);

-- REQUEST_ACCEPTERS (複合主鍵)
ALTER TABLE "REQUEST_ACCEPTERS" 
  ADD CONSTRAINT pk_request_accepters PRIMARY KEY (request_id, accepter_id);

-- REQUEST_EQUIPMENTS (複合主鍵)
ALTER TABLE "REQUEST_EQUIPMENTS" 
  ADD CONSTRAINT pk_request_equipments PRIMARY KEY (request_id, required_equipment);

-- REQUEST_HUMANPOWER (複合主鍵)
ALTER TABLE "REQUEST_HUMANPOWER" 
  ADD CONSTRAINT pk_request_humanpower PRIMARY KEY (request_id, skill_tag_id);

-- REQUEST_MATERIALS (複合主鍵)
ALTER TABLE "REQUEST_MATERIALS" 
  ADD CONSTRAINT pk_request_materials PRIMARY KEY (request_id, item_id);

-- REQUEST_ITEM_ACCEPT (複合主鍵)
ALTER TABLE "REQUEST_ITEM_ACCEPT" 
  ADD CONSTRAINT pk_request_item_accept PRIMARY KEY (request_id, accepter_id, item_id);

-- REQUEST_RESCUE_ACCEPT (複合主鍵)
ALTER TABLE "REQUEST_RESCUE_ACCEPT" 
  ADD CONSTRAINT pk_request_rescue_accept PRIMARY KEY (request_id, accepter_id);

-- SHELTERS
ALTER TABLE "SHELTERS" 
  ADD CONSTRAINT pk_shelters PRIMARY KEY (shelter_id);

-- SKILL_TAGS
ALTER TABLE "SKILL_TAGS" 
  ADD CONSTRAINT pk_skill_tags PRIMARY KEY (skill_tag_id);

-- USERS
ALTER TABLE "USERS" 
  ADD CONSTRAINT pk_users PRIMARY KEY (user_id);


-- ============================================
-- 第二部分：外鍵約束 (Foreign Keys)
-- ============================================

-- FINANCIALS 外鍵
ALTER TABLE "FINANCIALS"
  ADD CONSTRAINT fk_financials_admin 
  FOREIGN KEY (admin_id) REFERENCES "USERS"(user_id) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- INCIDENTS 外鍵
ALTER TABLE "INCIDENTS"
  ADD CONSTRAINT fk_incidents_area 
  FOREIGN KEY (area_id) REFERENCES "AREA"(area_id) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "INCIDENTS"
  ADD CONSTRAINT fk_incidents_reporter 
  FOREIGN KEY (reporter_id) REFERENCES "USERS"(user_id) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "INCIDENTS"
  ADD CONSTRAINT fk_incidents_reviewer 
  FOREIGN KEY (reviewer_id) REFERENCES "USERS"(user_id) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- INVENTORY_ITEMS 外鍵
ALTER TABLE "INVENTORY_ITEMS"
  ADD CONSTRAINT fk_inventory_items_inventory 
  FOREIGN KEY (inventory_id) REFERENCES "INVENTORIES"(inventory_id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "INVENTORY_ITEMS"
  ADD CONSTRAINT fk_inventory_items_item 
  FOREIGN KEY (item_id) REFERENCES "ITEMS"(item_id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- INVENTORY_OWNERS 外鍵
ALTER TABLE "INVENTORY_OWNERS"
  ADD CONSTRAINT fk_inventory_owners_inventory 
  FOREIGN KEY (inventory_id) REFERENCES "INVENTORIES"(inventory_id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "INVENTORY_OWNERS"
  ADD CONSTRAINT fk_inventory_owners_user 
  FOREIGN KEY (user_id) REFERENCES "USERS"(user_id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ITEMS 外鍵
ALTER TABLE "ITEMS"
  ADD CONSTRAINT fk_items_category 
  FOREIGN KEY (category_id) REFERENCES "ITEM_CATEGORIES"(category_id) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- ITEM_SUPPLIES 外鍵
ALTER TABLE "ITEM_SUPPLIES"
  ADD CONSTRAINT fk_item_supplies_item 
  FOREIGN KEY (item_id) REFERENCES "ITEMS"(item_id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ITEM_TOOLS 外鍵
ALTER TABLE "ITEM_TOOLS"
  ADD CONSTRAINT fk_item_tools_item 
  FOREIGN KEY (item_id) REFERENCES "ITEMS"(item_id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- LENDS 外鍵
ALTER TABLE "LENDS"
  ADD CONSTRAINT fk_lends_user 
  FOREIGN KEY (user_id) REFERENCES "USERS"(user_id) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LENDS"
  ADD CONSTRAINT fk_lends_item 
  FOREIGN KEY (item_id) REFERENCES "ITEMS"(item_id) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "LENDS"
  ADD CONSTRAINT fk_lends_inventory 
  FOREIGN KEY (from_inventory_id) REFERENCES "INVENTORIES"(inventory_id) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- PROVIDES 外鍵
ALTER TABLE "PROVIDES"
  ADD CONSTRAINT fk_provides_user 
  FOREIGN KEY (user_id) REFERENCES "USERS"(user_id) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PROVIDES"
  ADD CONSTRAINT fk_provides_item 
  FOREIGN KEY (item_id) REFERENCES "ITEMS"(item_id) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- REQUESTS 外鍵
ALTER TABLE "REQUESTS"
  ADD CONSTRAINT fk_requests_requester 
  FOREIGN KEY (requester_id) REFERENCES "USERS"(user_id) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "REQUESTS"
  ADD CONSTRAINT fk_requests_incident 
  FOREIGN KEY (incident_id) REFERENCES "INCIDENTS"(incident_id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "REQUESTS"
  ADD CONSTRAINT fk_requests_reviewer 
  FOREIGN KEY (reviewer_id) REFERENCES "USERS"(user_id) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- REQUEST_ACCEPTERS 外鍵
ALTER TABLE "REQUEST_ACCEPTERS"
  ADD CONSTRAINT fk_request_accepters_request 
  FOREIGN KEY (request_id) REFERENCES "REQUESTS"(request_id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "REQUEST_ACCEPTERS"
  ADD CONSTRAINT fk_request_accepters_accepter 
  FOREIGN KEY (accepter_id) REFERENCES "USERS"(user_id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- REQUEST_EQUIPMENTS 外鍵
ALTER TABLE "REQUEST_EQUIPMENTS"
  ADD CONSTRAINT fk_request_equipments_request 
  FOREIGN KEY (request_id) REFERENCES "REQUESTS"(request_id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "REQUEST_EQUIPMENTS"
  ADD CONSTRAINT fk_request_equipments_item 
  FOREIGN KEY (required_equipment) REFERENCES "ITEMS"(item_id) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- REQUEST_HUMANPOWER 外鍵
ALTER TABLE "REQUEST_HUMANPOWER"
  ADD CONSTRAINT fk_request_humanpower_request 
  FOREIGN KEY (request_id) REFERENCES "REQUESTS"(request_id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "REQUEST_HUMANPOWER"
  ADD CONSTRAINT fk_request_humanpower_skill 
  FOREIGN KEY (skill_tag_id) REFERENCES "SKILL_TAGS"(skill_tag_id) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- REQUEST_MATERIALS 外鍵
ALTER TABLE "REQUEST_MATERIALS"
  ADD CONSTRAINT fk_request_materials_request 
  FOREIGN KEY (request_id) REFERENCES "REQUESTS"(request_id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "REQUEST_MATERIALS"
  ADD CONSTRAINT fk_request_materials_item 
  FOREIGN KEY (item_id) REFERENCES "ITEMS"(item_id) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- REQUEST_ITEM_ACCEPT 外鍵
ALTER TABLE "REQUEST_ITEM_ACCEPT"
  ADD CONSTRAINT fk_request_item_accept_request 
  FOREIGN KEY (request_id) REFERENCES "REQUESTS"(request_id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "REQUEST_ITEM_ACCEPT"
  ADD CONSTRAINT fk_request_item_accept_accepter 
  FOREIGN KEY (accepter_id) REFERENCES "USERS"(user_id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "REQUEST_ITEM_ACCEPT"
  ADD CONSTRAINT fk_request_item_accept_item 
  FOREIGN KEY (item_id) REFERENCES "ITEMS"(item_id) 
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- REQUEST_RESCUE_ACCEPT 外鍵
ALTER TABLE "REQUEST_RESCUE_ACCEPT"
  ADD CONSTRAINT fk_request_rescue_accept_request 
  FOREIGN KEY (request_id) REFERENCES "REQUESTS"(request_id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "REQUEST_RESCUE_ACCEPT"
  ADD CONSTRAINT fk_request_rescue_accept_accepter 
  FOREIGN KEY (accepter_id) REFERENCES "USERS"(user_id) 
  ON DELETE CASCADE ON UPDATE CASCADE;

-- SHELTERS 外鍵
ALTER TABLE "SHELTERS"
  ADD CONSTRAINT fk_shelters_area 
  FOREIGN KEY (area_id) REFERENCES "AREA"(area_id) 
  ON DELETE RESTRICT ON UPDATE CASCADE;


-- ============================================
-- 第三部分：查詢效能索引 (Performance Indexes)
-- ============================================

-- INCIDENTS 表索引 (依據常用查詢條件)
CREATE INDEX idx_incidents_area_id ON "INCIDENTS"(area_id);
CREATE INDEX idx_incidents_reporter_id ON "INCIDENTS"(reporter_id);
CREATE INDEX idx_incidents_status ON "INCIDENTS"(status);
CREATE INDEX idx_incidents_reported_at ON "INCIDENTS"(reported_at DESC);
CREATE INDEX idx_incidents_severity ON "INCIDENTS"(severity);
CREATE INDEX idx_incidents_review_status ON "INCIDENTS"(review_status);
-- 複合索引：狀態 + 時間（常用於篩選進行中的事件）
CREATE INDEX idx_incidents_status_reported_at ON "INCIDENTS"(status, reported_at DESC);

-- REQUESTS 表索引
CREATE INDEX idx_requests_requester_id ON "REQUESTS"(requester_id);
CREATE INDEX idx_requests_incident_id ON "REQUESTS"(incident_id);
CREATE INDEX idx_requests_status ON "REQUESTS"(status);
CREATE INDEX idx_requests_type ON "REQUESTS"(type);
CREATE INDEX idx_requests_created_at ON "REQUESTS"(created_at DESC);
CREATE INDEX idx_requests_urgency ON "REQUESTS"(urgency DESC);
CREATE INDEX idx_requests_review_status ON "REQUESTS"(review_status);
-- 複合索引：狀態 + 緊急程度（常用於優先級排序）
CREATE INDEX idx_requests_status_urgency ON "REQUESTS"(status, urgency DESC);
-- 複合索引：類型 + 狀態（常用於分類統計）
CREATE INDEX idx_requests_type_status ON "REQUESTS"(type, status);

-- USERS 表索引
CREATE INDEX idx_users_role ON "USERS"(role);
CREATE INDEX idx_users_status ON "USERS"(status);
CREATE INDEX idx_users_phone ON "USERS"(phone);
CREATE INDEX idx_users_created_at ON "USERS"(created_at DESC);

-- ITEMS 表索引
CREATE INDEX idx_items_category_id ON "ITEMS"(category_id);
CREATE INDEX idx_items_name ON "ITEMS"(item_name);

-- INVENTORY_ITEMS 表索引
CREATE INDEX idx_inventory_items_item_id ON "INVENTORY_ITEMS"(item_id);
CREATE INDEX idx_inventory_items_status ON "INVENTORY_ITEMS"(status);
CREATE INDEX idx_inventory_items_updated_at ON "INVENTORY_ITEMS"(updated_at DESC);

-- INVENTORIES 表索引
CREATE INDEX idx_inventories_status ON "INVENTORIES"(status);

-- LENDS 表索引
CREATE INDEX idx_lends_user_id ON "LENDS"(user_id);
CREATE INDEX idx_lends_item_id ON "LENDS"(item_id);
CREATE INDEX idx_lends_inventory_id ON "LENDS"(from_inventory_id);
CREATE INDEX idx_lends_lend_at ON "LENDS"(lend_at DESC);
-- 複合索引：尋找未歸還的借用記錄
CREATE INDEX idx_lends_returned_at_null ON "LENDS"(user_id, returned_at) WHERE returned_at IS NULL;

-- PROVIDES 表索引
CREATE INDEX idx_provides_user_id ON "PROVIDES"(user_id);
CREATE INDEX idx_provides_item_id ON "PROVIDES"(item_id);
CREATE INDEX idx_provides_provide_date ON "PROVIDES"(provide_date DESC);

-- FINANCIALS 表索引
CREATE INDEX idx_financials_admin_id ON "FINANCIALS"(admin_id);
CREATE INDEX idx_financials_created_at ON "FINANCIALS"(created_at DESC);
CREATE INDEX idx_financials_purpose ON "FINANCIALS"(purpose);

-- REQUEST_MATERIALS 表索引（優化 JOIN 查詢）
CREATE INDEX idx_request_materials_item_id ON "REQUEST_MATERIALS"(item_id);

-- REQUEST_HUMANPOWER 表索引
CREATE INDEX idx_request_humanpower_skill_id ON "REQUEST_HUMANPOWER"(skill_tag_id);

-- REQUEST_EQUIPMENTS 表索引
CREATE INDEX idx_request_equipments_equipment_id ON "REQUEST_EQUIPMENTS"(required_equipment);

-- REQUEST_ACCEPTERS 表索引
CREATE INDEX idx_request_accepters_accepter_id ON "REQUEST_ACCEPTERS"(accepter_id);
CREATE INDEX idx_request_accepters_created_at ON "REQUEST_ACCEPTERS"(created_at DESC);

-- SHELTERS 表索引
CREATE INDEX idx_shelters_area_id ON "SHELTERS"(area_id);
CREATE INDEX idx_shelters_type ON "SHELTERS"(type);
-- GIS 索引（如果需要地理位置查詢）
CREATE INDEX idx_shelters_location ON "SHELTERS"(latitude, longitude);

-- INVENTORY_OWNERS 表索引
CREATE INDEX idx_inventory_owners_user_id ON "INVENTORY_OWNERS"(user_id);

-- ============================================
-- 第四部分：統計資訊更新
-- ============================================

-- 更新所有表的統計資訊以優化查詢計劃
ANALYZE "AREA";
ANALYZE "FINANCIALS";
ANALYZE "INCIDENTS";
ANALYZE "INVENTORIES";
ANALYZE "INVENTORY_ITEMS";
ANALYZE "INVENTORY_OWNERS";
ANALYZE "ITEMS";
ANALYZE "ITEM_CATEGORIES";
ANALYZE "ITEM_SUPPLIES";
ANALYZE "ITEM_TOOLS";
ANALYZE "LENDS";
ANALYZE "PROVIDES";
ANALYZE "REQUESTS";
ANALYZE "REQUEST_ACCEPTERS";
ANALYZE "REQUEST_EQUIPMENTS";
ANALYZE "REQUEST_HUMANPOWER";
ANALYZE "REQUEST_MATERIALS";
ANALYZE "REQUEST_ITEM_ACCEPT";
ANALYZE "REQUEST_RESCUE_ACCEPT";
ANALYZE "SHELTERS";
ANALYZE "SKILL_TAGS";
ANALYZE "USERS";

-- ============================================
-- 完成！
-- ============================================
-- 執行此腳本後，資料庫將擁有：
-- ✓ 完整的主鍵約束
-- ✓ 完整的外鍵約束（確保資料完整性）
-- ✓ 針對常用查詢的索引（提升查詢效能）
-- ✓ 複合索引（優化多條件查詢）
-- ============================================






