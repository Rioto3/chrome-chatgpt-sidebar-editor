// background/index.js
import { API } from "./api.js";
import { Sync } from "./sync.js";
import { BookmarksStorageService } from "./storage/bookmarksStorageService.js";


console.log("🧠 Background service loaded.");

chrome.runtime.onInstalled.addListener(() => {
  console.log("🚀 Extension installed.");
});
// 🔥 サイドパネルからのメッセージを受け取る
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📩 Message received:", message);
  console.log("👤 Sender:", sender);

  // 非同期処理を即座に実行
  (async () => {
    try {
      console.log("🔄 Processing message type:", message.type);

      switch (message.type) {

      case "BOOKMARKS_INIT":
        var data = await BookmarksStorageService.initialize();
        sendResponse({ ok: true, data });
        break;

      case "BOOKMARKS_GET":
        const bookmarks = await BookmarksStorageService.getBookmarks();
        sendResponse({ ok: true, data: bookmarks });
        break;

          
        default:
          console.warn("❓ Unknown message type:", message.type);
          sendResponse({ ok: false, error: "Unknown message type" });
      }
    } catch (err) {
      console.error("❌ Background error:", err);
      sendResponse({ ok: false, error: err.message });
    }
  })();

  return true; // 非同期レスポンスを許可
});