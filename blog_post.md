# 【初心者向け】AIで「理想の自分」に変身！着物バーチャル試着アプリの作り方

AI（Gemini 2.0 Pro）を活用して、自分の写真と着物画像を合成する「バーチャル試着アプリ」を開発しました。
Node.js（Express）をバックエンドに使い、Renderで公開するまでの全工程をブログ形式でまとめます。

---

## 🌟 どんなアプリ？
自分の顔写真をアップロードし、好きな着物を選ぶだけで、AIがまるでプロが撮影したような「着物姿の自分」を生成してくれるアプリです。

### 主な特徴
- **Gemini 2.0 Pro搭載**: 最新AIによる、驚くほど自然な顔合成。
- **安心のセキュリティ**: APIキーを隠蔽し、合言葉を知っている人だけが使えるプロキシサーバー構成。
- **モバイル対応**: スマホのブラウザからカメラ起動・写真選択がスムーズ。

---

## 🛠 開発ステップ

### 1. アプリの構成を考える
フロントエンド（見た目）だけで完結させると、大事な「APIキー」が丸見えになってしまいます。
そこで今回は、以下の3段構成にしました。

1. **フロントエンド (HTML/CSS/JS)**: ユーザーが操作する画面。
2. **プロキシサーバー (Node.js/Express)**: APIキーを安全に守る中継役。
3. **Gemini API**: 画像を生成するAIエンジン。

### 2. バックエンドの実装 (server.js)
Node.jsでプロキシサーバーを作成します。ここで `.env` ファイルからAPIキーを読み込み、Geminiへリクエストを飛ばします。

```javascript
const express = require('express');
const fetch = require('node-fetch');
// APIキーと合言葉を安全に管理
const API_KEY = process.env.GEMINI_API_KEY;
const ACCESS_CODE = process.env.ACCESS_CODE;

app.post('/api/generate', async (req, res) => {
    // 1. 合言葉のチェック
    if (req.body.accessCode !== ACCESS_CODE) {
        return res.status(401).json({ error: '認証失敗' });
    }
    // 2. Gemini APIへリクエスト
    const response = await fetch(`https://generativelanguage.googleapis.com/...&key=${API_KEY}`, {
        method: 'POST',
        body: JSON.stringify(req.body.contents)
    });
    // ...
});
```

### 3. フロントエンドの工夫
スマホでの使い勝手を追求しました。
- **透明オーバーレイ入力**: タップした瞬間に確実にカメラが起動するようにUIを設計。
- **PWA対応**: ホーム画面に追加してアプリのように使える設定。

### 4. Render で世界へ公開！
GitHubにコードをプッシュし、Renderを使ってデプロイします。

**【ポイント】**
Renderの環境変数（Environment Variables）に `GEMINI_API_KEY` と `ACCESS_CODE` を設定することで、ソースコードにパスワードを書かずに安全に公開できました。

---

## 🔥 苦労した点と解決策
- **キャッシュ問題**: 修正してもスマホで古い画面が出続ける問題。
  - → `Service Worker` のバージョン管理と、サーバー側での `Cache-Control: no-cache` 設定で解決。
- **スマホのタップ感度**: アイコンや文字が邪魔してタップしにくい問題。
  - → 透明な `input` 要素を全面に被せる「絶対反応するUI」に変更。

---

## 📸 デモと結果
実際に「振袖 NO1」〜「NO6」の画像でテスト。Gemini 2.0 Proの表現力により、顔の同一性を保ちつつ、着物の質感も素晴らしく再現されました。

---

## 🚀 まとめ
AI（Gemini）とNode.jsを組み合わせることで、実用レベルのバーチャル試着アプリが短期間で作成できました。
「APIキーを隠しつつ合言葉で制限をかける」手法は、個人開発のツール公開には非常におすすめです。

興味のある方は、ぜひ自分だけの着物ジェネレーターを作ってみてください！👘✨
