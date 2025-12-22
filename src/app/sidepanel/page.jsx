// src/app/sidepanel/page.jsx
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { createHandleKeyDown } from "./keyboardShortcuts";



const API_SYNC = true;

const SidepanelAsPage = () => {
  const [folders, setFolders] = useState({});
  const [currentFolder, setCurrentFolder] = useState("default");
  const [promptText, setPromptText] = useState("");
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  const [textareaHeight, setTextareaHeight] = useState(150); // px単位

  // ===== テキストエリアのリサイズ用エフェクト =====
  useEffect(() => {
    let startY = 0;
    let startHeight = 0;
    let isDragging = false;

    const onMouseDown = (e) => {
      isDragging = true;
      startY = e.clientY;
      startHeight = textareaHeight;
      document.body.style.cursor = "ns-resize";
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dy = startY - e.clientY;
      const newHeight = Math.min(Math.max(startHeight + dy, 80), 500); // 80〜500px
      setTextareaHeight(newHeight);
    };

    const onMouseUp = () => {
      isDragging = false;
      document.body.style.cursor = "default";
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    const grip = document.getElementById("resize-grip");
    if (grip) grip.addEventListener("mousedown", onMouseDown);

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      if (grip) grip.removeEventListener("mousedown", onMouseDown);
    };
  }, [textareaHeight]);


  // ===== 初期化 =====
useEffect(() => {
  chrome.runtime.sendMessage({ type: "BOOKMARKS_INIT" }, (response) => {
    if (response?.ok) {
      setFolders(response.data);
    } else {
      console.error("❌ 初期化エラー:", response?.error);
    }
  });
}, []);



const saveState = (newFolders) => {
  setFolders(newFolders);
  chrome.storage.local.set({ bookmarksState: newFolders });
};


const addFolder = () => {
  setTimeout(() => {
    const name = prompt("新しいフォルダ名を入力してください");
    if (!name) return;
    const id = Date.now().toString();
    const newFolders = { ...folders, [id]: { name, items: [] } };
    saveState(newFolders);
    setCurrentFolder(id);

    // ✅ フォルダ作成時のサーバ同期
    if (API_SYNC) {
      chrome.runtime.sendMessage({
        type: "GROUP_CREATE",
        payload: { id, name },
      });
    }
  }, 10);
};



const renameFolder = () => {
  const folder = folders[currentFolder];
  if (!folder) return;
  setTimeout(() => {
    if (!confirm(`フォルダ「${folder.name}」をリネームしますか？`)) return;
    const newName = prompt("新しいフォルダ名を入力してください", folder.name);
    if (!newName) return;
    const updated = { ...folders, [currentFolder]: { ...folder, name: newName } };
    saveState(updated);

    // 🔥 フォルダ名変更時のサーバ同期を追加
    if (API_SYNC) {
      chrome.runtime.sendMessage({
        type: "GROUP_UPDATE",
        payload: { id: currentFolder, data: { name: newName } },
      });
    }
  }, 10);
};



  const deleteFolder = () => {
    const folder = folders[currentFolder];
    if (!folder) return;
    setTimeout(() => {
      if (!confirm(`フォルダ「${folder.name}」を削除しますか？\n中のブックマークも消えます。`)) return;
      const newFolders = { ...folders };
      delete newFolders[currentFolder];
      const fallback = Object.keys(newFolders)[0] || "default";
      setCurrentFolder(fallback);
      saveState(newFolders);

      // 🗑 サーバにも削除通知
      if (API_SYNC) {
        chrome.runtime.sendMessage({
          type: "SYNC_DELETE",
          payload: { id: currentFolder },
        });
      }
    }, 10);
  };





  // ===== ブックマーク操作 =====
  const addBookmark = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.url) return;
      const url = tab.url;
      const title = tab.title || "新しいページ";

      const newItem = { id: Date.now().toString(), name: title, url };
      const updated = {
        ...folders,
        [currentFolder]: {
          ...folders[currentFolder],
          items: [...folders[currentFolder].items, newItem],
        },
      };
      saveState(updated);


      // ✅ アイテム作成時のサーバ同期
      if (API_SYNC) {
        chrome.runtime.sendMessage({
          type: "ITEM_CREATE",
          payload: {
            groupId: currentFolder,
            item: newItem,
          },
        });
      }
    });
  };

  const startEditing = (id, name) => {
    setEditingBookmark(id);
    setEditingValue(name);
  };

  const commitEditing = (folderId) => {
    if (!editingBookmark) return;
    const updatedFolder = { ...folders[folderId] };
    const idx = updatedFolder.items.findIndex((b) => b.id === editingBookmark);
    if (idx !== -1) {
      updatedFolder.items[idx].name =
        editingValue.trim() || updatedFolder.items[idx].name;
      const newFolders = { ...folders, [folderId]: updatedFolder };
      saveState(newFolders);
    }

    // ✅ アイテム名変更時のサーバ同期
    if (API_SYNC) {
      chrome.runtime.sendMessage({
        type: "ITEM_UPDATE",
        payload: {
          itemId: editingBookmark,
          data: { name: editingValue.trim() },
        },
      });
    }
    setEditingBookmark(null);
    setEditingValue("");
  };

  const cancelEditing = () => {
    setEditingBookmark(null);
    setEditingValue("");
  };

  const deleteBookmark = (folderId, index) => {
    const folder = folders[folderId];
    const item = folder.items[index];
    const updatedItems = folder.items.filter((_, i) => i !== index);
    const newFolders = {
      ...folders,
      [folderId]: { ...folder, items: updatedItems },
    };
    saveState(newFolders);

    // ✅ アイテム削除時のサーバ同期
    if (API_SYNC) {
      chrome.runtime.sendMessage({
        type: "ITEM_DELETE",
        payload: { itemId: item.id },
      });
    }
  };

  // ===== 並び替え =====
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      const folder = folders[source.droppableId];
      const reordered = Array.from(folder.items);
      const [moved] = reordered.splice(source.index, 1);
      reordered.splice(destination.index, 0, moved);
      const newFolders = {
        ...folders,
        [source.droppableId]: { ...folder, items: reordered },
      };
      saveState(newFolders);
    }
  };

  // ===== Chat送信 =====
  const sendPrompt = (clearAfter = false) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return;
      chrome.tabs.sendMessage(tab.id, {
        type: "SEND_PROMPT",
        payload: promptText,
      });
      if (clearAfter) {
        setPromptText("");
        chrome.storage.local.set({ prompt: "" });
      }
    });
  };

  const handlePromptChange = (e) => {
    const value = e.target.value;
    setPromptText(value);
    chrome.storage.local.set({ prompt: value });
  };

  // ===== キーボードショートカット =====
