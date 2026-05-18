// ===== ブックマーク機能専用の初期化関数 =====
export function initBookmarkIntegration() {
  console.log('🔖 ブックマーク機能を初期化中...');
  
  initMessageListener();
  
  console.log('✅ ブックマーク機能の初期化完了');
}

// ===== メッセージリスナー（GET_CURRENT_CHAT_TITLEのみ） =====
function initMessageListener() {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_CURRENT_CHAT_TITLE') {
      handleGetChatTitle(sendResponse);
      return true; // 非同期レスポンスを有効化
    }
    
    return false;
  });
  
  console.log('✅ ブックマークメッセージリスナー: 登録完了');
}

// ===== GET_CURRENT_CHAT_TITLE処理 =====
function handleGetChatTitle(sendResponse) {
  try {
    const path = new URL(location.href).pathname;
    const links = document.querySelectorAll('#history a[href]');
    
    for (const a of links) {
      if (a.getAttribute('href') === path) {
        const title = a.querySelector('span[dir="auto"]');
        const titleText = title?.innerText || '新しいお気に入り';
        console.log('✅ チャットタイトル取得:', titleText);
        sendResponse({ title: titleText });
        return;
      }
    }
    
    console.log('ℹ️ チャットタイトル: デフォルト値を返却');
    sendResponse({ title: '新しいお気に入り' });
  } catch (e) {
    console.error('❌ チャットタイトル取得エラー:', e);
    sendResponse({ title: '新しいお気に入り', error: e.message });
  }
}