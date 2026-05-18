import { createKeyboardHandler } from '../../../utils/keyboardShortcuts.js';

// ===== Claude専用の初期化関数（プロンプト送信とキーボードショートカット） =====
export function initClaudeIntegration() {
  console.log('🚀 Claude統合機能を初期化中...');
  
  initKeyboardShortcuts();
  initMessageListener();
  
  console.log('✅ Claude統合機能の初期化完了');
}

// ===== キーボードショートカット初期化 =====
function initKeyboardShortcuts() {
  const inputBox = document.querySelector('.tiptap.ProseMirror[contenteditable="true"][data-testid="chat-input"]');
  
  if (!inputBox) {
    setTimeout(initKeyboardShortcuts, 1000);
    return;
  }

  if (inputBox.dataset.keyboardHandlerAttached) {
    return;
  }

  const getText = () => inputBox.innerText || '';

  const setText = (text) => {
    inputBox.focus();
    
    // Claudeの入力欄に適したイベント発火
    inputBox.dispatchEvent(new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: text,
    }));

    // TipTapエディタの場合、innerHTMLを直接設定
    inputBox.innerHTML = `<p>${text}</p>`;
    
    inputBox.dispatchEvent(new InputEvent('input', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: text,
    }));
  };

  const onSubmit = async (clearAfter) => {
    await new Promise(r => setTimeout(r, 200));
    
    const waitForSendButton = async (timeout = 3000) => {
      const start = Date.now();
      return new Promise((resolve, reject) => {
        const check = () => {
          // Claudeの送信ボタンを探す（aria-labelで識別）
          const btn = document.querySelector('button[aria-label="メッセージを送信"]');
          if (btn && !btn.disabled) return resolve(btn);
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
        chrome.storage.local.set({ 'claude-prompt': '' });
      }
    } catch (err) {
      console.warn('⚠️ 送信ボタンが見つかりませんでした', err);
    }
  };

  const handler = createKeyboardHandler({
    getText,
    setText,
    onSubmit,
    storageKey: 'claude-prompt',
  });

  inputBox.addEventListener('keydown', handler);
  inputBox.dataset.keyboardHandlerAttached = 'true';
  
  console.log('✅ Claudeキーボードショートカット: 初期化完了');

  // ページ遷移時に再初期化
  const observer = new MutationObserver(() => {
    const currentInputBox = document.querySelector('.tiptap.ProseMirror[contenteditable="true"][data-testid="chat-input"]');
    if (currentInputBox && !currentInputBox.dataset.keyboardHandlerAttached) {
      initKeyboardShortcuts();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// ===== メッセージリスナー（SEND_PROMPTのみ） =====
function initMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SEND_PROMPT') {
      handleSendPrompt(message.payload, sendResponse);
      return true; // 非同期レスポンスを有効化
    }
    
    return false;
  });
  
  console.log('✅ Claudeメッセージリスナー: 登録完了');
}

// ===== SEND_PROMPT処理 =====
async function handleSendPrompt(promptText, sendResponse) {
  console.log('📥 SEND_PROMPT受信:', promptText);

  const inputBox = document.querySelector('.tiptap.ProseMirror[contenteditable="true"][data-testid="chat-input"]');
  
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
    data: promptText,
  }));

  inputBox.innerHTML = `<p>${promptText}</p>`;
  
  inputBox.dispatchEvent(new InputEvent('input', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertText',
    data: promptText,
  }));

  console.log('✅ テキスト設定完了');

  // 送信ボタンを待って送信
  setTimeout(async () => {
    const waitForSendButton = (timeout = 3000) => {
      const start = Date.now();
      return new Promise((resolve, reject) => {
        const check = () => {
          const btn = document.querySelector('button[aria-label="メッセージを送信"]');
          if (btn && !btn.disabled) {
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
  }, 300);
}