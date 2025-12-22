// background/sync.js
import { API } from "./api.js";
import { BookmarksStorageService } from "./storage/bookmarksStorageService.js";

export const Sync = {
  async syncToServer() {
    const bookmarks = await BookmarksStorageService.getBookmarks();

    console.log("🔼 Uploading local → server ...");

    // グループ
    const groups = Object.entries(bookmarks).map(([id, g]) => ({
      id,
      name: g.name,
    }));
    for (const g of groups) await API.createGroup(g);

    // アイテム
    for (const [groupId, g] of Object.entries(bookmarks)) {
      for (const item of g.items) {
        await API.createItem({ ...item, group_id: groupId });
      }
    }

    console.log("✅ Synced local → server");
    return true;
  },

  async syncFromServer() {
    console.log("🔽 Downloading server → local ...");

    const groups = await API.getGroups();
    const state = {};

    for (const g of groups) {
      state[g.id] = {
        name: g.name,
        items: g.items || [],
      };
    }

    await BookmarksStorageService.saveBookmarks(state);
    console.log("✅ Synced server → local");
    return state;
  },
};
