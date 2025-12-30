// src/utils/keyboardShortcuts.js
// 汎用的なキーボードショートカット処理

/**
 * 全角数字の定義
 */
const ZENKAKU_NUMS = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"];

/**
 * 数値を全角数字に変換
 * @param {number} num - 変換する数値
 * @returns {string} 全角数字の文字列
 */
const toZenkakuNumber = (num) =>
  String(num)
    .split("")
    .map((d) => ZENKAKU_NUMS[d])
    .join("");

/**
 * テキストから次の全角連番を取得
 * @param {string} text - 検索対象のテキスト
 * @returns {string} 次の連番（例: "１） ", "２） "）
 */
const getNextNumberedBullet = (text) => {
  const lines = text.split("\n").reverse();

  for (const line of lines) {
    const match = line.match(/^([０-９]+）)/);
    if (match) {
      const current = match[1].slice(0, -1); // ）を除く
      const num =
        parseInt(
          current
            .split("")
            .map((c) => ZENKAKU_NUMS.indexOf(c))
            .join(""),
          10
        ) + 1;
      return `${toZenkakuNumber(num)}） `;
    }
  }

  return "１） ";
};

/**
 * カーソル位置の行の範囲を取得
 * @param {string} text - テキスト全体
 * @param {number} cursorPos - カーソル位置
 * @returns {{start: number, end: number}} 行の開始位置と終了位置
 */
const getCurrentLineRange = (text, cursorPos) => {
  const start = text.lastIndexOf("\n", cursorPos - 1) + 1;
  const endIdx = text.indexOf("\n", cursorPos);
  const end = endIdx === -1 ? text.length : endIdx;
  return { start, end };
};

/**
 * 行のHTMLコメントをトグル
 * @param {string} text - テキスト全体
 * @param {number} cursorPos - カーソル位置
 * @returns {string} コメントをトグルした後のテキスト
 */
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
  return text.slice(0, start) + `<%Comment-- ${trimmed} -->` + text.slice(end);
};

/**
 * 汎用的なキーボードショートカットハンドラを作成
 * @param {Object} config - 設定オブジェクト
 * @param {Function} config.getText - 現在のテキストを取得する関数
 * @param {Function} config.setText - テキストを設定する関数
 * @param {Function} config.onSubmit - 送信処理を実行する関数 (clearAfter: boolean) => void
 * @param {string} [config.storageKey] - オプション: chrome.storage.localに保存するキー名
 * @returns {Function} keydownイベントハンドラ
 */
export const createKeyboardHandler = ({ getText, setText, onSubmit, storageKey = null }) => {
  return (e) => {
    // ===== Enter単体を無効化（改行のみ） =====
    if (e.key === "Enter" && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
      // デフォルトの送信動作を防止（改行は許可）
      // ※ textareaやcontenteditable要素では改行は自動で挿入される
      return;
    }

    // ===== Ctrl + = → 区切り線挿入 =====
    if (e.ctrlKey && e.key === "=" && !e.shiftKey) {
      e.preventDefault();

      const current = getText();
      const insert = "===\n";
      const next = current.endsWith("\n") ? current + insert : current + "\n" + insert;

      setText(next);
      if (storageKey) {
        chrome.storage.local.set({ [storageKey]: next });
      }
      return;
    }

    // ===== Ctrl + - → 全角連番挿入 =====
    if (e.ctrlKey && e.key === "-" && !e.shiftKey) {
      e.preventDefault();

      const current = getText();
      const insert = getNextNumberedBullet(current);
      const next = current.endsWith("\n") ? current + insert : current + "\n" + insert;

      setText(next);
      if (storageKey) {
        chrome.storage.local.set({ [storageKey]: next });
      }
      return;
    }

    // ===== Ctrl + / → コメントアウト（HTMLスタイル） =====
    if (e.ctrlKey && e.key === "/" && !e.shiftKey) {
      e.preventDefault();

      const textarea = e.target;
      const cursorPos = textarea.selectionStart;
      const current = getText();

      const next = toggleHtmlCommentOnLine(current, cursorPos);

      setText(next);
      if (storageKey) {
        chrome.storage.local.set({ [storageKey]: next });
      }
      return;
    }

    // ===== ⌘ + Enter / Ctrl + Enter → 送信 =====
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        onSubmit(false); // ⌘+Shift+Enter or Ctrl+Shift+Enter
      } else {
        onSubmit(true); // ⌘+Enter or Ctrl+Enter
      }
    }
  };
};
