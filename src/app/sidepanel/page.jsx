import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const SidepanelAsPage = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    const storedBookmarks = localStorage.getItem('bookmarks');
    if (storedBookmarks) setBookmarks(JSON.parse(storedBookmarks));

    const storedPrompt = localStorage.getItem('prompt');
    if (storedPrompt) setPrompt(storedPrompt);
  }, []);

  const handlePromptChange = (e) => {
    const value = e.target.value;
    setPrompt(value);
    localStorage.setItem('prompt', value);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
  };

  const sendToChatGPT = (text) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0].id;

      chrome.scripting.executeScript({
        target: { tabId },
        func: (text) => {
          const inputDiv = document.querySelector('#prompt-textarea');
          if (!inputDiv) return alert('ChatGPTの入力欄が見つかりません');

          inputDiv.focus();
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, text);

          setTimeout(() => {
            const sendBtn = document.querySelector('#composer-submit-button');
            if (sendBtn) {
              sendBtn.click();
            } else {
              alert('送信ボタンが見つかりません');
            }
          }, 100);
        },
        args: [text],
      });
    });
  };

const handleSend = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab?.id) return;

    chrome.tabs.sendMessage(tab.id, {
      type: "SEND_PROMPT",
      payload: prompt,
    });
  });
};



  const handleSendAndClear = () => {
    sendToChatGPT(prompt);
    setPrompt('');
    localStorage.setItem('prompt', '');
  };

const addCurrentChat = () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    const url = tab?.url || 'unknown';
    const tabId = tab?.id;

    chrome.scripting.executeScript(
      {
        target: { tabId },
        func: (currentUrl) => {
          try {
            const path = new URL(currentUrl).pathname;
            const historyLinks = document.querySelectorAll('#history a[href]');
            for (const a of historyLinks) {
              if (a.getAttribute('href') === path) {
                const title = a.querySelector('span[dir="auto"]');
                return title?.innerText || null;
              }
            }
            return null;
          } catch (err) {
            return null;
          }
        },
        args: [url],
      },
      (results) => {
        const title = results?.[0]?.result || '新しいお気に入り';
        const newEntry = { name: title, url };
        const updated = [...bookmarks, newEntry];
        setBookmarks(updated);
        localStorage.setItem('bookmarks', JSON.stringify(updated));
      }
    );
  });
};

  const renameBookmark = (index) => {
    const newName = prompt('新しい名前を入力してください');
    if (newName) {
      const updated = [...bookmarks];
      updated[index].name = newName;
      setBookmarks(updated);
      localStorage.setItem('bookmarks', JSON.stringify(updated));
    }
  };

  const deleteBookmark = (index) => {
    const updated = bookmarks.filter((_, i) => i !== index);
    setBookmarks(updated);
    localStorage.setItem('bookmarks', JSON.stringify(updated));
  };

  return (
    <div style={{ padding: '1rem', width: '320px', fontFamily: 'sans-serif' }}>
      <h2>📌 お気に入り</h2>
      <button onClick={addCurrentChat}>+ 今のチャットを追加</button>
      <div style={{ marginTop: '0.5rem' }}>
        {bookmarks.map((bm, idx) => (
          <div key={idx} style={{ marginBottom: '0.5rem' }}>
            <a
              href={bm.url}
              target="_blank"
              rel="noreferrer"
              style={{ marginRight: '0.5rem', color: '#007bff', textDecoration: 'none' }}
            >
              {bm.name}
            </a>
            <button onClick={() => renameBookmark(idx)}>✏️</button>
            <button onClick={() => deleteBookmark(idx)}>🗑</button>
          </div>
        ))}
      </div>

      <hr style={{ margin: '1rem 0' }} />

      <h3>✏️ プロンプトエディタ</h3>
      <textarea
        style={{ width: '100%', height: '150px', resize: 'vertical' }}
        value={prompt}
        onChange={handlePromptChange}
        placeholder="プロンプトをここに書いて保存できます"
      />
      <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <button onClick={handleCopy}>📋 コピー</button>
        <button onClick={handleSend}>✈️ 送信</button>
        <button onClick={handleSendAndClear}>🧹 送信してクリア</button>
      </div>
    </div>
  );
};

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(<SidepanelAsPage />);
  }
});

export default SidepanelAsPage;
