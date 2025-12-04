# 🪏 鏟子超人 - 災害資訊整合平台

> 災害發生時，讓需要幫助的人找到資源，讓想幫助的人找到需求

一個專為救災情境設計的資源配對平台，解決災害發生時**資訊不流通**的問題。

[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-336791.svg)](https://www.postgresql.org/)
[![Express](https://img.shields.io/badge/Express-5.0-000000.svg)](https://expressjs.com/)

---

## 🚀 快速開始 (Quick Start)

### 環境需求

- **Node.js**: v18 或以上
- **PostgreSQL**: v14 或以上

### ⚡ 一鍵啟動 (Mac/Linux)

專案根目錄附帶了啟動腳本，可同時啟動前後端：

```bash
./start_system.sh
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

## 📖 使用說明

### 🦸‍♂️ 志工模式（提供協助）

- **瀏覽需求**：查看所有救災需求，可依類別、地區、緊急程度篩選。
- **認領需求**：將需求加入認領清單，填寫提供數量與時間。

### 🆘 災民模式（發布需求）

- **發布需求**：填寫物資或救援需求，包含地點、數量、緊急程度等。
- **管理金鑰**：發布後會獲得一組金鑰，用於後續修改或關閉需求。

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

