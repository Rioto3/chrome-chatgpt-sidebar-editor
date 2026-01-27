import { createKeyboardHandler } from '../../utils/keyboardShortcuts.js';

// ===== ChatGPTのプロンプト入力欄にキーボードショートカットを適用 =====
const initKeyboardShortcuts = () => {
  const inputBox = document.querySelector('.ProseMirror#prompt-textarea, [contenteditable="true"][data-virtualkeyboard="true"]');
  
  if (!inputBox) {
    setTimeout(initKeyboardShortcuts, 1000);
    return;
  }

  if (inputBox.dataset.keyboardHandlerAttached) {
    return;
  }

  const getText = () => {
    return inputBox.innerText || '';
  };

  const setText = (text) => {
    inputBox.focus();
    
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

  const onSubmit = async (clearAfter) => {
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
        chrome.storage.local.set({ 'chatgpt-prompt': '' });
      }
    } catch (err) {
      console.warn('⚠️ 送信ボタンが見つかりませんでした', err);
    }
  };

  const handler = createKeyboardHandler({
    getText,
    setText,
    onSubmit,
    storageKey: 'chatgpt-prompt',
  });

  inputBox.addEventListener('keydown', handler);
  inputBox.dataset.keyboardHandlerAttached = 'true';
  
  console.log('✅ ChatGPTキーボードショートカット: 初期化完了');

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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initKeyboardShortcuts);
} else {
  initKeyboardShortcuts();
}

// ===== サイドパネルからのメッセージを受け取る（新規実装） =====
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== 'SEND_PROMPT') return;

  console.log('📥 SEND_PROMPT受信:', message.payload);

  // 入力欄を探す
  const inputBox = document.querySelector('.ProseMirror#prompt-textarea, [contenteditable="true"][data-virtualkeyboard="true"]');
  
  if (!inputBox) {
    console.error('❌ 入力欄が見つかりません');
    sendResponse({ success: false, error: '入力欄が見つかりません' });
    return;
  }

  // テキストを設定
  inputBox.focus();
  
  inputBox.dispatchEvent(new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText',
    data: ' ',
  }));

  inputBox.innerHTML = `<p>${message.payload}</p>`;
  
  inputBox.dispatchEvent(new InputEvent('input', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText',
    data: message.payload,
  }));

  console.log('✅ テキスト設定完了');

  // 少し待ってから送信ボタンを探す
  setTimeout(async () => {
    const waitForSendButton = (timeout = 3000) => {
      const start = Date.now();
      return new Promise((resolve, reject) => {
        const check = () => {
          const btn = document.querySelector('#composer-submit-button, [data-testid="send-button"]');
          if (btn) {
            console.log('✅ 送信ボタン発見');
            return resolve(btn);
          }
          if (Date.now() - start > timeout) {
            return reject(new Error('送信ボタンタイムアウト'));
          }
          requestAnimationFrame(check);
        };
        check();
      });
    };

    try {
      const btn = await waitForSendButton();
      btn.click();
      console.log('✅ 送信ボタンクリック成功');
      sendResponse({ success: true });
    } catch (err) {
      console.error('❌ 送信ボタンエラー:', err);
      sendResponse({ success: false, error: err.message });
    }
  }, 500);

  return true; // 非同期レスポンスを有効化
});

// ===== チャットタイトル取得 =====
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_CURRENT_CHAT_TITLE") {
    try {
      const path = new URL(location.href).pathname;
      const links = document.querySelectorAll('#history a[href]');
      for (const a of links) {
        if (a.getAttribute('href') === path) {
          const title = a.querySelector('span[dir="auto"]');
          sendResponse({ title: title?.innerText || '新しいお気に入り' });
          return true;
        }
      }
      sendResponse({ title: '新しいお気に入り' });
    } catch (e) {
      sendResponse({ title: '新しいお気に入り', error: e.message });
    }
    return true;
  }
});