# 🧱 AIチャットエディタ＋ Build Guide

Version: 1.0.0
Author: TubeClip / Rioto3
License: MIT (OSS)

---

## 概要

この拡張は **Firefox 向け Manifest V3 アドオン** です。ChatGPT（マイGPT）との連携用サイドパネル UI を提供します。
`dist-devel/` にビルド成果物を出力します。

---

## ビルド環境

* OS: macOS 15
* Node.js: v20 以上
* npm: v10 以上
* 推奨: Firefox Developer Edition

---

## 依存関係

主要依存パッケージ: package.json のとおり

---

## ビルド方法

```bash
npm install
npm run build:devel
```

package.json 例：

```json
{
  "scripts": {
    "build:devel": "NODE_ENV=development webpack",
    "build:prod": "NODE_ENV=production webpack"
  }
}
```

出力先: `dist-devel/`

---

## 注意事項

* 最小化・難読化は行っていません。
* `src/` 以下にすべてのオリジナルソースを含みます。
* node_modules は OSS ライブラリのみ。

---

## チェックリスト

* [x] data_collection_permissions 設定済み
* [x] ID: `aichat-editor-plus@tubeclip.work`
* [x] README_BUILD.md 同梱

---

✅ Webpack は単純なバンドルのみを行い、圧縮・難読化はしていません。
