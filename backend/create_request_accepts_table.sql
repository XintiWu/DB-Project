-- 創建 REQUEST_ACCEPTS 表（新架構）
-- 如果表已存在，先刪除
DROP TABLE IF EXISTS "REQUEST_ACCEPTS" CASCADE;

CREATE TABLE "REQUEST_ACCEPTS" (
    request_id bigint NOT NULL,
    accepter_id bigint NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT NOW(),
    "ETA" time with time zone,
    description text,
    source text,
    -- 添加主鍵約束（複合主鍵，防止重複認領）
    CONSTRAINT pk_request_accepts PRIMARY KEY (request_id, accepter_id)
);

-- 添加外鍵約束
ALTER TABLE "REQUEST_ACCEPTS"
    ADD CONSTRAINT fk_request_accepts_request 
    FOREIGN KEY (request_id) REFERENCES "REQUESTS"(request_id) 
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "REQUEST_ACCEPTS"
    ADD CONSTRAINT fk_request_accepts_accepter 
    FOREIGN KEY (accepter_id) REFERENCES "USERS"(user_id) 
    ON DELETE CASCADE ON UPDATE CASCADE;

-- 創建索引以提高查詢效能
CREATE INDEX idx_request_accepts_accepter_id ON "REQUEST_ACCEPTS"(accepter_id);
CREATE INDEX idx_request_accepts_created_at ON "REQUEST_ACCEPTS"(created_at DESC);

-- 可選：從舊表遷移數據（如果需要的話）
-- INSERT INTO "REQUEST_ACCEPTS" (request_id, accepter_id, created_at)
-- SELECT request_id, accepter_id, created_at
-- FROM "REQUEST_ACCEPTERS"
-- ON CONFLICT (request_id, accepter_id) DO NOTHING;

COMMENT ON TABLE "REQUEST_ACCEPTS" IS '認領記錄表（新架構）';
COMMENT ON COLUMN "REQUEST_ACCEPTS".request_id IS '需求ID';
COMMENT ON COLUMN "REQUEST_ACCEPTS".accepter_id IS '認領者ID';
COMMENT ON COLUMN "REQUEST_ACCEPTS".created_at IS '創建時間';
COMMENT ON COLUMN "REQUEST_ACCEPTS"."ETA" IS '預計送達時間';
COMMENT ON COLUMN "REQUEST_ACCEPTS".description IS '描述';
COMMENT ON COLUMN "REQUEST_ACCEPTS".source IS '來源';

