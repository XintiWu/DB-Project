# 🪏 鏟子超人 - 災害資訊整合平台

> 災害發生時，讓需要幫助的人找到資源，讓想幫助的人找到需求

一個專為救災情境設計的資源配對平台，解決災害發生時**資訊不流通**的問題。

[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791.svg)](https://www.postgresql.org/)
[![Express](https://img.shields.io/badge/Express-5.0-000000.svg)](https://expressjs.com/)

---
## 📸 專案展示

### 百字摘要

本系統整合災情通報、需求管理、物資倉儲、捐款金流、避難所資訊，提供使用者即時發布需求與查詢資源；管理者可在後台審查並進行數據分析，後端採交易管理與索引優化確保一致性與效能，並以 NoSQL 做行為分析。

### 系統截圖

<img width="1470" height="919" alt="image" src="https://github.com/user-attachments/assets/1350c67d-7c0b-472d-a426-3f4ecbd53953" />
<img width="1470" height="919" alt="image" src="https://github.com/user-attachments/assets/5dc0bcb6-c243-4c69-b936-1b8278cf7d85" />
<img width="1470" height="919" alt="image" src="https://github.com/user-attachments/assets/8785af8c-10f2-4d38-a13c-a50f557eb903" />

### 展示影片

[YouTube 影片連結](https://youtu.be/Mhpc-JamN9M)、
[Google Drive 影片連結](https://drive.google.com/file/d/1oVZsKItmttJ6T8CXfrLdVoimPTlImBJw/view?usp=drive_link)

### 簡報、報告數連結

[簡報 PDF 連結](https://drive.google.com/file/d/1Nghhm6_7sjK0UfZSJt8uS9pG5N3JoKnv/view?usp=drive_link)、
[報告書 PDF 連結](https://drive.google.com/file/d/1i7lqos9M4bzALCBmdqizV1LTjulo72po/view?usp=drive_link)

---

## 🚀 快速開始

### 環境需求

- **Node.js (with npm)**: v18 或以上
- **PostgreSQL**: v14 或以上
- **MongoDB**: v6.0

### 事前準備
1. Node.js

   請先手動安裝Node.js+npm
   
2.  **PostgreSQL**

   請在你的 PostgreSQL 中建立資料庫，使用 release 的.backup file 還原資料庫。
   
3. `.env`
   更名專案根目錄的 `.env.example` 為 `.env`，並填入你的資料庫連線資訊 (DB_USER, DB_PASSWORD 等)。

### ⚡ 一鍵啟動 (Mac/Linux)

1. 自動啟動：專案根目錄已設定 `concurrently`，可使用 npm 指令同時啟動前後端。

```bash
npm install # 首次執行需安裝依賴
npm run install:all # 一鍵安裝所有依賴 (Root, Backend, Frontend)
npm start
```

2. Shell 腳本 (Mac/Linux)：

```bash
./start_system.sh
```

3. 批次檔(Windows)：

```bash
./start_system.bat
```

---

## 🛠️ 詳細安裝步驟

如果你想分開啟動或進行開發，請參考以下步驟。

### 1. 資料庫設定 (Database)

首先確保 PostgreSQL 服務已啟動。

1. **建立資料庫**：

   ```sql
   CREATE DATABASE disaster_platform;
   ```


2. **匯入資料表結構**：
   ```bash
   # 請確保你在專案根目錄
   psql -U postgres -d disaster_platform -f backend/schema.sql
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
   成功後會顯示：`🚀 Full API running at http://localhost:3000`

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

## 👥 協作指南

### 下載專案

```bash
git clone https://github.com/XintiWu/DB-Project.git
cd DB-Project
```

### 分支協作 (推薦)

1. **拉取最新程式碼**：`git pull origin main`
2. **建立分支**：`git checkout -b feature/你的功能`
3. **提交更改**：`git commit -m "新增功能..."`
4. **推送分支**：`git push origin feature/你的功能`
5. **發起 PR**：在 GitHub 上建立 Pull Request

---

## 🛠 技術架構

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **API**: RESTful API (`/api/...`)
````
