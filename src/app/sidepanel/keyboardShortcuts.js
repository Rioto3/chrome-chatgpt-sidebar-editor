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


    // ===== ⌘ + Enter 系 =====
    if (e.metaKey && e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) sendPrompt(false); // ⌘+Shift+Enter
      else sendPrompt(true);             // ⌘+Enter
    }
  };
};
