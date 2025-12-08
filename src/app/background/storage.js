// background/storage.js
export const Storage = {
  async getBookmarks() {
    const data = await chrome.storage.local.get("bookmarksState");
    return data.bookmarksState || {};
  },

  async saveBookmarks(state) {
    await chrome.storage.local.set({ bookmarksState: state });
  },

  async clear() {
    await chrome.storage.local.remove("bookmarksState");
  },
};
