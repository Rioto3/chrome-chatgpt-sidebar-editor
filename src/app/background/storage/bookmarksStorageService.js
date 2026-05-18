// background/bookmarksStorageService.js

export const BookmarksStorageService = {
  ROOT_TAG_NAME: "ai-chat-editor-plus",


  /**
   * 初期データを生成（最初の1回だけ）
   */
  async initialize() {
    const data = await chrome.storage.local.get(this.ROOT_TAG_NAME);
    if (!data[this.ROOT_TAG_NAME]) {
      const base = {
        default: {
          name: "☆お気に入り",
          items: [],
        },
      };
      await chrome.storage.local.set({ [this.ROOT_TAG_NAME]: base });
      console.log("📦 初期ブックマークを生成しました");
      return base;
    }
    console.log("✅ 既存ブックマークデータを検出");
    return data[this.ROOT_TAG_NAME];
  },
  
  async getBookmarks() {
    const data = await chrome.storage.local.get(this.ROOT_TAG_NAME);
    return data[this.ROOT_TAG_NAME] || {};
  },

  async saveBookmarks(state) {
    await chrome.storage.local.set({ [this.ROOT_TAG_NAME]: state });
  },

  async clear() {
    await chrome.storage.local.remove(this.ROOT_TAG_NAME);
  },
};
