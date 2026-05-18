// background/api.js

const BASE_URL = "https://v1.api.tubeclip.win/api/v1/ai-chat-editor-plus";

export const API = {
  /**
   * 共通HTTPラッパー
   */
  async request(path, method = "GET", body = null) {
    const url = `${BASE_URL}${path}`;
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(url, options);
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errText}`);
    }
    return await res.json();
  },

  /**
   * 📥 最新スナップショット取得
   * GET /users/{user_id}/latest
   */
  async getLatestSnapshot(userId) {
    return await this.request(`/users/${userId}/latest`);
  },

  /**
   * 📤 スナップショット保存
   * POST /users/{user_id}/snapshot
   * body: { json_data: {...} }
   */
  async postSnapshot(userId, jsonData) {
    return await this.request(`/users/${userId}/snapshot`, "POST", jsonData);
  },
};
