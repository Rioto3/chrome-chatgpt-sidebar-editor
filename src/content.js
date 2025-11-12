chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[content.js] メッセージ受信:', message);

  if (message.type === "SEND_PROMPT") {
    const text = message.payload;

    // ✅ ここでログ or アラートで確認
    alert(`[content.js] 受け取ったプロンプト:\n${text}`);
    // または
    console.log(`[content.js] 受け取ったプロンプト:`, text);
  }
});
