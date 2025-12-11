// background/index.js
import { API } from "./api.js";
import { Sync } from "./sync.js";

console.log("🧠 Background service loaded.");

chrome.runtime.onInstalled.addListener(() => {
  console.log("🚀 Extension installed.");
});

// 🔥 サイドパネルからのメッセージを受け取る
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("📩 Message received:", message);

  // 非同期処理を即座に実行
  (async () => {
    try {
      switch (message.type) {
        // ====== 手動同期 ======
        case "SYNC_TO_SERVER":
          await Sync.syncToServer();
          sendResponse({ ok: true });
          break;

        case "SYNC_FROM_SERVER":
          const data = await Sync.syncFromServer();
          sendResponse({ ok: true, data });
          break;

        // ====== グループ操作 ======
        case "GROUP_CREATE":
          await API.createGroup({
            id: message.payload.id,
            name: message.payload.name,
          });
          console.log(`✅ Group created: ${message.payload.name}`);
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