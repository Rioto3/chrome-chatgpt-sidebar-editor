// background/sync.js

import { API } from "./api.js";
import { BookmarksStorageService } from "./storage/bookmarksStorageService.js";

console.log("⏰ Sync scheduler loaded");

// 15分おきに同期チェック
chrome.alarms.create("periodicSync", { periodInMinutes: 15 });

// アラームイベントを受け取る
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "periodicSync") {
    console.log("🔄 Running scheduled sync...");
    performSync();
  }
});

// === 実際の同期ロジック ===
async function performSync(maxRetries = 3) {
  const bookmarks = await BookmarksStorageService.getBookmarks();
  const payload = { "ai-chat-editor-plus": bookmarks };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🚀 Sync attempt ${attempt} / ${maxRetries}...`);
      const res = await API.request(
        "/users/fdbf0f79-1a20-4d3a-8e7d-521664257a0d/snapshot",
        "POST",
        payload
      );

      // 成功判定
      if (res.ok || res.status === "success" || res.snapshot_id) {
        console.log("✅ Background sync success");
        return;
      } else {
        console.warn(`⚠️ Server responded but not OK (try ${attempt})`);
      }
    } catch (err) {
      console.warn(`❌ Attempt ${attempt} failed: ${err.message}`);
    }

    // === リトライ間隔（指数バックオフ） ===
    const delay = attempt * 5000; // 5s, 10s, 15s
    console.log(`⏳ Retrying in ${delay / 1000}s...`);
    await sleep(delay);
  }

  console.error("❌ Background sync failed after all retries");
}

// === ユーティリティ ===
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
