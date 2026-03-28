import { computed, signal } from "@preact/signals";

import { websitesStore as dbWebsitesStore } from "@/services/db";
import { getSetting, setSetting } from "@/services/local-storage";
import type { Website } from "@/types/persistence";

// State
export const websites = signal<Website[]>([]);
export const selectedWebsites = signal<Set<string>>(new Set());
export const isSelectionMode = signal(false);

// Computed
export const sortedWebsites = computed(() => {
  return [...websites.value].sort((a, b) => a.order - b.order);
});

// Initialization
let initialized = false;

export async function initWebsitesStore() {
  if (initialized) return;
  initialized = true;

  // 1. Load from localStorage cache for fast first paint
  try {
    const cached = JSON.parse(getSetting("cachedWebsites") || "[]") as Website[];
    if (cached.length > 0) {
      websites.value = cached;
    }
  } catch (e) {
    console.error("Failed to parse cached websites", e);
  }

  // 2. Load from IndexedDB
  try {
    const dbData = await dbWebsitesStore.getAll();
    websites.value = dbData;
    // Update cache
    setSetting("cachedWebsites", JSON.stringify(dbData));
  } catch (e) {
    console.error("Failed to load websites from DB", e);
  }
}

// Actions
export async function addWebsite(website: Omit<Website, "id" | "order">) {
  const newWebsite: Website = {
    ...website,
    id: crypto.randomUUID(),
    order: websites.value.length, // Put at the end
  };

  websites.value = [...websites.value, newWebsite];
  await persistWebsites();
  await dbWebsitesStore.put(newWebsite);
}

export async function updateWebsite(id: string, updates: Partial<Omit<Website, "id">>) {
  websites.value = websites.value.map((w) => (w.id === id ? { ...w, ...updates } : w));
  await persistWebsites();

  const updated = websites.value.find((w) => w.id === id);
  if (updated) {
    await dbWebsitesStore.put(updated);
  }
}

export async function removeWebsite(id: string) {
  websites.value = websites.value.filter((w) => w.id !== id);
  selectedWebsites.value.delete(id);
  selectedWebsites.value = new Set(selectedWebsites.value);
  await persistWebsites();
  await dbWebsitesStore.delete(id);
}

export async function removeSelectedWebsites() {
  const idsToRemove = Array.from(selectedWebsites.value);
  websites.value = websites.value.filter((w) => !selectedWebsites.value.has(w.id));
  clearSelection();
  await persistWebsites();

  for (const id of idsToRemove) {
    await dbWebsitesStore.delete(id);
  }
}

export async function reorderWebsite(id: string, newIndex: number) {
  const currentWebsites = sortedWebsites.value;
  const oldIndex = currentWebsites.findIndex((w) => w.id === id);
  if (oldIndex === -1 || oldIndex === newIndex) return;

  const newWebsites = [...currentWebsites];
  const [moved] = newWebsites.splice(oldIndex, 1);
  newWebsites.splice(newIndex, 0, moved);

  // Update order property
  const updatedWebsites = newWebsites.map((w, index) => ({ ...w, order: index }));
  websites.value = updatedWebsites;

  await persistWebsites();

  // Persist all updated to DB
  for (const w of updatedWebsites) {
    await dbWebsitesStore.put(w);
  }
}

// Selection Actions
export function toggleSelect(id: string) {
  const newSet = new Set(selectedWebsites.value);
  if (newSet.has(id)) {
    newSet.delete(id);
  } else {
    newSet.add(id);
  }
  selectedWebsites.value = newSet;
  if (newSet.size > 0 && !isSelectionMode.value) {
    isSelectionMode.value = true;
  } else if (newSet.size === 0 && isSelectionMode.value) {
    isSelectionMode.value = false;
  }
}

export function selectAll() {
  selectedWebsites.value = new Set(websites.value.map((w) => w.id));
  isSelectionMode.value = true;
}

export function clearSelection() {
  selectedWebsites.value = new Set();
  isSelectionMode.value = false;
}

export function toggleSelectionMode() {
  if (isSelectionMode.value) {
    clearSelection();
  } else {
    isSelectionMode.value = true;
  }
}

// Debounced Persist to LocalStorage Cache
let persistTimeout: ReturnType<typeof setTimeout>;
async function persistWebsites() {
  clearTimeout(persistTimeout);
  persistTimeout = setTimeout(() => {
    setSetting("cachedWebsites", JSON.stringify(websites.value));
  }, 500);
}
