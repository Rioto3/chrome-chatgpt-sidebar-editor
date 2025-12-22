import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "../styles/tailwind.css"; // ✅ Tailwindを読み込む

const SettingsPage = () => {
  const [status, setStatus] = useState("");
  const [jsonPreview, setJsonPreview] = useState("");

  // === 初期データ読込 ===
  useEffect(() => {
    chrome.storage.local.get(["bookmarksState", "prompt"], (data) => {
      if (data) {
        setJsonPreview(JSON.stringify(data, null, 2));
      }
    });
  }, []);

  // === JSONエクスポート ===
  const handleExport = () => {
    chrome.storage.local.get(["bookmarksState", "prompt"], (data) => {
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
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const update = {};
        if (data.bookmarksState) update.bookmarksState = data.bookmarksState;
        if (data.prompt) update.prompt = data.prompt;

        chrome.storage.local.set(update, () => {
          setStatus(`✅ ${file.name} をインポートしました（Sidepanelを再読み込みしてください）`);
          setJsonPreview(JSON.stringify(data, null, 2));
        });
      } catch (err) {
        setStatus(`❌ インポートエラー: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="settings-page">
      <header>
        <h1>⚙️ 設定</h1>
        <p>ブックマークとプロンプトのバックアップ／復元を行えます。</p>
      </header>

      {/* === ローカルJSONセクション === */}
      <section id="localJsonSection" className="section">
        <h2>📦 ローカルJSONデータ</h2>
        <p className="section-desc">
          現在のローカルデータをエクスポート／インポートできます。
        </p>

        <div className="json-actions">
          <button className="btn" onClick={handleExport}>📤 エクスポート</button>
          <label className="btn btn-secondary">
            📥 インポート
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </section>

      {/* === DBセクション（今後用） === */}
      <section id="dbSection" className="section">
        <h2>🗄 データベース同期（準備中）</h2>
        <p>ここにサーバー連携機能を追加します。</p>
      </section>

      {/* === プレビュー === */}
      <section id="previewSection" className="section">
        <h2>🧩 現在のJSONプレビュー</h2>
        <pre>{jsonPreview}</pre>
      </section>

      <footer>
        <p className="status">{status}</p>
      </footer>
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
    console.error("⚠️ #root が見つかりません。settings.html に <div id='root'></div> を追加してください。");
  }
}

export default SettingsPage;
