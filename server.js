const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.', {
    setHeaders: (res, path) => {
        if (path.endsWith('.html') || path.endsWith('.js') || path.endsWith('.css')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
})); // フロントエンドの静的ファイルを配信（キャッシュ無効化設定付き）

// Gemini API プロキシエンドポイント
app.post('/api/generate', async (req, res) => {
    try {
        const { accessCode, ...geminiPayload } = req.body;

        // アクセスコードの検証
        const validCode = process.env.ACCESS_CODE || 'darumaya';
        if (accessCode !== validCode) {
            return res.status(403).json({ error: { message: 'アクセスコードが正しくありません。' } });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_api_key_here') {
            return res.status(500).json({ error: { message: 'APIキーが設定されていません。サーバーの.envファイルを確認してください。' } });
        }

        const model = 'gemini-3-pro-image-preview';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(geminiPayload)
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: { message: 'サーバー内部エラーが発生しました。' } });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
