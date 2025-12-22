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
        // ====== 手動同期 ======
        case "SYNC_TO_SERVER":
          console.log("🔼 Starting sync to server...");
          await Sync.syncToServer();
          console.log("✅ Sync to server completed");
          sendResponse({ ok: true });
          break;

        case "SYNC_FROM_SERVER":
          console.log("🔽 Starting sync from server...");
          var data = await Sync.syncFromServer();
          console.log("✅ Sync from server completed");
          sendResponse({ ok: true, data });
          break;

        // ====== グループ操作 ======
        case "GROUP_CREATE":
          console.log("📁 Creating group:", message.payload);
          await API.createGroup({
            id: message.payload.id,
            name: message.payload.name,
          });
          console.log("✅ Group created successfully");
          sendResponse({ ok: true });
          break;

        case "GROUP_UPDATE":
          console.log("✏️ Updating group:", message.payload);
          await API.updateGroup(message.payload.id, message.payload.data);
          console.log("✅ Group updated successfully");
          sendResponse({ ok: true });
          break;
          
        case "SYNC_DELETE":
          await API.deleteGroup(message.payload.id);
          console.log(`🗑 Group deleted: ${message.payload.id}`);
          sendResponse({ ok: true });
          break;

        // ====== アイテム操作 ======
        case "ITEM_CREATE":
          await API.createItem({
            ...message.payload.item,
            group_id: message.payload.groupId,
          });
          console.log(`✅ Item created: ${message.payload.item.name}`);
          sendResponse({ ok: true });
          break;

        case "ITEM_UPDATE":
          await API.updateItem(message.payload.itemId, message.payload.data);
          console.log(`✏️ Item updated: ${message.payload.itemId}`);
          sendResponse({ ok: true });
          break;

        case "ITEM_DELETE":
          await API.deleteItem(message.payload.itemId);
          console.log(`🗑 Item deleted: ${message.payload.itemId}`);
          sendResponse({ ok: true });
          break;

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