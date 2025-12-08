// src/app/backgtound/sync.js
const API_BASE = "https://ik1-402-33203.vs.sakura.ne.jp:3219/bookmarksState";

/**
 * 新しいフォルダ（bookmarksState配下のgroup）を追加
 */
export async function createGroup(group) {
  try {
    await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(group),
    });
    console.log("✅ group created:", group.name);
  } catch (err) {
    console.error("❌ createGroup failed:", err);
  }
}

/**
 * 既存グループの更新（リネーム・items変更）
 */
export async function updateGroup(groupId, updatedData) {
  try {
    await fetch(`${API_BASE}/${groupId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedData),
    });
    console.log("🔁 group updated:", groupId);
  } catch (err) {
    console.error("❌ updateGroup failed:", err);
  }
}

/**
 * グループ削除
 */
export async function deleteGroup(groupId) {
  try {
    await fetch(`${API_BASE}/${groupId}`, {
      method: "DELETE",
    });
    console.log("🗑 group deleted:", groupId);
  } catch (err) {
    console.error("❌ deleteGroup failed:", err);
  }
}



/** 🔁 サーバから状態を取得して chrome.storage.local に反映 */
export async function fetchServerState() {
  try {
    const res = await fetch(API_BASE);
    const data = await res.json();
    if (!Array.isArray(data)) return;

    const mapped = {};
    data.forEach((group) => {
      mapped[group.id] = { name: group.name, items: group.items || [] };
    });

    await chrome.storage.local.set({ bookmarksState: mapped });
    console.log("✅ サーバからローカルへ初期同期しました:", Object.keys(mapped).length, "件");
  } catch (err) {
    console.error("❌ サーバ同期失敗:", err);
  }
}