chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SEND_PROMPT") {
    const text = message.payload;

    console.log("[content.js] 送信リクエスト受信:", text);

    // ChatGPTの入力欄を探す（ProseMirror）
    const input = document.querySelector('.ProseMirror');
    const sendBtn = document.querySelector('#composer-submit-button');

    if (input && sendBtn) {
      // 入力欄にテキストを挿入（document.execCommandは古典的だけど有効）
      input.focus();
      document.execCommand('selectAll', false, null); // 既存テキストがあれば選択
      document.execCommand('insertText', false, text); // テキストを挿入

      // 少し待ってから送信（DOM更新を待つ）
      setTimeout(() => {
        sendBtn.click();
        console.log("[content.js] 送信ボタンをクリックしました");
      }, 100);
    } else {
      console.warn("[content.js] 入力欄または送信ボタンが見つかりません");
    }
  }
});
