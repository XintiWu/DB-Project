import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3000; // 後端服務器通常運行在 3000 埠號

// 1. 設定 CORS (解決前端跨域問題)
// 允許來自你的前端地址的請求 (例如 Vite 開發伺服器的預設埠號)
app.use(cors({
    origin: 'http://localhost:5173' // 假設你的前端運行在 5173
}));

// 允許伺服器處理 JSON 格式的請求體
app.use(express.json());

// 2. 建立你的第一個 API 介面 (Endpoint)
app.get('/api/data', (req: Request, res: Response) => {
    // 💡 這裡就是未來連接資料庫的地方！

    // 模擬從資料庫取出的資料
    const dataFromDB = {
        message: "Hello from the Backend Server!",
        timestamp: new Date().toISOString()
    };

    // 將資料以 JSON 格式回傳給前端
    res.json(dataFromDB);
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Ready to connect to frontend at http://localhost:5173`);
});
