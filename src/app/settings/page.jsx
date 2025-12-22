import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "../styles/tailwind.css"; // ✅ TailwindCSS 読み込み

const SettingsPage = () => {
  const [status, setStatus] = useState("");
  const [jsonPreview, setJsonPreview] = useState("");

  console.log("✅ SettingsPage mounted");


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
          setStatus(
            `✅ ${file.name} をインポートしました（Sidepanelを再読み込みしてください）`
          );
          setJsonPreview(JSON.stringify(data, null, 2));
        });
      } catch (err) {
        setStatus(`❌ インポートエラー: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      <div className="p-6 bg-red-100 text-red-800 font-bold">
  ✅ Tailwind 読み込みチェック
</div>

      {/* === Header === */}
      <header className="mb-6 border-b pb-3">
        <h1 className="text-2xl font-bold">⚙️ 設定</h1>
        <p className="text-sm text-gray-500 mt-1">
          ブックマークとプロンプトのバックアップ／復元を行えます。
        </p>
      </header>

      {/* === Local JSON Section === */}
      <section id="localJsonSection" className="mb-8">
        <h2 className="text-lg font-semibold mb-2">📦 ローカルJSONデータ</h2>
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
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </section>

      {/* === Database Section === */}
      <section id="dbSection" className="mb-8">
        <h2 className="text-lg font-semibold mb-2">🗄 データベース同期（準備中）</h2>
        <p className="text-sm text-gray-600">
          ここにサー能を追加します。
        </p>
      </section>

      {/* === JSON Preview === */}
      <section id="jsonPreview" className="mb-6">
        <h2 className="text-lg font-semibold mb-2">🧩 現在のJSONプレビュー</h2>
        <pre className="bg-gray-900 text-green-300 text-sm rounded p-4 overflow-auto max-h-[300px] font-mono whitespace-pre-wrap">
          {jsonPreview || "（まだデータがありません）"}
        </pre>
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