// const handleKeyDown = (e) => {
//   // ⌘ + =
//   if (e.metaKey && e.key === "=" && !e.shiftKey) {
//     e.preventDefault();

//     const insert = "===\n";
//     const newText = promptText.endsWith("\n")
//       ? promptText + insert
//       : promptText + "\n" + insert;

//     setPromptText(newText);
//     chrome.storage.local.set({ prompt: newText });
//     return;
//   }

//   // ⌘ + Enter 系（既存）
//   if (e.metaKey && e.key === "Enter") {
//     e.preventDefault();
//     if (e.shiftKey) sendPrompt(false); // ⌘+Shift+Enter
//     else sendPrompt(true);             // ⌘+Enter
//   }
// };

const handleKeyDown = createHandleKeyDown({
  getPromptText: () => promptText,
  setPromptText,
  sendPrompt,
});


  // ===== UI =====
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: "sans-serif",
      }}
    >
    

      {/* 上部：お気に入り */}
      <div
        style={{
          flex: "1 1 auto",
          overflowY: "auto",
          padding: "0.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            marginBottom: "0.5rem",
          }}
        >
          <select
            value={currentFolder in folders ? currentFolder : "default"}
            onChange={(e) => setCurrentFolder(e.target.value)}
            style={{ flex: 1 }}
          >
            {Object.entries(folders).map(([id, folder]) => (
              <option key={id} value={id}>
                {folder.name}
              </option>
            ))}
          </select>
          <button onClick={addFolder}>📁</button>
          <button onClick={renameFolder}>✏️</button>
          <button onClick={deleteFolder}>🗑</button>
          <button onClick={addBookmark}>➕</button>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={currentFolder}>
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {folders[currentFolder]?.items.map((bm, index) => (
                  <Draggable key={bm.id} draggableId={bm.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                          userSelect: "none",
                          padding: "6px",
                          marginBottom: "4px",
                          borderRadius: "5px",
                          background: "#f4f4f4",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          ...provided.draggableProps.style,
                        }}
                      >
                        {editingBookmark === bm.id ? (
                          <input
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => commitEditing(currentFolder)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                commitEditing(currentFolder);
                              if (e.key === "Escape") cancelEditing();
                            }}
                            autoFocus
                            style={{
                              flexGrow: 1,
                              fontSize: "13px",
                              padding: "2px 4px",
                            }}
                          />
                        ) : (
                          <a
                            href={bm.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              textDecoration: "none",
                              color: "#007bff",
                              flexGrow: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {bm.name}
                          </a>
                        )}

                        <button onClick={() => startEditing(bm.id, bm.name)}>✏️</button>
                        <button onClick={() => deleteBookmark(currentFolder, index)}>🗑</button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>






      {/* 下部：チャット入力（ドラッグで高さ調整可能） */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "#fafafa",
          padding: "0.5rem",
          boxShadow: "0 -2px 4px rgba(0,0,0,0.05)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
          }}
        >

          {/* ⬆ ドラッグ用のリサイズグリップ */}
          <div
            id="resize-grip"
            onMouseDown={(e) => {
              e.preventDefault();
              const startY = e.clientY;
              const startHeight = textareaHeight;

              const handleMouseMove = (moveEvent) => {
                const deltaY = startY - moveEvent.clientY; // 上に動かすと+、下に動かすと-
                const newHeight = Math.max(60, Math.min(400, startHeight + deltaY));
                setTextareaHeight(newHeight);
              };

              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
                document.body.style.userSelect = ''; // テキスト選択を復元
              };

              document.body.style.userSelect = 'none'; // ドラッグ中のテキスト選択を防止
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
            style={{
              position: "relative",
              height: "8px", // 判定領域を広めに
              cursor: "ns-resize",
              marginBottom: "4px",
              userSelect: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="ドラッグして入力欄の高さを調整"
          >
            {/* 見た目のバー */}
            <div
              style={{
                height: "6px",
                width: "40%",
                borderRadius: "3px",
                background:
                  "linear-gradient(to right, #ccc 40%, transparent 40%, transparent 60%, #ccc 60%)",
                backgroundSize: "20px 6px",
                pointerEvents: "none", // これは残してOK
              }}
            />
          </div>

          {/* テキストエリア */}
          <textarea
            style={{
              width: "100%",
              height: `${textareaHeight}px`,
              fontSize: "16px",
              fontFamily: "monospace",
              resize: "none",
              padding: "6px",
              boxSizing: "border-box",
            }}
            value={promptText}
            onChange={handlePromptChange}
            onKeyDown={handleKeyDown}
            placeholder="⌘+Enterで送信、⌘+Shift+Enterで送信して消す"
          />
        </div>

        {/* ボタン行 */}
        <div
          style={{
            display: "flex",
            gap: "0.4rem",
            marginTop: "0.4rem",
            flexShrink: 0,
          }}
        >
            <button
    onClick={() => {
      setPromptText((prev) => prev + (prev.endsWith("\n") ? "■ " : "\n■ "));
      chrome.storage.local.set({
        prompt: promptText + (promptText.endsWith("\n") ? "■ " : "\n■ "),
      });
    }}
    title="箇条書きを追加"
    style={{
      flex: "0 0 auto",
      padding: "4px 6px",
      fontSize: "14px",
      background: "#f3f4f6",
      border: "1px solid #ccc",
      borderRadius: "4px",
      cursor: "pointer",
    }}
  >
    ■
  </button>


  {/* 🧱 区切りボタン */}
  <button
    onClick={() => {
      const newText = promptText.endsWith("\n")
        ? promptText + "===\n"
        : promptText + "\n===\n";
      setPromptText(newText);
      chrome.storage.local.set({ prompt: newText });
    }}
    title="区切りを追加"
    style={{
      flex: "0 0 auto",
      padding: "4px 6px",
      fontSize: "14px",
      background: "#f3f4f6",
      border: "1px solid #ccc",
      borderRadius: "4px",
      cursor: "pointer",
    }}
  >
    ＝
  </button>


          <button style={{ flex: 1 }} onClick={() => sendPrompt(false)}>
            ✈️ 送信
          </button>
          <button style={{ flex: 1 }} onClick={() => sendPrompt(true)}>
            ✈️ 送信して消す
          </button>
        </div>
      </div>












    </div>
  );
};

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("root");
  if (container) {
    const root = createRoot(container);
    root.render(<SidepanelAsPage />);
  }
});

export default SidepanelAsPage;