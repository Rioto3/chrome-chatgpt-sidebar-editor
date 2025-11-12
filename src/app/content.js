chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'SEND_PROMPT') {
    const promptText = message.payload;
    const inputBox = document.querySelector('.ProseMirror#prompt-textarea, [contenteditable="true"][data-virtualkeyboard="true"]');

    if (!inputBox) {
      alert('❌ 入力欄が見つかりません。');
      return;
    }

    // 1️⃣ 入力欄をフォーカス
    inputBox.focus();

    // 2️⃣ ProseMirrorに文字を挿入（reactにイベント伝搬）
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

    // 🕒 3️⃣ React側の再描画を待つ（300〜500ms程度）
    await new Promise(r => setTimeout(r, 500));

    // 4️⃣ ボタンが出るまで最大3秒待機
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

    // 5️⃣ 出現後クリック
    try {
      const btn = await waitForSendButton();
      btn.click();
      console.log('✅ 送信ボタン検出＆クリック成功');
    } catch (err) {
      console.warn('⚠️ ボタン出現待ちタイムアウト', err);
    }
  }
});
