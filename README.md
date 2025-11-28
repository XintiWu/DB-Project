# 🪏 鏟子超人 - 災害資訊整合平台

> 災害發生時，讓需要幫助的人找到資源，讓想幫助的人找到需求

一個專為救災情境設計的資源配對平台，解決災害發生時**資訊不流通**的問題。

[![React](https://img.shields.io/badge/React-19.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38bdf8.svg)](https://tailwindcss.com/)

---
## 🚀 安裝方式

### 環境需求
- Node.js 18 或以上版本
- npm 或 yarn 套件管理器

### 步驟 1：進入專案目錄

```bash
cd 
```

### 步驟 2：安裝依賴套件

```bash
npm install
```

### 步驟 3：啟動開發伺服器

```bash
npm run dev
```

成功啟動後，會顯示類似以下訊息：
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 步驟 4：開啟瀏覽器

在瀏覽器中打開 `http://localhost:5173` 即可使用！
---

## 👥 協作指南

### 第一次下載專案

```bash
# 使用 HTTPS（推薦）
git clone https://github.com/XintiWu/DB-Project.git
cd DB-Project

# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev
```

### 成為協作者

1. 請專案負責人在 GitHub 上添加你為協作者：
   - 進入專案頁面 → Settings → Collaborators → Add people
2. 接受邀請後，即可推送程式碼到倉庫

### 日常協作流程

#### 方式一：直接在 main 分支工作（適合小團隊）

```bash
# 1. 每次開始工作前，先拉取最新程式碼
git pull origin main

# 2. 進行開發和編輯...

# 3. 完成後提交更改
git add .
git commit -m "描述你的改動內容"
git push origin main
```

#### 方式二：使用分支協作（推薦，避免衝突）

```bash
# 1. 拉取最新程式碼
git pull origin main

# 2. 創建自己的工作分支（分支名稱要有意義，如：feature/login-page）
git checkout -b feature/你的功能名稱

# 3. 進行開發和提交...
git add .
git commit -m "新增登入頁面功能"

# 4. 推送分支到 GitHub
git push origin feature/你的功能名稱

# 5. 在 GitHub 上創建 Pull Request（PR）
#    進入專案頁面 → Pull requests → New pull request
#    選擇你的分支 → 填寫說明 → Create pull request

# 6. 等負責人審查並合併後，切回 main 分支
git checkout main
git pull origin main  # 拉取合併後的最新程式碼
```

### 常見協作指令

```bash
# 查看目前狀態
git status

# 查看遠端倉庫連接（git clone 後會自動設置）
git remote -v

# 查看所有分支
git branch -a

# 切換分支
git checkout 分支名稱

# 查看提交歷史
git log --oneline

# 如果有衝突，解決後再提交
git add .
git commit -m "解決衝突"
git push origin 分支名稱
```

### 協作注意事項

1. ⚠️ **推送前先拉取**：避免覆蓋別人的更改
2. ✅ **提交訊息要清楚**：讓隊友知道你在做什麼
3. 🔀 **有衝突時先溝通**：遇到合併衝突時，先跟隊友討論
4. 🌿 **重要功能用分支**：避免直接改 main 分支
5. 🔄 **定期同步**：每天開始工作前先 `git pull`

---

## 📖 使用說明

### 🦸‍♂️ 志工模式（提供協助）

#### 1. 點擊「我是志工」按鈕
首頁會看到兩個主要按鈕：
- **我是志工**（綠色，帶脈衝動畫） - 點擊此按鈕
- 我是災民（淺紅色）

#### 2. 瀏覽需求列表
- 可以看到所有救災需求
- 使用**篩選面板**縮小範圍：
  - 依類別篩選（食物、飲用水、衣物、醫療等）
  - 依地區篩選（東部、西部、北部等）
  - 依緊急程度篩選（極緊急、高、中、低）
  - 依狀態篩選（急需、募集中、已滿足）
- 使用**排序功能**重新排列：
  - 🚨 緊急程度（極緊急優先）
  - 📅 截止時間（最快到期優先）
  - 📊 認領進度（最需要幫助優先）
  - 🆕 最新發布

#### 3. 加入認領清單
- 點擊需求卡片上的「🤝 我要認領」按鈕
- 需求會被加入右側認領清單（類似購物車）
- 可隨時調整或移除

#### 4. 填寫認領資訊
- 點擊右側認領清單中的需求
- 填寫以下資訊：
  - **物資需求**：認領數量、預計送達時間
  - **救援需求**：可參與時間、資格說明
- 填寫個人聯絡資訊

#### 5. 確認送出
- 檢查認領清單內容
- 點擊「確認送出所有認領」
- 系統會生成認領憑證
- 可以列印或截圖保存

### 🆘 災民模式（發布需求）

#### 1. 點擊「我是災民」按鈕
從首頁點擊淺紅色的「我是災民」按鈕

#### 2. 選擇需求類型
- **物資需求**：食物、水、衣物、醫療用品等
- **救援需求**：人力、專業人員、設備等

#### 3. 填寫需求資訊

**基本資訊**：
- 需求標題
- 詳細地點
- 所屬區域
- 需求類別

**數量資訊**：
- 項目名稱（例如：白米、瓶裝水）
- 需要數量
- 單位（公斤、瓶、人等）

**時效資訊**：
- 緊急程度（極緊急/高/中/低）
- 截止時間

**特殊資訊**（救援需求）：
- 需要的時間段
- 所需技能或資格
- 提供的支援（食宿、交通等）

**聯絡資訊**：
- 發布單位名稱
- 聯絡電話
- 聯絡信箱

#### 4. 送出需求
- 檢查資訊是否正確
- 點擊「發布需求」
- 系統會生成管理金鑰（請妥善保存！）
- 憑管理金鑰可以後續修改或關閉需求

### 📱 介面功能說明

#### 統計儀表板（頂部）
- 📊 **總需求**：顯示平台上所有需求總數
- 🚨 **緊急需求**：極緊急 + 高緊急程度的需求數量
- 🔄 **募集中**：正在募集協助的需求
- ✅ **已滿足**：已經達成目標的需求

#### 需求卡片資訊
- **標題**：需求簡述
- **地點**：具體位置
- **類別標籤**：快速識別需求類型
- **緊急程度徽章**：
  - 🔴 極緊急（紅色脈衝）
  - 🟠 高緊急（橙色）
  - 🟡 中等（黃色）
  - 🟢 低（綠色）
- **進度條**：顯示已認領/總需求的比例
- **截止時間**：倒數計時提示
- **狀態標籤**：
  - 🆘 急需（紅色）
  - 📢 募集中（藍色）
  - ✅ 已滿足（綠色）

#### 暗黑模式
- 點擊右上角 🌙/☀️ 圖示切換
- 設定會自動儲存

---

## 📂 資料格式

### 需求資料（needs.csv）

平台從 `public/data/needs.csv` 讀取需求資料，格式如下：

```csv
id,needType,title,location,region,category,itemName,requiredQuantity,currentQuantity,unit,severity,deadline,timeSlots,requiredSkills,providedSupport,description,publisherName,contactPhone,contactEmail,status,createdAt,managementKey
N001,material,急需白米,花蓮縣光復鄉,東部,food,白米,200,80,公斤,critical,2024-10-20,,,,"避難所目前收容150人",社區協會,03-xxx,email@example.com,ongoing,2024-10-07,KEY-xxx
```

**欄位說明**：
- `needType`: `material`（物資）或 `rescue`（救援）
- `severity`: `critical`（極緊急）、`high`（高）、`medium`（中）、`low`（低）
- `status`: `urgent`（急需）、`ongoing`（募集中）、`fulfilled`（已滿足）

### 認領記錄（claims.csv）

平台從 `public/data/claims.csv` 讀取認領記錄：

```csv
claimId,needId,claimerName,claimerPhone,claimerEmail,claimedQuantity,estimatedDelivery,availableTimeSlots,qualifications,notes,claimedAt,status
C001,N001,王小明,0912-xxx,wang@example.com,50,2024-10-10,,,自有庫存,2024-10-07 10:30:00,active
```

### 如何更新資料

1. 編輯 `public/data/needs.csv` 或 `claims.csv`
2. 重新整理網頁即可看到更新
3. 支援熱更新，無需重啟伺服器

---
## ✨ 功能特色

### 🚨 雙向救援系統
- **災民端**：發布物資需求或人力支援需求
- **志工端**：瀏覽需求並提供協助

### 📊 即時統計儀表板
- 總需求數量、緊急需求數量
- 募集中與已滿足狀態追蹤
- 動態數字滾動動畫

### 🔍 智能篩選排序
- 依類別、地區、緊急程度篩選
- 5 種排序方式：預設、緊急程度、截止時間、認領進度、最新發布
- 關鍵字搜尋功能

### 🎨 視覺體驗
- 🌙 深色模式支援
- 💫 脈衝動畫標示緊急需求
- 📱 響應式設計（支援手機、平板、桌機）
- ✨ 流暢的過渡動畫效果

### 🛒 購物車式認領流程
1. 瀏覽需求並加入認領清單
2. 填寫認領資訊（數量、時間、資格等）
3. 確認送出並取得認領憑證

---

## 🛠 技術架構

### 前端框架
- **React 19.1** - UI 框架
- **TypeScript 5.9** - 型別安全
- **Vite 7.x** - 建構工具

### UI 組件
- **Tailwind CSS 3.4** - CSS 框架
- **shadcn/ui** - UI 組件庫
- **Lucide React** - 圖示庫

### 狀態管理
- **React Context API** - 全域狀態
- **Custom Hooks** - 業務邏輯封裝

### 路由
- **React Router v7** - 頁面路由

### 專案結構

```
disaster-relief-platform/
├── public/
│   └── data/              # CSV 資料檔案
│       ├── needs.csv      # 需求資料
│       └── claims.csv     # 認領記錄
├── src/
│   ├── components/        # UI 組件
│   │   ├── ui/           # shadcn/ui 基礎組件
│   │   ├── HeroSection.tsx
│   │   ├── NeedCard.tsx
│   │   ├── FilterPanel.tsx
│   │   └── ...
│   ├── pages/            # 頁面組件
│   │   ├── HomePage.tsx
│   │   ├── VolunteerPage.tsx
│   │   └── ...
│   ├── context/          # Context 管理
│   │   ├── ClaimContext.tsx
│   │   └── ThemeContext.tsx
│   ├── hooks/            # 自定義 Hooks
│   │   └── useNeedData.ts
│   ├── lib/              # 工具函數
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   └── utils.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

---

## 🎯 設計理念

1. **資訊透明化** - 所有需求公開透明，即時更新進度
2. **操作簡單** - 清晰的流程設計，降低使用門檻
3. **無需登入** - 使用管理金鑰機制，緊急時刻快速使用
4. **響應式設計** - 支援各種裝置，隨時隨地可用
5. **視覺引導** - 用顏色、動畫引導用戶關注重點

---
## 🙏 致謝

感謝所有在災害救援中默默付出的志工與團隊！
---

**需要協助？** 發現問題或有建議，歡迎開 Issue 討論！
