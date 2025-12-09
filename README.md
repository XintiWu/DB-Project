# 🪏 鏟子超人 - 災害資訊整合平台

> 災害發生時，讓需要幫助的人找到資源，讓想幫助的人找到需求

一個專為救災情境設計的資源配對平台，解決災害發生時**資訊不流通**的問題。

[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791.svg)](https://www.postgresql.org/)
[![Express](https://img.shields.io/badge/Express-5.0-000000.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248.svg)](https://www.mongodb.com/)

---

## 📋 目錄

- [快速開始](#-快速開始)
- [詳細安裝步驟](#️-詳細安裝步驟)
- [資料庫設定](#-資料庫設定)
- [主要功能驗證](#-主要功能驗證)
- [技術架構](#-技術架構)

---

## 🚀 快速開始 (Quick Start)

### 環境需求

- **Node.js**: v18 或以上
- **PostgreSQL**: v14 或以上（建議 v17）
- **MongoDB**: v7.0 或以上（可選，用於 NoSQL 分析功能）

### ⚡ 一鍵啟動 (Mac/Linux)

專案根目錄附帶了啟動腳本，可同時啟動前後端：

```bash
chmod +x start_system.sh
./start_system.sh
```

---

## 🛠️ 詳細安裝步驟

### 1. 資料庫設定 (Database)

#### PostgreSQL 安裝與設定

1. **安裝 PostgreSQL**：
   - **macOS**: 使用 Homebrew 或下載 [Postgres.app](https://postgresapp.com/)
     ```bash
     brew install postgresql@17
     # 或下載 Postgres.app
     ```
   - **Linux**: 
     ```bash
     sudo apt-get update
     sudo apt-get install postgresql postgresql-contrib
     ```
   - **Windows**: 下載並安裝 [PostgreSQL 官方安裝程式](https://www.postgresql.org/download/windows/)

2. **啟動 PostgreSQL 服務**：
   ```bash
   # macOS (Postgres.app)
   # 直接開啟 Postgres.app 應用程式
   
   # macOS (Homebrew)
   brew services start postgresql@17
   
   # Linux
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

3. **建立資料庫**：
   ```bash
   # 連接到 PostgreSQL（預設 port 5432，如果使用 Postgres.app 可能是 5433）
   psql -U postgres
   
   # 在 psql 中執行
   CREATE DATABASE disaster_platform;
   \q
   ```

4. **匯入資料表結構**：
   ```bash
   # 請確保你在專案根目錄
   # 如果使用 Postgres.app，port 可能是 5433
   psql -U postgres -h localhost -p 5432 -d disaster_platform -f backend/schema.sql
   
   # 或如果 port 是 5433
   psql -U postgres -h localhost -p 5433 -d disaster_platform -f backend/schema.sql
   ```

5. **還原資料庫備份（可選，包含測試資料）**：
   ```bash
   # 使用專案根目錄的備份檔案
   pg_restore -U postgres -h localhost -p 5432 -d disaster_platform -v disaster_platform_demo.backup
   
   # 或如果 port 是 5433
   pg_restore -U postgres -h localhost -p 5433 -d disaster_platform -v disaster_platform_demo.backup
   ```

#### MongoDB 設定（可選，用於 NoSQL 分析）

1. **安裝 MongoDB**：
   ```bash
   # macOS
   brew tap mongodb/brew
   brew install mongodb-community
   
   # 或使用 Docker
   docker run -d --name mongodb -p 27017:27017 mongo:latest
   ```

2. **啟動 MongoDB**：
   ```bash
   # macOS (Homebrew)
   brew services start mongodb-community
   
   # 或使用 Docker
   docker start mongodb
   ```

### 2. 後端設定 (Backend)

1. **進入後端目錄並安裝依賴**：
   ```bash
   cd backend
   npm install
   ```

2. **設定環境變數**：
   在 `backend` 目錄下建立 `.env` 檔案，內容如下（請依實際情況調整）：
   ```env
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   # 如果使用 Postgres.app，port 可能是 5433
   # DB_PORT=5433
   DB_NAME=disaster_platform
   PORT=3000
   ```

3. **啟動後端伺服器**：
   ```bash
   node server.js
   # 或使用 nodemon (開發模式)
   # npm install -g nodemon
   # nodemon server.js
   ```
   成功後會顯示：`🚀 Full Disaster-Relief API is running!`

### 3. 前端設定 (Frontend)

1. **進入前端目錄並安裝依賴**：
   ```bash
   cd frontend
   npm install
   ```

2. **啟動開發伺服器**：
   ```bash
   npm run dev
   ```
   成功後會顯示：`Local: http://localhost:5173/`

---

## 🧪 主要功能驗證

### 1. 一般使用者功能

#### ✅ 瀏覽所有尚未完成的物資需求（需求列表頁）

1. 登入系統（或使用訪客模式）
2. 點擊「需求列表」或「認領專區」
3. 驗證：
   - 可以看到所有未完成的需求
   - 可以依類別（物資需求、工具需求、人力需求）篩選
   - 可以依地區（花蓮縣各鄉鎮）篩選
   - 可以依緊急程度排序
   - 分頁功能正常運作（資料庫中有 10,000+ 筆需求）

#### ✅ 發佈新的物資需求（綁定災情事件）

1. 點擊「發布需求」
2. 選擇「物資需求」
3. 填寫需求資訊：
   - 選擇或建立災情事件
   - 選擇物資類別和物品
   - 填寫數量、地點、緊急程度等
4. 提交後驗證需求出現在需求列表中

#### ✅ 認領物資需求並更新尚缺數量

1. 在需求列表中選擇一個需求
2. 點擊「認領此需求」
3. 填寫認領數量和其他資訊
4. 加入認領清單
5. 點擊「認領清單」→「確認送出認領」
6. 驗證：
   - 認領成功後，需求的「已募集」數量增加
   - 如果達到需求數量，狀態自動變為「已完成」

#### ✅ 瀏覽可用倉庫與庫存概況（資源頁）

1. 點擊「資源」或「倉庫」
2. 驗證：
   - 可以看到所有公開的倉庫
   - 每個倉庫顯示總庫存數量和物品種類
   - 點擊倉庫可以查看詳細庫存清單
   - 可以申請借用倉庫中的工具

#### ✅ 查詢附近避難所（依地理位置）

1. 點擊「避難所」
2. 點擊「查詢附近避難所」按鈕
3. 允許瀏覽器取得地理位置權限
4. 驗證：
   - 顯示距離最近的 10 個避難所
   - 每個避難所卡片顯示距離（公里）
   - 依距離由近到遠排序

### 2. 業務經營者（Admin）功能

#### ✅ 系統總覽統計（管理後台首頁）

1. 使用 Admin 帳號登入（例如：`lintsaiying0120@gmail.com`）
2. 點擊「管理後台」
3. 驗證可以看到以下統計圖表：
   - 依需求類型統計（Material, Tool, Humanpower）
   - 熱門需求物資 Top 5（橫向長條圖）
   - 各地區災情統計
   - 志工貢獻度排行
   - 分頁點擊統計（NoSQL 分析）
   - 熱門搜尋關鍵字（NoSQL 分析）
   - 鄉鎮需求統計（NoSQL 分析）

#### ✅ 列出所有待審核的需求

1. 在管理後台點擊「待審核需求」
2. 驗證：
   - 可以看到所有狀態為「Pending」的需求
   - 可以依需求類型（Material/Tool/Humanpower）篩選
   - 依建立時間倒序排列（最新的在前）
   - 可以審核並批准或拒絕需求

#### ✅ 管理倉庫借用申請

1. 在管理後台或「我的倉庫」頁面
2. 驗證：
   - 可以看到所有待審核的借用申請
   - 可以批准或拒絕申請
   - 批准後庫存數量會自動更新

### 3. 系統級功能驗證

#### ✅ 併行控制（Concurrency Control）

**測試步驟**：
1. 開啟兩個瀏覽器視窗，分別登入不同使用者
2. 兩個視窗都將同一個需求（例如：40 個口罩）加入認領清單
3. 第一個視窗點擊「確認送出認領」→ 應該顯示認領成功
4. 第二個視窗點擊「確認送出認領」→ 應該顯示錯誤：「認領失敗：此需求已經完成，無法再認領」

**驗證重點**：
- 使用 `FOR UPDATE` 鎖定機制防止超額認領
- 需求完成後自動拒絕後續認領
- 前端提交前會檢查需求的當前狀態

#### ✅ 資料同步

**測試步驟**：
1. 開啟兩個瀏覽器視窗，登入不同使用者
2. 第一個視窗認領一個需求
3. 第二個視窗刷新需求列表頁面
4. 驗證第二個視窗可以看到更新後的「已募集」數量

#### ✅ 大規模資料處理

**驗證重點**：
- 需求列表支援分頁，可以瀏覽 10,000+ 筆需求
- SQL 查詢在萬筆資料規模下執行時間約 1.7 毫秒（已建立索引）
- 管理後台統計圖表可以即時生成

#### ✅ NoSQL 行為分析

**驗證重點**：
- MongoDB 儲存使用者點擊紀錄和搜尋關鍵字
- 管理後台顯示分頁點擊統計和熱門搜尋關鍵字
- 分析資料以圖表形式呈現

---

## 🛠 技術架構

### Client-Server 架構

- **前端（Client）**: React 19 + TypeScript + Tailwind CSS
  - 運行在 `http://localhost:5173`
  - 透過 HTTP API 與後端溝通

- **後端（Server）**: Node.js + Express
  - 運行在 `http://localhost:3000`
  - 提供 RESTful API (`/api/...`)

- **資料庫**:
  - **PostgreSQL**: 儲存所有結構化資料（使用者、需求、倉庫、避難所等）
  - **MongoDB**: 儲存 NoSQL 行為分析資料（點擊紀錄、搜尋關鍵字）

### 主要技術棧

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite, React Router
- **Backend**: Node.js, Express, PostgreSQL (pg), MongoDB (mongodb)
- **Database**: PostgreSQL 14+, MongoDB 7.0+
- **API**: RESTful API

### 資料庫連接

**PostgreSQL 連接設定**：
- 預設連接：`postgresql://postgres:password@localhost:5432/disaster_platform`
- 如果使用 Postgres.app，port 可能是 `5433`
- 連接資訊可在 `backend/.env` 中設定

**MongoDB 連接設定**：
- 預設連接：`mongodb://localhost:27017/disaster_platform_analytics`
- MongoDB 為可選，如果未啟動，系統仍可正常運作（僅 NoSQL 分析功能不可用）

---

## 📖 使用說明

### 🦸‍♂️ 志工模式（提供協助）

- **瀏覽需求**：查看所有救災需求，可依類別、地區、緊急程度篩選
- **認領需求**：將需求加入認領清單，填寫提供數量與時間
- **查詢避難所**：根據地理位置查詢附近的避難所
- **瀏覽倉庫**：查看可用物資和工具，申請借用

### 🆘 災民模式（發布需求）

- **發布需求**：填寫物資或救援需求，包含地點、數量、緊急程度等
- **綁定災情事件**：將需求與特定災情事件關聯

### 👨‍💼 管理員模式（業務經營者）

- **審核需求**：審核待審核的需求，確保資訊正確
- **查看統計**：查看系統總覽統計和 NoSQL 行為分析
- **管理倉庫**：審核倉庫借用申請，管理庫存

---

## 👥 協作指南

### 下載專案

```bash
git clone https://github.com/XintiWu/DB-Project.git
cd DB-Project
```

### 切換到 Demo Branch

```bash
git checkout demo
# 或如果 demo branch 不存在
git checkout -b demo
```

### 分支協作 (推薦)

1. **拉取最新程式碼**：`git pull origin main`
2. **建立分支**：`git checkout -b feature/你的功能`
3. **提交更改**：`git commit -m "新增功能..."`
4. **推送分支**：`git push origin feature/你的功能`
5. **發起 PR**：在 GitHub 上建立 Pull Request

---

## 🐛 常見問題

### PostgreSQL 連接失敗

1. **檢查 PostgreSQL 服務是否啟動**：
   ```bash
   # macOS
   brew services list
   # 或檢查 Postgres.app 是否運行
   ```

2. **檢查 port 設定**：
   - Postgres.app 預設使用 port `5433`
   - Homebrew 安裝的 PostgreSQL 預設使用 port `5432`
   - 確認 `backend/.env` 中的 `DB_PORT` 設定正確

3. **檢查資料庫是否存在**：
   ```bash
   psql -U postgres -l
   ```

### MongoDB 連接失敗

- MongoDB 為可選功能，如果未啟動，系統仍可正常運作
- 僅 NoSQL 分析功能（分頁點擊統計、搜尋關鍵字）會不可用
- 如需使用，請確保 MongoDB 服務已啟動：
  ```bash
  # macOS
  brew services start mongodb-community
  # 或使用 Docker
  docker start mongodb
  ```

### 認領清單刷新後消失

- 已修復：認領清單會保存在 `localStorage` 中，刷新後會自動恢復
- 如果仍有問題，請清除瀏覽器快取並重新登入

---

## 📝 資料庫備份

專案根目錄包含資料庫備份檔案：
- `disaster_platform_demo.backup`: 包含完整測試資料的 PostgreSQL 備份

還原備份：
```bash
pg_restore -U postgres -h localhost -p 5432 -d disaster_platform -v disaster_platform_demo.backup
```

---

## 📄 授權

本專案為學術專案，僅供學習和研究使用。

---

## 👨‍💻 開發團隊

- 資料庫管理（113-1）期末專案
- 組別：第 X 組
- 成員：林采穎、...

---

## 📞 聯絡資訊

如有問題或建議，請透過 GitHub Issues 聯繫。
