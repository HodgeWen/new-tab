import { afterEach, describe, expect, it } from "vitest";

import { clearDbForTests, groupsStore, websitesStore } from "@/services/db";

afterEach(async () => {
  await clearDbForTests();
});

describe("IndexedDB 服务", () => {
  it("websites CRUD", async () => {
    const w = {
      id: "w1",
      name: "Example",
      url: "https://example.com",
      icon: "",
      order: 0,
      groupId: null,
    };
    await websitesStore.put(w);
    expect(await websitesStore.get("w1")).toEqual(w);
    expect(await websitesStore.getAll()).toEqual([w]);
    await websitesStore.delete("w1");
    expect(await websitesStore.get("w1")).toBeUndefined();
    expect(await websitesStore.getAll()).toEqual([]);
  });

  it("groups CRUD", async () => {
    const g = {
      id: "g1",
      name: "Work",
      size: 0,
      order: 0,
      children: [],
    };
    await groupsStore.put(g);
    expect(await groupsStore.get("g1")).toEqual(g);
    expect(await groupsStore.getAll()).toEqual([g]);
    await groupsStore.delete("g1");
    expect(await groupsStore.getAll()).toEqual([]);
  });
});
