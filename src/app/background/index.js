// background/index.js
import { Sync } from "./sync.js";

console.log("🧠 Background service loaded.");

// 拡張インストール時
chrome.runtime.onInstalled.addListener(() => {
  console.log("🚀 Extension installed.");
});

// メッセージを受け取って同期操作
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  try {
    switch (message.type) {
      case "SYNC_TO_SERVER":
        await Sync.syncToServer();
        sendResponse({ ok: true });
        break;
      case "SYNC_FROM_SERVER":
        const state = await Sync.syncFromServer();
        sendResponse({ ok: true, data: state });
        break;
      default:
        console.warn("❓ Unknown message:", message);
        sendResponse({ ok: false, error: "Unknown message type" });
    }
  } catch (err) {
    console.error("❌ Sync error:", err);
    sendResponse({ ok: false, error: err.message });
  }

  return true; // 非同期応答を許可
});
