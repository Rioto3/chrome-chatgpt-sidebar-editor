// src/app/background/sync.js
const API_BASE = "https://ik1-402-33203.vs.sakura.ne.jp:3219/bookmarksState";

export class GroupSync {
  async create(group) {
    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(group),
      });
      if (!res.ok) throw new Error(await res.text());
      console.log("✅ Group created:", group.id);
      return await res.json();
    } catch (err) {
      console.error("❌ Group create failed:", err);
    }
  }

  async read(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}`);
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    } catch (err) {
      console.error("❌ Group read failed:", err);
    }
  }

  async update(id, data) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      console.log("🔁 Group updated:", id);
      return await res.json();
    } catch (err) {
      console.error("❌ Group update failed:", err);
    }
  }

  async delete(id) {
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(await res.text());
      console.log("🗑 Group deleted:", id);
    } catch (err) {
      console.error("❌ Group delete failed:", err);
    }
  }
}



export class ItemSync {
  async create(groupId, item) {
    try {
      const groupRes = await fetch(`${API_BASE}/${groupId}`);
      if (!groupRes.ok) throw new Error("Group not found");
      const group = await groupRes.json();

      group.items.push(item);

      const res = await fetch(`${API_BASE}/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: group.items }),
      });

      if (!res.ok) throw new Error(await res.text());
      console.log("✅ Item added to group:", groupId);
      return await res.json();
    } catch (err) {
      console.error("❌ Item create failed:", err);
    }
  }

  async update(groupId, itemId, newData) {
    try {
      const groupRes = await fetch(`${API_BASE}/${groupId}`);
      const group = await groupRes.json();

      const updatedItems = group.items.map((it) =>
        it.id === itemId ? { ...it, ...newData } : it
      );

      const res = await fetch(`${API_BASE}/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: updatedItems }),
      });

      console.log("🔁 Item updated:", itemId);
      return await res.json();
    } catch (err) {
      console.error("❌ Item update failed:", err);
    }
  }

  async delete(groupId, itemId) {
    try {
      const groupRes = await fetch(`${API_BASE}/${groupId}`);
      const group = await groupRes.json();

      const filteredItems = group.items.filter((it) => it.id !== itemId);

      await fetch(`${API_BASE}/${groupId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: filteredItems }),
      });

      console.log("🗑 Item deleted:", itemId);
    } catch (err) {
      console.error("❌ Item delete failed:", err);
    }
  }
}
