import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

const SettingsPage = () => {
  const [status, setStatus] = useState("");
  const [jsonPreview, setJsonPreview] = useState("");

  // === 現在のデータを読み出す（初期プレビュー用） ===
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
    <div style={{ padding: "1.5rem", fontFamily: "sans-serif", lineHeight: 1.6 }}>

      <div id="headerSection">
        <h2>⚙️ 設定</h2>
      </div>


      <div id="localJsonSection" style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <p>ブックマークとプロンプトのバックアップ／復元を行えます。</p>

        <button onClick={handleExport}>📤 JSONをエクスポート</button>

        <label style={{ cursor: "pointer" }}>
          📥 JSONをインポート
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: "none" }}
          />
        </label>
      </div>

      <div id="dbSection">
        <p>ここにデータベースに関する機能</p>
      </div>

      <div id="previewSection">
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#555" }}>{status}</p>

        <textarea
          readOnly
          value={jsonPreview}
          placeholder="現在の保存データ、またはインポートした内容がここに表示されます"
          style={{
            width: "100%",
            height: "320px",
            fontFamily: "monospace",
            fontSize: "13px",
            marginTop: "0.5rem",
            padding: "0.5rem",
            borderRadius: "6px",
            border: "1px solid #ccc",
            background: "#fafafa",
          }}
        />
      </div>
    </div>
  );
};

// DOM レンダリング
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
