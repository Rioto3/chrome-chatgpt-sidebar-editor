// background.js

// サイドパネル自動オープン設定
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// client_idの保持
async function getClientId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['client_id'], (result) => {
      if (result.client_id) {
        resolve(result.client_id);
      } else {
        const newId = crypto.randomUUID();
        chrome.storage.local.set({ client_id: newId }, () => resolve(newId));
      }
    });
  });
}

// GA4にイベント送信
async function sendEvent(eventName, params = {}) {
  const measurementId = 'G-YNZPE36ZXG'; // GA4測定ID
  const apiSecret = 'BkLDWtufQ5CTPIcYtBz7wg';   // GA4 API Secret
  const clientId = await getClientId();

  const body = {
    client_id: clientId,
    events: [
      {
        name: eventName,
        params: params
      }
    ]
  };

  fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`, {
    method: 'POST',
    body: JSON.stringify(body)
  });
}

// サイドパネルアイコンクリック時のイベント送信
chrome.action.onClicked.addListener(async (tab) => {
  console.log('【DEBUG】Clicked SidePanel')
  await sendEvent('sidepanel_opened', { url: tab.url });
});


