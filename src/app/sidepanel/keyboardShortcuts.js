// src/app/sidepanel/keyboardShortcuts.js
// https://chatgpt.com/c/69496897-8a24-8321-b102-004c4b388328
const ZENKAKU_NUMS = ["０","１","２","３","４","５","６","７","８","９"];

const toZenkakuNumber = (num) =>
  String(num).split("").map(d => ZENKAKU_NUMS[d]).join("");

const getNextNumberedBullet = (text) => {
  const lines = text.split("\n").reverse();

  for (const line of lines) {
    const match = line.match(/^([０-９]+）)/);
    if (match) {
      const current = match[1].slice(0, -1); // ）を除く
      const num =
        parseInt(
          current.split("").map(c => ZENKAKU_NUMS.indexOf(c)).join(""),
          10
        ) + 1;
      return `${toZenkakuNumber(num)}） `;
    }
  }

  return "１） ";
};



export const createHandleKeyDown = ({
  getPromptText,
  setPromptText,
  sendPrompt,
}) => {
  return (e) => {


    const getCurrentLineRange = (text, cursorPos) => {
  const start = text.lastIndexOf("\n", cursorPos - 1) + 1;
  const endIdx = text.indexOf("\n", cursorPos);
  const end = endIdx === -1 ? text.length : endIdx;
  return { start, end };
};

const toggleHtmlCommentOnLine = (text, cursorPos) => {
  const { start, end } = getCurrentLineRange(text, cursorPos);
  const line = text.slice(start, end);

  const trimmed = line.trim();

  // すでにコメントアウトされている場合 → 外す
  if (trimmed.startsWith("<%Comment--") && trimmed.endsWith("-->")) {
    const uncommented = trimmed
      .replace(/^<%Comment--\s?/, "")
      .replace(/\s?-->$/, "");
    return text.slice(0, start) + uncommented + text.slice(end);
  }

  // コメントを付ける
  return (
    text.slice(0, start) +
    `<%Comment-- ${trimmed} -->` +
    text.slice(end)
  );
};



// ===== ctrl + - → 全角連番 =====
if (e.ctrlKey && e.key === "=" && !e.shiftKey) {
      e.preventDefault();

      const current = getPromptText();
      const insert = "===\n";
      const next = current.endsWith("\n")
        ? current + insert
        : current + "\n" + insert;

      setPromptText(next);
      chrome.storage.local.set({ prompt: next });
      return;
    }


// ===== ctrl + - → 全角連番 =====
if (e.ctrlKey && e.key === "-" && !e.shiftKey) {
  e.preventDefault();

  const current = getPromptText();
  const insert = getNextNumberedBullet(current);
  const next = current.endsWith("\n")
    ? current + insert
    : current + "\n" + insert;

  setPromptText(next);
  chrome.storage.local.set({ prompt: next });
  return;
}


    // ===== Ctrl + / → コメントアウト（md/html） =====
    if (e.key === "/" && !e.shiftKey) {
      e.preventDefault();

      const textarea = e.target;
      const cursorPos = textarea.selectionStart;
      const current = getPromptText();

      const next = toggleHtmlCommentOnLine(current, cursorPos);

      setPromptText(next);
      chrome.storage.local.set({ prompt: next });
      return;
    }

    
    // ===== ⌘ + Enter 系 =====
    if (e.metaKey && e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) sendPrompt(false); // ⌘+Shift+Enter
      else sendPrompt(true);             // ⌘+Enter
    }
  };
};
