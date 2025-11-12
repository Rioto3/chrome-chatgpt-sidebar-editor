chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SEND_PROMPT') {
    const promptText = message.payload;

    // 現時点の DOM 構造を確認
    const inputBox = document.querySelector('.ProseMirror#prompt-textarea, [contenteditable="true"][data-virtualkeyboard="true"]');
    const sendButton = document.querySelector('#composer-submit-button, [data-testid="send-button"]');

    // 状況ログを alert で出す
    alert([
      `=== ChatGPT送信デバッグ ===`,
      `入力欄: ${inputBox ? '✅ 見つかった' : '❌ 見つからない'}`,
      `送信ボタン: ${sendButton ? '✅ 見つかった' : '❌ 見つからない'}`,
      `promptText: "${promptText}"`,
      `inputBox=${inputBox ? inputBox.outerHTML.slice(0, 200) + '…' : 'null'}`,
      `sendButton=${sendButton ? sendButton.outerHTML.slice(0, 200) + '…' : 'null'}`,
    ].join('\n'));

    if (!inputBox) {
      alert('❌ 入力欄が見つかりません。');
      return;
    }

    // 一応送信まで試す流れ（空文字ではボタンが出ない可能性あり）
    inputBox.focus();

    inputBox.dispatchEvent(new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: ' ',
    }));

    inputBox.innerHTML = `<p>${promptText}</p>`;
    inputBox.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: promptText,
    }));

    // ボタン待機
    const waitForSendButton = async (timeout = 3000) => {
      const start = Date.now();
      return new Promise((resolve, reject) => {
        const check = () => {
          const btn = document.querySelector('#composer-submit-button, [data-testid="send-button"]');
          if (btn) return resolve(btn);
          if (Date.now() - start > timeout) return reject(new Error('送信ボタンが出てこない'));
          requestAnimationFrame(check);
        };
        check();
      });
    };

    waitForSendButton()
      .then((btn) => {
        alert('✅ 送信ボタン検出！クリックします。');
        btn.click();
      })
      .catch((err) => {
        alert(`⚠️ 送信ボタン検出失敗: ${err.message}`);
      });
  }
});
