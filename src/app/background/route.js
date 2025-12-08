import { createGroup, updateGroup, deleteGroup, fetchServerState } from "./sync.js";

// 初回起動時にサーバから同期
chrome.runtime.onStartup.addListener(async () => {
  console.log("[BG] Chrome起動: サーバ同期を開始します");
  await fetchServerState();
});

chrome.runtime.onInstalled.addListener(async () => {
  console.log("[BG] 拡張初回インストール: サーバ同期を開始します");
  await fetchServerState();
});

// === メッセージルータ ===
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
