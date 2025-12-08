// background/route.js
import { createGroup, updateGroup, deleteGroup } from "./sync.js";

// === 拡張全体の「ルータ」 ===
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[BG] Message received:", message.type);

  switch (message.type) {
    case "SYNC_CREATE":
      createGroup(message.payload);
      break;
    case "SYNC_UPDATE":
      updateGroup(message.payload.id, message.payload.data);
      break;
    case "SYNC_DELETE":
      deleteGroup(message.payload.id);
      break;
    default:
      console.warn("[BG] Unknown message:", message.type);
  }

  sendResponse({ ok: true });
});
