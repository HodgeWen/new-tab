import { useEffect, useState } from "preact/hooks";

import { WebsiteCard } from "./WebsiteCard";

import {
  isSelectionMode,
  reorderWebsite,
  sortedWebsites,
  toggleSelectionMode,
} from "@/stores/websitesStore";
import type { Website } from "@/types/persistence";

interface ContextMenuState {
  x: number;
  y: number;
  website: Website;
}

export function WebsitesGrid({ onEdit }: { onEdit: (w: Website) => void }) {
  const websites = sortedWebsites.value;
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragTargetId, setDragTargetId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const handleDragStart = (e: DragEvent, id: string) => {
    if (isSelectionMode.value) {
      e.preventDefault();
      return;
    }
    setDraggedId(id);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
    }
  };

  const handleDragOver = (e: DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === id) return;
    setDragTargetId(id);
  };

  const handleDrop = async (e: DragEvent, targetId: string) => {
    e.preventDefault();
    setDragTargetId(null);
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      return;
    }

    const currentWebsites = sortedWebsites.value;
    const targetIndex = currentWebsites.findIndex((w) => w.id === targetId);

    await reorderWebsite(draggedId, targetIndex);
    setDraggedId(null);
  };

  const handleContextMenu = (e: MouseEvent, website: Website) => {
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      website,
    });
  };

  const closeContextMenu = () => setContextMenu(null);

  useEffect(() => {
    const handleGlobalClick = () => closeContextMenu();
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  return (
    <>
      <div
        class="grid w-full max-w-7xl grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-md rounded-2xl border border-foreground/5 bg-secondary/20 p-lg shadow-lg backdrop-blur-xl transition-all duration-300 sm:gap-lg sm:p-xl"
        role="region"
        aria-label="网站快捷方式网格"
      >
        {websites.map((website) => (
          <WebsiteCard
            key={website.id}
            website={website}
            onContextMenu={handleContextMenu}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDragging={draggedId === website.id}
            isDragTarget={dragTargetId === website.id}
          />
        ))}

        {!isSelectionMode.value && (
          <div
            class="group flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-cta/30 bg-foreground/[0.03] p-2 text-center shadow-sm transition-all duration-200 hover:scale-105 hover:border-cta/60 hover:bg-foreground/[0.08]"
            onClick={() => onEdit({} as Website)}
          >
            <div class="mb-1 flex size-8 items-center justify-center rounded-full bg-cta/10 text-cta group-hover:bg-cta/20">
              <span class="text-xl font-bold">+</span>
            </div>
            <span class="mt-1 font-display text-xs text-foreground">添加快捷方式</span>
          </div>
        )}
      </div>

      {contextMenu && (
        <div
          class="fixed z-50 min-w-40 rounded-lg border border-foreground/10 bg-background py-1 shadow-xl"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            class="w-full px-4 py-2 text-left text-sm hover:bg-foreground/5"
            onClick={() => {
              onEdit(contextMenu.website);
              closeContextMenu();
            }}
          >
            编辑
          </button>
          <button
            class="w-full px-4 py-2 text-left text-sm hover:bg-foreground/5"
            onClick={() => {
              toggleSelectionMode();
              closeContextMenu();
            }}
          >
            选择多个
          </button>
        </div>
      )}
    </>
  );
}
