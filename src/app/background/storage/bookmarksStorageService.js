// background/bookmarksStorageService.js

export const BookmarksStorageService = {
  ROOT_TAG_NAME: "ai-chat-editor-plus",

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
