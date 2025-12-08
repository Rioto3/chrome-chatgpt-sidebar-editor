// src/app/background/route.js
import { GroupSync, ItemSync } from "./sync.js";

// インスタンス化
const groupSync = new GroupSync();
const itemSync = new ItemSync();

console.log("[BG] Background route initialized.");

// === メッセージルーター ===
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[BG] Message received:", message.type, message.payload);

  (async () => {
    try {
      switch (message.type) {
        // === Group ===
        case "GROUP_CREATE":
          await groupSync.create(message.payload);
          break;
        case "GROUP_READ":
          const g = await groupSync.read(message.payload.id);
          sendResponse({ ok: true, data: g });
          return; // 非同期レスポンス

        case "GROUP_UPDATE":
          await groupSync.update(message.payload.id, message.payload.data);
          break;
        case "GROUP_DELETE":
          await groupSync.delete(message.payload.id);
          break;

        // === Item ===
        case "ITEM_CREATE":
          await itemSync.create(message.payload.groupId, message.payload.item);
          break;
        case "ITEM_UPDATE":
          await itemSync.update(
            message.payload.groupId,
            message.payload.itemId,
            message.payload.data
          );
          break;
        case "ITEM_DELETE":
          await itemSync.delete(message.payload.groupId, message.payload.itemId);
          break;

        default:
          console.warn("[BG] Unknown message type:", message.type);
      }

      sendResponse({ ok: true });
    } catch (err) {
      console.error("[BG] Error:", err);
      sendResponse({ ok: false, error: err.message });
    }
  })();

  // 非同期応答を許可
  return true;
});
