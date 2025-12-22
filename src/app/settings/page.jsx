// background/settings.jsx
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "../styles/tailwind.css"; // ✅ TailwindCSS 読み込み

const SettingsPage = () => {
  const [status, setStatus] = useState("");
  const [jsonPreview, setJsonPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const USER_ID = "fdbf0f79-1a20-4d3a-8e7d-521664257a0d"; // ← 今は固定（将来的に設定可）
  const API_BASE = "https://v1.api.tubeclip.win/api/v1/ai-chat-editor-plus";

  console.log("✅ SettingsPage mounted");


  // === JSONエクスポート ===
  const handleExport = () => {
    chrome.storage.local.get(["ai-chat-editor-plus"], (data) => {
      try {
        const json = JSON.stringify(data, null, 2);
        const date = new Date().toISOString().split("T")[0];
        const filename = `AIチャットエディタ＋${date}.json`;

        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);

        setStatus(`✅ ${filename} をダウンロードしました`);
        setJsonPreview(json);
      } catch (err) {
        setStatus(`❌ エクスポート中にエラー: ${err.message}`);
      }
    });
  };

  // === JSONインポート ===
const handleJsonImport = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      // 🪞 保存せず、プレビューだけ更新
      setJsonPreview(JSON.stringify(data, null, 2));
      setStatus(`✅ ${file.name} をプレビューに読み込みました`);
    } catch (err) {
      setStatus(`❌ インポートエラー: ${err.message}`);
    }
  };
  reader.readAsText(file);
};

  // === サーバーからデータを取得 ===
  const handleLoadFromServer = async () => {
    setLoading(true);
    setStatus("📡 サーバーからデータ取得中…");

    try {
      const res = await fetch(`${API_BASE}/users/${USER_ID}/latest`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setJsonPreview(JSON.stringify(data, null, 2));
      setStatus("✅ サーバーデータを取得しました");
    } catch (err) {
      setStatus(`❌ サーバー取得エラー: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


const handleApplyPreviewToLocal = async () => {
  try {
    if (!jsonPreview) {
      setStatus("⚠️ プレビューにデータがありません");
      return;
    }

    // ① 一段階目のパース
    let parsed = JSON.parse(jsonPreview);

    // ② 中身がさらに文字列なら再パース
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {
        throw new Error("JSON文字列の二重構造を解釈できませんでした。");
      }
    }

    // ③ ai-chat-editor-plus のみ抽出
    let extracted;
    if (parsed.snapshot_data && parsed.snapshot_data["ai-chat-editor-plus"]) {
      extracted = parsed.snapshot_data["ai-chat-editor-plus"];
    } else if (parsed["ai-chat-editor-plus"]) {
      extracted = parsed["ai-chat-editor-plus"];
    } else {
      // そのまま直接格納
      extracted = parsed;
    }

    // ④ ローカルストレージに保存
    await chrome.storage.local.set({ "ai-chat-editor-plus": extracted });

    setStatus("✅ プレビュー文字列を二重解析し、ai-chat-editor-plus データを保存しました");
  } catch (err) {
    console.error("❌ handleApplyPreviewToLocal Error:", err);
    setStatus(`❌ ローカル反映エラー: ${err.message}`);
  }
};


// === サーバーへ書き込み ===
const handleSaveToServer = async () => {
  try {
    if (!jsonPreview) {
      setStatus("⚠️ プレビューにデータがありません");
      return;
    }

    // 1️⃣ JSONを解析（安全チェック）
    let parsed;
    try {
      parsed = JSON.parse(jsonPreview);
    } catch (err) {
      throw new Error("プレビュー内容が有効なJSONではありません。");
    }

    // 2️⃣ ai-chat-editor-plus の中身だけを抽出
    const snapshotData = { "ai-chat-editor-plus": parsed };

    // 3️⃣ POST送信
    setStatus("🚀 サーバーへデータを送信中…");

    const res = await fetch(
      "https://v1.api.tubeclip.win/api/v1/ai-chat-editor-plus/users/fdbf0f79-1a20-4d3a-8e7d-521664257a0d/snapshot",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snapshotData),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const result = await res.json();
    setStatus(`✅ サーバーへ保存完了（ID: ${result.snapshot_id || "不明"}）`);
  } catch (err) {
    console.error("❌ handleSaveToServer Error:", err);
    setStatus(`❌ サーバー書き込みエラー: ${err.message}`);
  }
};




  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">

      {/* === Header === */}
      <header className="mb-6 border-b pb-3">
        <h1 className="text-xl font-bold">⚙️ 設定</h1>
        <p className="text-sm text-gray-500 mt-1">
          ブックマークとプロンプトのバックアップ／復元を行えます。
        </p>
      </header>

      {/* === Local JSON Section === */}
      <section id="localJsonSection" className="mb-8">
        <h2 className="text-base font-semibold mb-2">📦 ローカルJSONデータ</h2>
        <p className="text-sm text-gray-600 mb-3">
          現在のローカルデータをエクスポート／インポートできます。
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
          >
            📤 エクスポート
          </button>

          <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer transition">
            📥 インポート
            <input
              type="file"
              accept=".json"
              onChange={handleJsonImport}
              className="hidden"
            />
          </label>
        </div>
      </section>


{/* === Database Section === */}
<section id="dbSection" className="mb-8">
  <h2 className="text-lg font-semibold mb-2">🗄 サーバーデータ同期</h2>
  <p className="text-sm text-gray-600 mb-3">
    サーバー上に保存されたスナップショットを読み込み・保存できます。
  </p>

  <div className="flex items-center gap-3">
    {/* ✅ サーバーから読み込む */}
    <button
      onClick={handleLoadFromServer}
      disabled={loading}
      className={`${
        loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
      } text-white px-4 py-2 rounded transition`}
    >
      {loading ? "⏳ 取得中…" : "📡 サーバーから読み込む"}
    </button>

    {/* ✅ サーバーへ書き込む */}
    <button
      onClick={handleSaveToServer}
      disabled={loading}
      className={`${
        loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
      } text-white px-4 py-2 rounded transition`}
    >
      🚀 サーバーへ書き込む
    </button>
  </div>
</section>




{/* === JSON Preview === */}
<section id="jsonPreview" className="mb-6">
  <h2 className="text-lg font-semibold mb-2">🧩 現在のJSONプレビュー</h2>

  <pre className="bg-gray-900 text-green-300 text-sm rounded p-4 overflow-auto max-h-[300px] font-mono whitespace-pre-wrap">
    {jsonPreview || "（まだデータがありません）"}
  </pre>

  {/* 💾 プレビュー内容をローカルに反映するボタン */}
  <div className="mt-3 flex justify-end">
    <button
      onClick={handleApplyPreviewToLocal}
      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition text-sm"
    >
      💾 このプレビューをアドオンに反映
    </button>
  </div>
</section>


      {/* === Status Bar === */}
      <div className="text-sm text-gray-700 italic">{status}</div>
    </div>
  );
};

// === DOMマウント ===
if (typeof document !== "undefined") {
  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(<SettingsPage />);
  } else {
    console.error(
      "⚠️ #root が見つかりません。settings.html に <div id='root'></div> を追加してください。"
    );
  }
}

export default SettingsPage;
