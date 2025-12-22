export const createHandleKeyDown = ({
  getPromptText,
  setPromptText,
  sendPrompt,
}) => {
  return (e) => {
    // ===== ⌘ + = → === =====
    if (e.metaKey && e.key === "=" && !e.shiftKey) {
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

    // ===== ⌘ + / → ■ =====
    if (e.metaKey && e.key === "/" && !e.shiftKey) {
      e.preventDefault();

      const current = getPromptText();
      const insert = "■ ";
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
