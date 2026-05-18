// popup.jsx
import React from "react";
import { createRoot } from "react-dom/client";

const PopupAsPage = () => {
  return (
    <div
      style={{
        width: "320px",
        padding: "16px",
        backgroundColor: "#f9fafb",
        fontFamily: "system-ui, sans-serif",
        color: "#333",
      }}
    >
      {/* === ヘッダー === */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "8px",
          marginBottom: "12px",
        }}
      >
        <h1 style={{ fontSize: "16px", fontWeight: "bold" }}>🦊 Popup Page</h1>

        <button
          onClick={() => chrome.runtime.openOptionsPage()}
          title="設定を開く"
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "16px",
            lineHeight: "1",
          }}
        >
          ⚙️
        </button>
      </header>

      {/* === コンテンツ === */}
      <main>
        <p style={{ fontSize: "13px", color: "#555" }}>
          拡張機能メニューから各種操作を行えます。
        </p>
        <p style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}>
          設定ページを開くには右上の⚙️ボタンをクリック。
        </p>
      </main>
    </div>
  );
};

// === DOMレンダリング ===
if (typeof document !== "undefined") {
  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(<PopupAsPage />);
  } else {
    console.error(
      "⚠️ #root が見つかりません。popup.html に <div id='root'></div> を追加してください。"
    );
  }
}

export default PopupAsPage;
