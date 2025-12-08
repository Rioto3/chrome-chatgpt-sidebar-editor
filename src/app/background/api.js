// background/api.js
const BASE_URL = "https://api.tubeclip.win/api/v1/ai-chat-editor-plus";

export const API = {
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

  // ---- Groups ----
  getGroups() { return this.request("/groups"); },
  createGroup(data) { return this.request("/groups", "POST", data); },
  updateGroup(id, data) { return this.request(`/groups/${id}`, "PATCH", data); },
  deleteGroup(id) { return this.request(`/groups/${id}`, "DELETE"); },
  clearGroups() { return this.request("/groups", "DELETE"); },

  // ---- Items ----
  getItems() { return this.request("/items"); },
  createItem(data) { return this.request("/items", "POST", data); },
  updateItem(id, data) { return this.request(`/items/${id}`, "PATCH", data); },
  deleteItem(id) { return this.request(`/items/${id}`, "DELETE"); },
  clearItems() { return this.request("/items", "DELETE"); },
};
