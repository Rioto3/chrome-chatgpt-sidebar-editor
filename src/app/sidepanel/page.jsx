import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const SidepanelAsPage = () => {
  const [folders, setFolders] = useState({});
  const [currentFolder, setCurrentFolder] = useState("default");
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("bookmarksState");
    if (stored) {
      setFolders(JSON.parse(stored));
    } else {
      setFolders({ default: { name: "お気に入り", items: [] } });
    }

    const storedPrompt = localStorage.getItem("prompt");
    if (storedPrompt) setPrompt(storedPrompt);
  }, []);

  const saveState = (newFolders) => {
    setFolders(newFolders);
    localStorage.setItem("bookmarksState", JSON.stringify(newFolders));
  };

  const addFolder = () => {
    const name = prompt("フォルダ名を入力してください");
    if (!name) return;
    const id = Date.now().toString();
    const newFolders = { ...folders, [id]: { name, items: [] } };
    saveState(newFolders);
  };

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
    });
  };

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
    } else {
      const srcFolder = folders[source.droppableId];
      const dstFolder = folders[destination.droppableId];
      const srcItems = Array.from(srcFolder.items);
      const dstItems = Array.from(dstFolder.items);
      const [moved] = srcItems.splice(source.index, 1);
      dstItems.splice(destination.index, 0, moved);
      const newFolders = {
        ...folders,
        [source.droppableId]: { ...srcFolder, items: srcItems },
        [destination.droppableId]: { ...dstFolder, items: dstItems },
      };
      saveState(newFolders);
    }
  };

  const deleteBookmark = (folderId, index) => {
    const folder = folders[folderId];
    const updatedItems = folder.items.filter((_, i) => i !== index);
    const newFolders = {
      ...folders,
      [folderId]: { ...folder, items: updatedItems },
    };
    saveState(newFolders);
  };

  const handlePromptChange = (e) => {
    const value = e.target.value;
    setPrompt(value);
    localStorage.setItem("prompt", value);
  };

  const handleSend = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) return;
      chrome.tabs.sendMessage(tab.id, { type: "SEND_PROMPT", payload: prompt });
    });
  };

  const handleSendAndClear = () => {
    handleSend();
    setPrompt("");
    localStorage.setItem("prompt", "");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden", // ✅ 全体スクロール禁止
        fontFamily: "sans-serif",
      }}
    >
      {/* 上段: お気に入りセクション（60%） */}
      <div
        style={{
          flex: "6 1 0%",
          overflowY: "auto", // ✅ 上段のみスクロール
          borderBottom: "1px solid #ccc",
          padding: "0.5rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <select
            value={currentFolder}
            onChange={(e) => setCurrentFolder(e.target.value)}
            style={{ flex: 1, marginRight: 8 }}
          >
            {Object.entries(folders).map(([id, folder]) => (
              <option key={id} value={id}>
                {folder.name}
              </option>
            ))}
          </select>
          <button onClick={addFolder}>📁</button>
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
                        <button
                          onClick={() => deleteBookmark(currentFolder, index)}
                          style={{ marginLeft: 4 }}
                        >
                          🗑
                        </button>
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

      {/* 下段: チャットセクション（40%） */}
      <div
        style={{
          flex: "4 1 0%",
          display: "flex",
          flexDirection: "column",
          padding: "0.5rem",
          background: "#fafafa",
        }}
      >
        <textarea
          style={{
            flexGrow: 1,
            width: "100%",
            resize: "none",
            fontSize: "13px",
            fontFamily: "monospace",
            marginBottom: "0.5rem",
          }}
          value={prompt}
          onChange={handlePromptChange}
          placeholder="プロンプトを入力..."
        />
        <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
          <button style={{ flex: 1 }} onClick={handleSend}>
            ✈️ 送信
          </button>
          <button style={{ flex: 1 }} onClick={handleSendAndClear}>
            🧹 クリア
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
