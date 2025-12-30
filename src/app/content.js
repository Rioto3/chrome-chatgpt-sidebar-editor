import { createKeyboardHandler } from '../utils/keyboardShortcuts.js';

// ===== ChatGPTのプロンプト入力欄にキーボードショートカットを適用 =====
const initKeyboardShortcuts = () => {
  const inputBox = document.querySelector('.ProseMirror#prompt-textarea, [contenteditable="true"][data-virtualkeyboard="true"]');
  
  if (!inputBox) {
    // 入力欄がまだ読み込まれていない場合は、少し待ってから再試行
    setTimeout(initKeyboardShortcuts, 1000);
    return;
  }

  // 既にハンドラが設定されている場合はスキップ
  if (inputBox.dataset.keyboardHandlerAttached) {
    return;
  }

  // ProseMirrorからテキストを取得
  const getText = () => {
    return inputBox.innerText || '';
  };

  // ProseMirrorにテキストを設定
  const setText = (text) => {
    inputBox.focus();
    
    // ProseMirrorに文字を挿入
    inputBox.dispatchEvent(new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: ' ',
    }));

    inputBox.innerHTML = `<p>${text}</p>`;
    inputBox.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: text,
    }));
  };

  // 送信処理
  const onSubmit = async (clearAfter) => {
    // 送信ボタンをクリック
    await new Promise(r => setTimeout(r, 300));
    
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

    try {
      const btn = await waitForSendButton();
      btn.click();
      console.log('✅ キーボードショートカット: 送信成功');
      
      if (clearAfter) {
        // 送信後にクリアする場合はストレージも削除
        chrome.storage.local.set({ 'chatgpt-prompt': '' });
      }
    } catch (err) {
      console.warn('⚠️ 送信ボタンが見つかりませんでした', err);
    }
  };

  // キーボードハンドラを作成
  const handler = createKeyboardHandler({
    getText,
    setText,
    onSubmit,
    storageKey: 'chatgpt-prompt',
  });

  // イベントリスナーを追加
  inputBox.addEventListener('keydown', handler);
  inputBox.dataset.keyboardHandlerAttached = 'true';
  
  console.log('✅ ChatGPTキーボードショートカット: 初期化完了');

  // ページ遷移時に再初期化
  const observer = new MutationObserver(() => {
    const currentInputBox = document.querySelector('.ProseMirror#prompt-textarea, [contenteditable="true"][data-virtualkeyboard="true"]');
    if (currentInputBox && !currentInputBox.dataset.keyboardHandlerAttached) {
      initKeyboardShortcuts();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
};

// ページ読み込み後に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initKeyboardShortcuts);
} else {
  initKeyboardShortcuts();
}

// ===== 既存のメッセージリスナー =====
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




chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_CURRENT_CHAT_TITLE") {
    try {
      const path = new URL(location.href).pathname;
      const links = document.querySelectorAll('#history a[href]');
      for (const a of links) {
        if (a.getAttribute('href') === path) {
          const title = a.querySelector('span[dir="auto"]');
          sendResponse({ title: title?.innerText || '新しいお気に入り' });
          return true; // keep the channel open
        }
      }
      sendResponse({ title: '新しいお気に入り' });
    } catch (e) {
      sendResponse({ title: '新しいお気に入り', error: e.message });
    }
    return true;
  }
});
